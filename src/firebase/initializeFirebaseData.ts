// src/firebase/initializeFirebaseData.ts
import {
  collection,
  getDocs,
  writeBatch,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db } from "./config";
import { COLLECTIONS } from "./firebaseService";

// Function to check if a collection is empty
const isCollectionEmpty = async (collectionName: string) => {
  const querySnapshot = await getDocs(collection(db, collectionName));
  return querySnapshot.empty;
};

// Convert JavaScript Date objects to Firestore Timestamps
const convertDatesToTimestamps = (data: any) => {
  const newData = { ...data };

  // Convert date objects to Firestore timestamps
  Object.keys(newData).forEach((key) => {
    if (newData[key] instanceof Date) {
      newData[key] = Timestamp.fromDate(newData[key]);
    } else if (typeof newData[key] === "object" && newData[key] !== null) {
      // Handle nested objects (but not arrays)
      if (newData[key] && !Array.isArray(newData[key])) {
        newData[key] = convertDatesToTimestamps(newData[key]);
      } else if (Array.isArray(newData[key])) {
        // Handle arrays
        newData[key] = newData[key].map((item: any) => {
          if (typeof item === "object" && item !== null) {
            return convertDatesToTimestamps(item);
          }
          return item;
        });
      }
    }
  });

  return newData;
};

// Initialize Firebase with sample data if collections are empty
export const initializeFirebaseData = async () => {
  console.log("Checking if Firebase initialization is needed...");

  try {
    // Check if any of the main collections are empty
    const [topicsEmpty, notesEmpty, plansEmpty, scriptsEmpty] =
      await Promise.all([
        isCollectionEmpty(COLLECTIONS.TOPICS),
        isCollectionEmpty(COLLECTIONS.RESEARCH_NOTES),
        isCollectionEmpty(COLLECTIONS.CONTENT_PLANS),
        isCollectionEmpty(COLLECTIONS.SCRIPTS),
      ]);

    // If all collections have data, no need to initialize
    if (!topicsEmpty && !notesEmpty && !plansEmpty && !scriptsEmpty) {
      console.log("Firebase data already exists, skipping initialization");
      return;
    }

    console.log("Initializing Firebase with sample data...");

    // Initialize with batch writes for atomic operation
    const batch = writeBatch(db);

    // Add topics
    if (topicsEmpty) {
      console.log("Adding sample topics...");
      sampleTopics.forEach((topic) => {
        const topicRef = doc(db, COLLECTIONS.TOPICS, topic.id);
        const topicWithTimestamps = convertDatesToTimestamps(topic);
        batch.set(topicRef, topicWithTimestamps);
      });
    }

    // Add research notes
    if (notesEmpty) {
      console.log("Adding sample research notes...");
      sampleResearchNotes.forEach((note) => {
        const noteRef = doc(db, COLLECTIONS.RESEARCH_NOTES, note.id);
        const noteWithTimestamps = convertDatesToTimestamps(note);
        batch.set(noteRef, noteWithTimestamps);
      });
    }

    // Add content plans
    if (plansEmpty) {
      console.log("Adding sample content plans...");
      sampleContentPlans.forEach((plan) => {
        const planRef = doc(db, COLLECTIONS.CONTENT_PLANS, plan.id);
        const planWithTimestamps = convertDatesToTimestamps(plan);
        batch.set(planRef, planWithTimestamps);
      });
    }

    // Add scripts
    if (scriptsEmpty) {
      console.log("Adding sample scripts...");
      sampleScripts.forEach((script) => {
        const scriptRef = doc(db, COLLECTIONS.SCRIPTS, script.id);
        const scriptWithTimestamps = convertDatesToTimestamps(script);
        batch.set(scriptRef, scriptWithTimestamps);
      });
    }

    // Commit all the batch operations
    await batch.commit();
    console.log("Firebase initialization complete");
  } catch (error) {
    console.error("Error initializing Firebase data:", error);
    throw error;
  }
};

