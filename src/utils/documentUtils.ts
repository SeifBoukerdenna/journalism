// src/utils/documentUtils.ts

import { ImportedSection } from "../components/enhanced/ScriptImporter";

/**
 * Estimates duration based on word count
 * @param text The text content to analyze
 * @returns Duration in seconds
 */
export const estimateScriptDuration = (text: string): number => {
  // Assume ~130 words per minute for speech
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const durationMinutes = words / 130;
  return Math.round(durationMinutes * 60); // Convert to seconds
};

/**
 * Detects potential section headings in a document
 * @param text The document text
 * @returns Array of detected headings with their positions
 */
export const detectHeadings = (
  text: string
): { title: string; position: number }[] => {
  const lines = text.split("\n");
  const result: { title: string; position: number }[] = [];
  let position = 0;

  for (const line of lines) {
    const trimmedLine = line.trim();

    // A heading is likely a short line that doesn't end with punctuation
    // and has fewer than ~8 words
    const isPotentialHeading =
      trimmedLine.length > 0 &&
      trimmedLine.length < 60 &&
      !trimmedLine.match(/[.,:;?!]$/) &&
      trimmedLine.split(/\s+/).length < 8;

    if (isPotentialHeading) {
      result.push({
        title: trimmedLine,
        position,
      });
    }

    position += line.length + 1; // +1 for the newline
  }

  return result;
};

/**
 * Processes a document into script sections
 * @param text Raw document text
 * @returns Array of script sections
 */
export const processDocumentIntoSections = (
  text: string,
  options = {
    splitBySections: true,
    detectionMethod: "headings" as "headings" | "paragraphs",
    cleanFormatting: true,
    documentTitle: "Imported Script",
  }
): { title: string; content: string; duration: number }[] => {
  const sections: { title: string; content: string; duration: number }[] = [];

  if (!options.splitBySections) {
    // Return a single section with all content
    const duration = estimateScriptDuration(text);
    return [
      {
        title: options.documentTitle,
        content: options.cleanFormatting ? cleanTextFormatting(text) : text,
        duration,
      },
    ];
  }

  if (options.detectionMethod === "headings") {
    // Split by detected headings
    const detectedHeadings = detectHeadings(text);

    if (detectedHeadings.length === 0) {
      // No headings found, return a single section
      const duration = estimateScriptDuration(text);
      return [
        {
          title: options.documentTitle,
          content: options.cleanFormatting ? cleanTextFormatting(text) : text,
          duration,
        },
      ];
    }

    // Process each section
    for (let i = 0; i < detectedHeadings.length; i++) {
      const heading = detectedHeadings[i];
      const nextHeading = detectedHeadings[i + 1];

      const startPos = heading.position + heading.title.length;
      const endPos = nextHeading ? nextHeading.position : text.length;

      const sectionContent = text.substring(startPos, endPos).trim();
      const cleanedContent = options.cleanFormatting
        ? cleanTextFormatting(sectionContent)
        : sectionContent;
      const duration = estimateScriptDuration(cleanedContent);

      sections.push({
        title: heading.title,
        content: cleanedContent,
        duration,
      });
    }
  } else {
    // Split by paragraphs or natural breaks
    const paragraphs = text.split(/\n\s*\n/);

    if (paragraphs.length === 0) {
      return [
        {
          title: options.documentTitle,
          content: "",
          duration: 0,
        },
      ];
    }

    // Use first paragraph as a title if it's short enough
    let title = options.documentTitle;
    let startIndex = 0;

    if (paragraphs[0].length < 100 && paragraphs.length > 1) {
      title = paragraphs[0].trim();
      startIndex = 1;
    }

    // Group paragraphs into logical sections (simplified approach)
    const content = paragraphs.slice(startIndex).join("\n\n");
    const cleanedContent = options.cleanFormatting
      ? cleanTextFormatting(content)
      : content;
    const duration = estimateScriptDuration(cleanedContent);

    sections.push({
      title,
      content: cleanedContent,
      duration,
    });
  }

  return sections;
};

/**
 * Cleans up text formatting for better display
 * @param text Text to clean
 * @returns Cleaned text
 */
export const cleanTextFormatting = (text: string): string => {
  return text
    .replace(/\r\n/g, "\n") // Normalize line endings
    .replace(/\n{3,}/g, "\n\n") // Replace multiple line breaks with double line breaks
    .replace(/\t/g, "    ") // Replace tabs with spaces
    .replace(/[ ]{2,}/g, " ") // Replace multiple spaces with a single space
    .replace(/^\s+|\s+$/gm, "") // Trim whitespace from beginning and end of each line
    .trim(); // Trim the entire text
};

/**
 * Extracts metadata from document content
 * @param text The document text
 * @returns Object with metadata like title, author, etc.
 */
export const extractDocumentMetadata = (
  text: string
): { title?: string; author?: string } => {
  const metadata: { title?: string; author?: string } = {};

  // Look for title (first non-empty line if short enough)
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length > 0 && lines[0].length < 80) {
    metadata.title = lines[0];
  }

  // Look for author (might be prefixed with "By" or "Author:")
  const authorRegex = /(?:By|Author|Written by)[:\s]+([^\n]+)/i;
  const authorMatch = text.match(authorRegex);

  if (authorMatch && authorMatch[1]) {
    metadata.author = authorMatch[1].trim();
  }

  return metadata;
};

export const processPdfContent = (
  text: string
): { title: string; sections: ImportedSection[] } => {
  // Extract a potential title from the beginning
  const lines = text.split("\n");
  let title = "Imported PDF";
  let contentStartIndex = 0;

  // Try to find a title (usually at the beginning)
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    if (lines[i].trim().length > 0 && lines[i].length < 100) {
      title = lines[i].trim();
      contentStartIndex = i + 1;
      break;
    }
  }

  // Find potential section headers (Pages, or lines starting with "Section", "Chapter", etc.)
  const sectionMatches: { title: string; index: number }[] = [];

  for (let i = contentStartIndex; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check for page markers from PDF.js extraction
    if (line.match(/^## Page \d+$/)) {
      sectionMatches.push({ title: line.replace("## ", ""), index: i });
      continue;
    }

    // Check for potential section headers
    if (
      line.length > 0 &&
      line.length < 80 &&
      !line.endsWith(".") &&
      (line.match(/^[A-Z]/) || // Starts with uppercase
        line.match(/^(Section|Chapter|Part|Unit|Module|Topic)/i))
    ) {
      // Common section markers
      sectionMatches.push({ title: line, index: i });
    }
  }

  // Create sections based on the matches
  const sections: ImportedSection[] = [];

  if (sectionMatches.length === 0) {
    // No sections found, create a single section with all content
    const content = lines.slice(contentStartIndex).join("\n");
    sections.push({
      title: "Main Content",
      content,
      duration: Math.round((content.split(/\s+/).length / 130) * 60), // Estimate duration
    });
  } else {
    // Create sections based on found headers
    for (let i = 0; i < sectionMatches.length; i++) {
      const sectionStart = sectionMatches[i].index + 1; // Skip the header line
      const sectionEnd =
        i < sectionMatches.length - 1
          ? sectionMatches[i + 1].index
          : lines.length;

      const sectionContent = lines
        .slice(sectionStart, sectionEnd)
        .join("\n")
        .trim();

      if (sectionContent.length > 0) {
        sections.push({
          title: sectionMatches[i].title,
          content: sectionContent,
          duration: Math.round((sectionContent.split(/\s+/).length / 130) * 60), // Estimate duration
        });
      }
    }
  }

  return { title, sections };
};
