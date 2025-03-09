// src/utils/pdfUtils.ts
import * as pdfjs from "pdfjs-dist";
import { ImportedSection } from "../components/enhanced/ScriptImporter";

// Set the worker source
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFMetadata {
  info: {
    Title?: string;
    Author?: string;
    Subject?: string;
    Keywords?: string;
    Creator?: string;
    Producer?: string;
    CreationDate?: string;
    ModDate?: string;
    [key: string]: any;
  };
  metadata?: any;
}

interface PDFTextItem {
  str: string;
  dir: string;
  width: number;
  height: number;
  transform: number[];
  fontName: string;
  hasEOL?: boolean;
}

interface PdfProcessingOptions {
  detectHeadings: boolean;
  detectFontChanges: boolean;
  cleanWhitespace: boolean;
  combinePages: boolean;
}

/**
 * Extract text and structure from a PDF file
 */
export const extractPdfContent = async (
  file: File,
  options: PdfProcessingOptions = {
    detectHeadings: true,
    detectFontChanges: true,
    cleanWhitespace: true,
    combinePages: true,
  },
  onProgress?: (progress: number, message: string) => void
): Promise<{ title: string; sections: ImportedSection[] }> => {
  try {
    // Report progress
    const reportProgress = (percent: number, message: string) => {
      if (onProgress) onProgress(percent, message);
    };

    reportProgress(0, "Loading PDF document...");

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Load the PDF document
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    // Initialize result
    let documentTitle = file.name.replace(/\.[^/.]+$/, "");
    const sections: ImportedSection[] = [];

    // Extract metadata if available
    try {
      reportProgress(5, "Extracting document metadata...");
      const metadata = (await pdf.getMetadata()) as PDFMetadata;

      if (metadata && metadata.info) {
        if (metadata.info.Title) {
          documentTitle = metadata.info.Title;
        }
      }
    } catch (error) {
      console.warn("Could not extract PDF metadata:", error);
    }

    // Extract text from all pages
    reportProgress(10, `Processing PDF pages (0/${pdf.numPages})...`);

    // For detecting headings based on font differences
    const fontSizes: { [key: string]: number[] } = {};
    const fontStyles: { [key: string]: number } = {};
    let maxFontSize = 0;

    // Extract text content from each page
    const pageContents: { text: string; items: PDFTextItem[] }[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      reportProgress(
        10 + (70 * i) / pdf.numPages,
        `Processing page ${i}/${pdf.numPages}...`
      );

      // Get the page
      const page = await pdf.getPage(i);

      // Get viewport for scale calculations
      //   const viewport = page.getViewport({ scale: 1.0 });

      // Extract text content
      const textContent = await page.getTextContent();

      // Store page content for processing
      const pageText = textContent.items.map((item: any) => item.str).join(" ");

      pageContents.push({
        text: pageText,
        items: textContent.items as PDFTextItem[],
      });

      // Analyze font sizes for heading detection
      if (options.detectFontChanges) {
        textContent.items.forEach((item: any) => {
          const fontName = item.fontName || "unknown";
          if (!fontSizes[fontName]) {
            fontSizes[fontName] = [];
          }

          // Get transform scale which correlates to font size
          // PDF.js doesn't directly give font size, but we can estimate from the transform
          const transform = item.transform;
          if (transform && transform.length >= 6) {
            // The scaling factors are at indices 0 and 3
            const scaleX = Math.abs(transform[0]);
            const scaleY = Math.abs(transform[3]);
            const fontSize = Math.max(scaleX, scaleY);

            fontSizes[fontName].push(fontSize);
            maxFontSize = Math.max(maxFontSize, fontSize);

            fontStyles[`${fontName}_${fontSize}`] =
              (fontStyles[`${fontName}_${fontSize}`] || 0) + 1;
          }
        });
      }
    }

    reportProgress(80, "Analyzing document structure...");

    // Process pages to identify sections
    // let currentSection: ImportedSection | null = null;

    // If we're not combining pages, each page becomes a section
    if (!options.combinePages) {
      pageContents.forEach((page, index) => {
        sections.push({
          title: `Page ${index + 1}`,
          content: page.text,
          duration: Math.round((page.text.split(/\s+/).length / 130) * 60), // Estimate duration
        });
      });
    } else {
      // Analyze the document to identify potential headings and section breaks

      // First, determine heading styles based on font analysis
      let headingFonts: string[] = [];

      if (options.detectFontChanges && Object.keys(fontSizes).length > 0) {
        // Find fonts that are used for larger text (potential headings)
        // This is a simple heuristic - fonts with sizes significantly larger than the average

        // Calculate average font size
        let totalSize = 0;
        let totalItems = 0;

        Object.entries(fontSizes).forEach(([_, sizes]) => {
          sizes.forEach((size) => {
            totalSize += size;
            totalItems++;
          });
        });

        const avgFontSize = totalSize / totalItems;

        // Find fonts that are at least 20% larger than average - these might be headings
        Object.entries(fontStyles).forEach(([fontStyle]) => {
          const [_, sizeStr] = fontStyle.split("_");
          const size = parseFloat(sizeStr);

          if (size > avgFontSize * 1.2) {
            headingFonts.push(fontStyle);
          }
        });
      }

      // Process each page
      let combinedText = "";
      let potentialSections: { title: string; startIndex: number }[] = [];

      pageContents.forEach((page, _) => {
        const pageText = page.text;
        const pageTextStart = combinedText.length;

        // Add page text to combined content
        combinedText += pageText + "\n\n";

        // Process text to identify potential section headings
        if (options.detectHeadings) {
          const lines = pageText.split("\n");
          let lineStart = pageTextStart;

          lines.forEach((line, _) => {
            line = line.trim();

            // Skip empty lines
            if (line.length === 0) {
              lineStart += line.length + 1; // +1 for the newline
              return;
            }

            // Check if this line might be a heading
            const isPotentialHeading =
              // Short lines that don't end with punctuation are often headings
              (line.length < 100 && !line.match(/[.,:;?!]$/)) ||
              // Lines that match common section identifiers
              line.match(
                /^(Chapter|Section|Part|Unit|Module|Topic|Lesson)\s+\d+/i
              ) ||
              // Roman numerals often indicate sections
              line.match(/^[IVXLCDM]+\.\s+/);

            if (isPotentialHeading) {
              potentialSections.push({
                title: line,
                startIndex: lineStart,
              });
            }

            lineStart += line.length + 1; // +1 for the newline
          });
        }
      });

      // Process the potential sections
      if (potentialSections.length > 0) {
        for (let i = 0; i < potentialSections.length; i++) {
          const sectionStart = potentialSections[i].startIndex;
          const nextSectionStart =
            i < potentialSections.length - 1
              ? potentialSections[i + 1].startIndex
              : combinedText.length;

          const sectionContent = combinedText
            .substring(sectionStart, nextSectionStart)
            .trim();

          if (sectionContent.length > 0) {
            sections.push({
              title: potentialSections[i].title,
              content: sectionContent,
              duration: Math.round(
                (sectionContent.split(/\s+/).length / 130) * 60
              ),
            });
          }
        }
      } else {
        // No sections identified, create a single section
        sections.push({
          title: "Main Content",
          content: combinedText,
          duration: Math.round((combinedText.split(/\s+/).length / 130) * 60),
        });
      }
    }

    // Clean up whitespace if needed
    if (options.cleanWhitespace) {
      sections.forEach((section) => {
        section.content = section.content
          .replace(/\s+/g, " ")
          .replace(/ \n/g, "\n")
          .replace(/\n /g, "\n")
          .replace(/\n\n+/g, "\n\n")
          .trim();
      });
    }

    reportProgress(100, "PDF processing complete");

    return {
      title: documentTitle,
      sections:
        sections.length > 0
          ? sections
          : [
              {
                title: "Imported Content",
                content: "No content could be extracted from this PDF.",
                duration: 0,
              },
            ],
    };
  } catch (error: any) {
    console.error("PDF extraction error:", error);
    throw new Error(`Failed to process PDF: ${error.message}`);
  }
};

/**
 * Estimate if text is likely a heading based on properties
 */
// function isLikelyHeading(text: string): boolean {
//   // Remove common markers that might appear in headings
//   const cleanText = text.replace(
//     /^(Chapter|Section|Part|Unit|Module|Topic|Lesson)\s+\d+[.:]\s*/i,
//     ""
//   );

//   // Check various properties that suggest this might be a heading
//   return (
//     // Short text (but not too short)
//     cleanText.length > 3 &&
//     cleanText.length < 100 &&
//     // Doesn't end with punctuation typically found in regular sentences
//     !cleanText.match(/[.,:;?!]$/) &&
//     // Fewer than 15 words
//     cleanText.split(/\s+/).length < 15 &&
//     // Often headings are title case or ALL CAPS
//     (cleanText === cleanText.toUpperCase() ||
//       cleanText.charAt(0) === cleanText.charAt(0).toUpperCase())
//   );
// }