// Sample data for initialization
const sampleTopics = [
  {
    id: "1",
    title: "Electoral Reform",
    description:
      "Examining various electoral systems, voting rights, and political representation.",
    tags: ["Politics", "Democracy", "Voting"],
    createdAt: new Date(2024, 0, 15),
    updatedAt: new Date(2024, 1, 20),
  },
  {
    id: "2",
    title: "Climate Policy",
    description:
      "Analysis of climate change legislation, international agreements, and environmental impacts.",
    tags: ["Environment", "Policy", "Climate Change"],
    createdAt: new Date(2024, 1, 5),
    updatedAt: new Date(2024, 1, 25),
  },
  {
    id: "3",
    title: "Healthcare Systems",
    description:
      "Comparing healthcare models, access issues, and policy proposals.",
    tags: ["Healthcare", "Policy", "Reform"],
    createdAt: new Date(2024, 1, 10),
    updatedAt: new Date(2024, 1, 28),
  },
  {
    id: "4",
    title: "Economic Inequality",
    description:
      "Examining wealth gaps, economic mobility, and policy solutions.",
    tags: ["Economics", "Inequality", "Social Issues"],
    createdAt: new Date(2024, 2, 1),
    updatedAt: new Date(2024, 2, 10),
  },
  {
    id: "5",
    title: "Media Literacy",
    description:
      "Exploring the importance of critical thinking in consuming media and news content.",
    tags: ["Media", "Education", "Social Media"],
    createdAt: new Date(2024, 2, 5),
    updatedAt: new Date(2024, 2, 15),
  },
  {
    id: "6",
    title: "Digital Privacy",
    description:
      "Analyzing privacy issues in the digital age, surveillance, and policy options.",
    tags: ["Technology", "Privacy", "Rights"],
    createdAt: new Date(2024, 2, 10),
    updatedAt: new Date(2024, 2, 20),
  },
];

const sampleResearchNotes = [
  {
    id: "1",
    topicId: "1",
    title: "Ranked Choice Voting Analysis",
    content: `Ranked Choice Voting (RCV) allows voters to rank candidates in order of preference. If no candidate receives a majority of first-choice votes, the candidate with the fewest votes is eliminated, and their votes are redistributed based on the next choice on each ballot. This process continues until one candidate has a majority.

Key benefits:
- Eliminates the "spoiler effect" where similar candidates split votes
- Encourages more positive campaigning as candidates seek to be second choices
- May increase voter participation and satisfaction

Countries using RCV include:
- Australia (House of Representatives)
- Ireland (Presidential elections)
- New Zealand (certain local elections)

Several U.S. cities have adopted RCV, including San Francisco, Minneapolis, and New York City. Maine uses it for federal elections.

Research shows RCV tends to elect more moderate candidates and can increase diversity in representation.`,
    sources: [
      "https://www.fairvote.org/rcv",
      "Electoral Reform Journal, Vol. 42",
    ],
    createdAt: new Date(2024, 1, 16),
    updatedAt: new Date(2024, 1, 22),
  },
  {
    id: "2",
    topicId: "1",
    title: "U.S. Voter Turnout Trends",
    content: `Historical U.S. voter turnout in presidential elections:
- 2020: 66.2% (highest in a century)
- 2016: 60.1%
- 2012: 58.6%
- 2008: 61.6%
- 2004: 60.1%
- 2000: 54.2%

Factors affecting turnout:
1. Registration requirements
2. Early voting options
3. Vote-by-mail accessibility
4. Voter ID laws
5. Election day as a holiday
6. Compulsory voting (not in U.S.)

Countries with highest turnout:
- Belgium: ~90% (compulsory)
- Sweden: ~87% (non-compulsory)
- Denmark: ~86% (non-compulsory)

Interesting fact: Weekend voting, automatic registration, and election holidays all correlate with higher participation rates internationally.`,
    sources: [
      "U.S. Elections Commission",
      "Voter Participation Center",
      "Pew Research",
    ],
    createdAt: new Date(2024, 1, 25),
    updatedAt: new Date(2024, 1, 25),
  },
  {
    id: "3",
    topicId: "2",
    title: "Paris Agreement Goals and Progress",
    content: `The Paris Agreement (2015) set a goal to limit global temperature increase to well below 2°C above pre-industrial levels, with efforts to limit to 1.5°C.

Key mechanisms:
- Nationally Determined Contributions (NDCs): Countries submit climate action plans
- Global Stocktake: Assessment of collective progress every 5 years
- Climate finance: Developed countries provide financial resources to assist developing countries

Current status (as of late 2023):
- Global emissions continue to rise despite pledges
- Current policies track toward 2.7-3.1°C warming by 2100
- Major emitters like China, US, India, EU have strengthened targets but implementation lags
- Many countries aren't meeting their NDC commitments

For video: Use the "emissions gap" visual showing the difference between current policies, pledges, and what's needed for 1.5°C and 2°C targets.`,
    sources: ["UNFCCC", "Climate Action Tracker", "IPCC 6th Assessment Report"],
    createdAt: new Date(2024, 2, 5),
    updatedAt: new Date(2024, 2, 8),
  },
  {
    id: "4",
    topicId: "4",
    title: "Wealth Inequality Statistics",
    content: `Key wealth inequality statistics:

Global:
- Richest 1% own 46% of global wealth
- Bottom 50% own just 1.2% of global wealth
- Billionaire wealth increased by $3.9 trillion during pandemic while worker wages stagnated

United States:
- Top 1% hold more wealth than bottom 90% combined
- CEO-to-worker compensation ratio: 399-to-1 (up from 20-to-1 in 1965)
- Racial wealth gap: Median white family has 8x the wealth of median Black family, 5x the wealth of median Hispanic family

Historical context:
- U.S. inequality has grown significantly since 1980
- Current levels comparable to 1920s before Great Depression
- Most developed nations have less inequality than U.S.

Proposed solutions to research further:
- Wealth taxes
- Estate tax reform
- Higher minimum wages
- Universal basic income
- Worker ownership/cooperatives`,
    sources: [
      "World Inequality Database",
      "Federal Reserve",
      "Economic Policy Institute",
    ],
    createdAt: new Date(2024, 2, 12),
    updatedAt: new Date(2024, 2, 15),
  },
  {
    id: "5",
    topicId: "5",
    title: "Social Media and Misinformation",
    content: `Research on social media's role in spreading misinformation:

Key findings:
- False news stories are 70% more likely to be retweeted than true stories
- Emotional content (especially anger) spreads faster on social platforms
- Average user cannot identify fake news 75% of the time
- Echo chambers intensify belief in misinformation
- Correcting misinformation often causes "backfire effect" strengthening original belief

Platform issues:
- Algorithmic amplification of engaging but misleading content
- Monetization structures that reward sensational claims
- Insufficient content moderation resources
- Lack of transparency in algorithmic decision-making
- Cross-platform coordination of misinformation campaigns

Educational approaches:
- "Prebunking" - teaching critical skills before exposure to misinfo
- Lateral reading techniques
- Source evaluation frameworks
- Understanding algorithm and business models
- Emotional awareness training

Visual elements for video:
- Diagram showing information spread patterns on different platforms
- Comparison of engagement metrics between accurate vs. false content
- Timeline of platform policy changes
- "Red flag" indicators for suspicious content`,
    sources: [
      "Reuters Institute Digital News Report",
      "Science (Vosoughi et al, 2018)",
      "Journal of Media Literacy",
    ],
    createdAt: new Date(2024, 2, 5),
    updatedAt: new Date(2024, 2, 10),
  },
];

const sampleContentPlans = [
  {
    id: "1",
    title: "Electoral Reform Explained",
    description:
      "A comprehensive overview of different voting systems and their impact on representation and democracy. Will cover FPTP, RCV, proportional systems, and more.",
    scheduledDate: new Date(2024, 3, 20),
    topics: ["1"],
    status: "scripting",
    createdAt: new Date(2024, 2, 1),
    updatedAt: new Date(2024, 2, 15),
  },
  {
    id: "2",
    title: "Climate Policy Debate",
    description:
      "Analysis of current climate policy proposals and their potential effectiveness. Will compare different approaches including carbon tax, cap and trade, regulations, and incentives.",
    scheduledDate: new Date(2024, 4, 10),
    topics: ["2"],
    status: "research",
    createdAt: new Date(2024, 2, 8),
    updatedAt: new Date(2024, 2, 20),
  },
  {
    id: "3",
    title: "Healthcare Systems Compared",
    description:
      "Comparing healthcare systems from around the world and evaluating their strengths and weaknesses.",
    scheduledDate: new Date(2024, 5, 15),
    topics: ["3"],
    status: "planning",
    createdAt: new Date(2024, 2, 12),
    updatedAt: new Date(2024, 2, 12),
  },
  {
    id: "4",
    title: "Wealth Gap: Causes and Solutions",
    description:
      "Examining the growing wealth inequality, its historical context, and potential policy solutions.",
    scheduledDate: new Date(2024, 3, 5),
    topics: ["4"],
    status: "idea",
    createdAt: new Date(2024, 2, 18),
    updatedAt: new Date(2024, 2, 18),
  },
  {
    id: "5",
    title: "Voting Rights Explained",
    description:
      "A detailed look at voting rights, their history, recent developments, and ongoing challenges.",
    scheduledDate: new Date(2024, 2, 15),
    topics: ["1"],
    status: "published",
    createdAt: new Date(2024, 1, 10),
    updatedAt: new Date(2024, 2, 15),
  },
  {
    id: "6",
    title: "Media Literacy 101",
    description:
      "A guide to developing critical thinking skills for navigating today's complex media landscape.",
    scheduledDate: new Date(2024, 3, 25),
    topics: ["5"],
    status: "scripting",
    createdAt: new Date(2024, 2, 15),
    updatedAt: new Date(2024, 2, 22),
  },
  {
    id: "7",
    title: "Digital Privacy in 2025",
    description:
      "An exploration of current privacy issues, surveillance capitalism, and how to protect your data.",
    scheduledDate: new Date(2024, 4, 20),
    topics: ["6"],
    status: "research",
    createdAt: new Date(2024, 2, 20),
    updatedAt: new Date(2024, 2, 25),
  },
];

// Add more sample scripts
const sampleScripts = [
  {
    id: "1",
    contentPlanId: "1",
    title: "Electoral Reform Explained",
    sections: [
      {
        id: "1-1",
        title: "Introduction",
        content: `[Camera: Medium shot, presenter speaking directly to camera]

Hello and welcome back to the channel. Today we're diving into electoral reform - a topic that might sound dry but actually shapes the very foundation of our democracy.

Think about it - the way we count votes determines who gets elected, which policies get implemented, and ultimately, whose voices get heard in our political system.

[Graphics: Show title card "Electoral Reform Explained"]

In this video, we'll break down:
- How different voting systems work
- Their impacts on representation and policy
- Current reform movements gaining traction
- And what changes might actually be possible

Whether you're frustrated with our current system or just curious about alternatives, stay tuned. The way we vote might be more important - and more interesting - than you think.`,
        notes:
          "Keep introduction under 1 minute. Use neutral tone to appeal to viewers across political spectrum.",
        duration: 60,
      },
      {
        id: "1-2",
        title: "First-Past-the-Post Explained",
        content: `[Camera: Move to side angle with graphics appearing on screen]

Let's start with what most Americans are familiar with: our current system called "First-Past-the-Post" or FPTP.

[Graphics: Simple ballot with checkmark next to one candidate]

Here's how it works: You cast a single vote for one candidate. The person with the most votes wins, even if they don't get a majority. Simple, right?

But this simplicity comes with some serious drawbacks:

[Graphics: Show split vote scenario with percentages]

First, there's the "spoiler effect." When similar candidates split the vote, someone with minority support can win. Imagine 60% of voters prefer progressive policies, but they split between two candidates getting 30% each, allowing a conservative candidate to win with 40%.

[Graphics: Show two-party dominance visual]

Second, FPTP tends to create two-party systems over time. Third parties struggle to break through because voters fear "wasting" their vote on someone who can't win.

Finally, it creates "safe districts" where one party dominates, reducing competition and accountability.

[Camera: Return to presenter]

Despite these flaws, FPTP has persisted because it's simple to understand and implement. But many democracies around the world have moved to alternative systems - which we'll explore next.`,
        notes:
          "Use simple visual examples. Avoid sounding like I'm advocating for change - just explaining pros/cons objectively.",
        duration: 120,
      },
      {
        id: "1-3",
        title: "Ranked Choice Voting",
        content: `[Camera: Medium shot with animated graphics]

Now let's look at an alternative that's gaining traction in the US: Ranked Choice Voting, or RCV.

[Graphics: Show RCV ballot with rankings]

Instead of picking just one candidate, voters rank them in order of preference: 1st choice, 2nd choice, 3rd choice, and so on.

Here's where it gets interesting. If no candidate receives a majority of first-choice votes, the candidate with the fewest votes is eliminated. Voters who picked that candidate have their votes transferred to their second choice. This process continues until someone crosses the 50% threshold.

[Animation: Show vote redistribution process]

This system has several potential advantages:
- It eliminates the spoiler effect
- It can reduce negative campaigning since candidates want to be second choices
- It gives voters more choices without the "wasted vote" fear
- It ensures winners have broader support

[Camera: Close-up]

RCV isn't just theoretical. It's used in Australia's national elections, Ireland's presidential elections, and increasingly in the United States - including Maine's federal elections and in cities like San Francisco, Minneapolis, and New York.

[Graphics: Map highlighting RCV jurisdictions]

Critics argue it's more complicated for voters and can lead to longer counting times. But advocates say these concerns are outweighed by more representative outcomes.

In practice, research shows RCV tends to elect more moderate candidates and can increase the diversity of elected officials. It also appears to reduce negative campaigning since candidates don't want to alienate their opponents' supporters.`,
        notes:
          "Focus on the mechanics and outcomes, not advocacy. Use visual animations to make the process clear.",
        duration: 150,
      },
      {
        id: "1-4",
        title: "Proportional Representation",
        content: `[Camera: Medium shot with graphics panel]

Now let's explore systems designed for legislatures rather than single-office positions: proportional representation.

[Graphics: Show PR system diagram]

The core idea is simple: if a party wins 30% of the votes, they should get roughly 30% of the seats. This differs fundamentally from our winner-take-all districts where 49% of voters can be left with zero representation.

[Animation: Compare FPTP vs PR outcomes]

There are several forms of proportional representation:

In party-list systems, voters select a party rather than a candidate. Parties then receive seats proportional to their vote share, filled by candidates from their pre-published lists.

In Mixed-Member Proportional systems, voters cast two votes - one for a local representative and one for a party. The party vote determines the overall seat distribution, while maintaining local representation.

[Camera: Return to presenter]

Proportional systems are common globally - used in countries like Germany, New Zealand, Sweden, and many others. They typically result in multi-party systems, coalition governments, and higher voter satisfaction.

The main criticism? Coalition governments can sometimes lead to instability or difficulty forming governments - though evidence on this is mixed, with many PR countries having very stable governance.

[Action: Gesture to transition to next section]

For the U.S., adopting full proportional representation would require significant changes to our electoral structure, but some states and localities are exploring multi-member districts that would bring more proportionality to our system.`,
        notes:
          "Include graphics comparing different countries' legislatures - show how U.S. Congress is more polarized than multi-party systems. Maybe use animation showing how 49% of voters can get zero representation in FPTP.",
        duration: 180,
      },
      {
        id: "1-5",
        title: "Reform Movements and Conclusion",
        content: `[Camera: Medium shot]

So given these alternatives, what's happening with electoral reform in the United States?

[Graphics: Map of reform initiatives]

Reform is bubbling up at the state and local levels. Maine and Alaska now use RCV for federal elections. Cities from Minneapolis to San Francisco to New York have adopted it for local races. And multiple states have ballot initiatives underway.

Organizations like FairVote, RepresentUs, and the Electoral Reform Coalition are building cross-partisan support for change, arguing these aren't partisan issues but democracy issues.

[Camera: Close-up]

It's worth noting that electoral reform isn't a silver bullet that magically fixes democracy. Any system has tradeoffs, and the perfect voting method doesn't exist. Political scientists actually have mathematical proofs showing that no system can satisfy all desirable criteria simultaneously.

[Camera: Medium shot for conclusion]

But the system we choose shapes our politics in profound ways - influencing who runs, who wins, how many parties we have, how extreme or moderate our representatives are, and ultimately, how satisfied citizens feel about their democracy.

As voters, we should understand these systems not as abstract mathematical formulas, but as fundamental rules that determine whether our government truly represents all of us.

[Action: Direct address to camera]

I'd love to hear your thoughts on electoral reform in the comments below. Would you like to see changes to how we vote? Or do you think our current system works well? Let me know your perspective.

Thanks for watching, and I'll see you in the next video.`,
        notes:
          "Maintain balanced tone in conclusion. Acknowledge there's no perfect system but encourage viewers to be informed about alternatives. Add links to sources in video description.",
        duration: 150,
      },
    ],
    createdAt: new Date(2024, 2, 5),
    updatedAt: new Date(2024, 2, 18),
  },
  {
    id: "2",
    contentPlanId: "2",
    title: "Climate Policy Debate",
    sections: [
      {
        id: "2-1",
        title: "Introduction",
        content: `[Camera: Medium shot, direct address]

Welcome back to the channel. Today we're taking on what might be the defining policy challenge of our time: addressing climate change.

[Graphics: Climate change indicators - temperature graph, CO2 levels]

The scientific consensus is clear - our planet is warming due to human activities, primarily the burning of fossil fuels. But what's much less clear, and much more debated, is what policies we should implement to address this crisis.

[Graphics: Show title "Climate Policy Debate: Options and Tradeoffs"]

In this video, we'll explore:
- The major policy approaches being proposed
- The economic and political implications of each
- Which strategies might be most effective
- And what tradeoffs are involved

This isn't about whether climate change is real - the evidence there is overwhelming. Instead, we're focusing on how societies can respond in ways that are effective, economically viable, and politically feasible.

Let's dive in.`,
        notes:
          "Keep introduction focused on policy, not the science debate. Use neutral framing to appeal to viewers across political spectrum. Add recent temperature anomaly graphic.",
        duration: 70,
      },
      {
        id: "2-2",
        title: "Carbon Pricing",
        content: `[Camera: Side angle with graphics]

Let's start with the approach many economists consider most efficient: putting a price on carbon emissions.

[Graphics: Carbon pricing diagram]

The idea is straightforward: when something has a cost that isn't reflected in its market price - like the environmental damage from CO2 emissions - we should add that cost back in. This creates incentives throughout the economy to reduce emissions where it's cheapest to do so.

There are two main approaches to carbon pricing:

[Graphics: Carbon tax illustration]

First, a carbon tax directly sets a price on each ton of CO2 emitted. This gives businesses certainty about costs but uncertainty about how much emissions will decrease.

[Graphics: Cap and trade illustration]

Second, cap-and-trade systems set a limit on total emissions and require polluters to buy permits. This guarantees emission reductions but creates price uncertainty for businesses.

[Camera: Return to presenter]

Carbon pricing has been implemented in over 40 jurisdictions worldwide, including the European Union, California, and Canada. The evidence shows they do reduce emissions, though the impact depends on the price level.

The main challenge? Politics. Visible energy price increases are unpopular, even if the economic impact is offset through rebates or tax cuts elsewhere.

Some jurisdictions address this by returning revenue directly to citizens as "carbon dividends" or by using funds for green investments. But the political hurdles remain significant in many countries, including the United States.`,
        notes:
          "Include comparison of carbon prices across different jurisdictions. Use animation to show how carbon tax vs cap-and-trade works. Mention British Columbia as successful carbon tax example.",
        duration: 150,
      },
      {
        id: "2-3",
        title: "Regulatory Approaches",
        content: `[Camera: Medium shot with graphics panel]

Let's turn now to regulatory approaches - using government rules and standards to reduce emissions.

[Graphics: Illustration of regulations]

Rather than putting a price on carbon and letting markets determine how to reduce emissions, regulations directly mandate specific actions or outcomes. These can take several forms:

Performance standards require products or processes to meet specific efficiency benchmarks - like fuel economy standards for cars or energy efficiency requirements for appliances.

Technology standards mandate the use of specific technologies, such as requiring power plants to install carbon capture equipment.

Outright bans prohibit certain high-emission activities, like several countries' plans to phase out gasoline vehicles.

[Graphics: Show examples of each type]

The advantage of regulations is that they provide certainty about outcomes. When we set a fuel economy standard, we know roughly how much fuel will be saved.

They can also be more politically palatable than carbon prices because the costs are less visible to consumers, though they're still ultimately paid through higher prices or taxes.

[Camera: Close-up]

The downsides? Regulations can be less economically efficient than carbon pricing because they don't always target the cheapest emission reductions first. And they require governments to make technological and economic decisions that might be better left to markets.

That said, even economists who prefer carbon pricing generally acknowledge that some regulations are necessary complements, especially for addressing market failures or areas where price signals work poorly.`,
      },
    ],
  },
];
