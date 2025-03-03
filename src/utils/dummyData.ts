// src/utils/dummyData.ts

// Function to initialize dummy data
export const initializeDummyData = () => {
  // Check if data exists already to avoid overwriting user data
  const hasData = localStorage.getItem("hasInitializedDummyData") === "true";
  if (hasData) return;

  // Topics
  const topics = [
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

  // Research Notes
  const researchNotes = [
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
      sources: [
        "UNFCCC",
        "Climate Action Tracker",
        "IPCC 6th Assessment Report",
      ],
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

  // Content Plans
  const contentPlans = [
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

  // Scripts
  const scripts = [
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
          notes:
            "Use visuals to make regulatory approaches concrete. Compare costs of different approaches using a marginal abatement cost curve graphic.",
          duration: 180,
        },
        {
          id: "2-4",
          title: "Green Investment and Innovation",
          content: `[Camera: Medium shot with graphics]

The third major approach focuses less on penalizing emissions and more on accelerating clean alternatives through investment and innovation.

[Graphics: R&D and investment illustration]

This includes:
- Government research and development funding
- Tax incentives for clean energy deployment
- Green infrastructure investments
- Clean energy subsidies
- Loan guarantees for new technologies

The theory is that by making clean energy cheaper rather than making fossil fuels more expensive, we can accelerate the transition while minimizing economic pain.

[Camera: Cut to examples]

The U.S. Inflation Reduction Act represents this approach, directing hundreds of billions toward clean energy through tax credits and other incentives. Germany's Energiewende and China's domination of solar manufacturing similarly relied heavily on government support.

Advocates point to dramatic cost declines in solar panels, wind turbines, and batteries as evidence this approach works. Solar PV costs have fallen by about 90% since 2009, largely due to innovation and scaling driven by policy support.

[Camera: Return to presenter]

The challenge is that while making clean energy cheaper is politically easier than making fossil fuels more expensive, it still requires significant government spending. And without also addressing the true cost of polluting activities, we may need even more public investment to achieve the same outcomes.

Most experts agree some combination of pricing, regulation, and investment is needed - the debate is about the right balance between these approaches.`,
          notes:
            "Include cost curve for solar, wind, and batteries. Show international comparison of clean energy R&D spending. Maybe discuss the 'breakthrough vs deployment' debate in climate tech.",
          duration: 200,
        },
      ],
      createdAt: new Date(2024, 2, 10),
      updatedAt: new Date(2024, 2, 20),
    },
    {
      id: "3",
      contentPlanId: "6",
      title: "Media Literacy 101",
      sections: [
        {
          id: "3-1",
          title: "Introduction",
          content: `[Camera: Medium shot, direct address]

Welcome back to the channel! Today we're tackling a subject that's never been more important: media literacy. In a world where we're bombarded with information from countless sources 24/7, the ability to critically evaluate what we see, read, and hear isn't just useful—it's essential.

[Graphics: Show social media feeds, news sites, podcasts all swirling together]

Think about how much information you consume daily through social media, news sites, videos, podcasts, and more. Now think about how much of that information is trying to persuade you of something—whether it's to buy a product, support a cause, or adopt a particular worldview.

[Graphics: Title card "Media Literacy 101: Navigating Information Overload"]

In this video, we'll cover:
- Why media literacy matters more than ever
- Key questions to ask about any media you consume
- Common manipulation tactics to watch for
- Practical tools for fact-checking and verification
- How to build healthier media habits

Whether you consider yourself politically left, right, or center, these skills can help you become a more informed citizen and avoid being misled by the tsunami of information—and misinformation—we all face daily.

Let's get started.`,
          notes:
            "Keep introduction inclusive and non-partisan. Emphasize that these skills benefit everyone regardless of political orientation. Use engaging visuals showing the overwhelming nature of today's information environment.",
          duration: 75,
        },
        {
          id: "3-2",
          title: "The Changing Media Landscape",
          content: `[Camera: Side angle with historical timeline graphics]

To understand why media literacy matters, let's briefly look at how our information environment has changed.

[Graphics: Show evolution from newspapers to radio to TV to internet to social media]

Fifty years ago, most Americans got their news from three TV networks, local papers, and radio. These sources had professional gatekeepers—editors and producers who, despite their flaws, generally followed established journalistic standards.

[Graphics: Show explosion of media sources today]

Today, anyone with a smartphone can create and distribute content to millions. While this democratization has many benefits, it also means that unvetted information can spread rapidly without traditional quality controls.

[Graphics: Statistics on media consumption]

The average American now spends over 11 hours per day consuming media, with nearly 3 hours on social platforms alone. These platforms use algorithms designed not to inform us but to keep us engaged—often by promoting emotionally provocative content regardless of accuracy.

[Camera: Return to presenter]

This new landscape has three key implications:

First, the responsibility for verifying information has shifted from institutions to individuals—that's us.

Second, more content is designed to manipulate our emotions rather than inform us.

And third, we're increasingly exposed only to viewpoints that align with our existing beliefs, creating "filter bubbles" that can distort our understanding of reality.

These challenges make media literacy no longer optional, but essential for navigating modern life.`,
          notes:
            "Include compelling visuals showing the shift from few media sources to many. Consider animation showing how algorithms create filter bubbles. Use neutral examples that won't alienate viewers with different political views.",
          duration: 150,
        },
        {
          id: "3-3",
          title: "Key Questions for Critical Consumption",
          content: `[Camera: Medium shot with graphics appearing beside presenter]

So how do we actually practice media literacy? It starts with asking the right questions about the content we consume.

Whenever you encounter a piece of content—whether it's a news article, social media post, or video like this one—try asking these five key questions:

[Graphics: Question 1 appears]

First: Who created this, and what's their motivation?
All content comes from someone with a particular perspective and purpose. Is it to inform, persuade, entertain, or sell something? Understanding the creator's goals helps you interpret their message.

[Graphics: Show examples of commercial, advocacy, and journalistic content]

[Graphics: Question 2 appears]

Second: What techniques are being used to attract and hold my attention?
Look for emotional appeals, dramatic music, shocking claims, or other techniques designed to bypass your rational thinking.

[Graphics: Question 3 appears]

Third: What evidence is presented, and what's missing?
Are claims backed by verifiable facts? Are sources cited? What perspectives or information might be intentionally excluded?

[Graphics: Question 4 appears]

Fourth: How might different people interpret this message?
Consider how someone with a different background or beliefs might view the same content.

[Graphics: Question 5 appears]

Fifth: How does this information make me feel?
Strong emotional reactions can cloud critical thinking. When content makes you feel angry, fearful, or smug, that's exactly when you should slow down and examine it more carefully.

[Camera: Close-up]

These questions may seem simple, but they're surprisingly powerful. Just the habit of pausing to consider them before sharing or acting on information can dramatically improve your media literacy.`,
          notes:
            "Create visually appealing graphics for each question. Include diverse examples that span the political spectrum. Emphasize that these questions apply equally to ALL media, including sources the viewer already trusts and content that confirms their existing beliefs.",
          duration: 180,
        },
      ],
      createdAt: new Date(2024, 2, 16),
      updatedAt: new Date(2024, 2, 25),
    },
    {
      id: "4",
      contentPlanId: "7",
      title: "Digital Privacy in 2025",
      sections: [
        {
          id: "4-1",
          title: "Introduction",
          content: `[Camera: Medium shot, presenter casual setting]

Hey everyone, welcome back. Today we're diving into something that affects all of us every day, often without us even realizing it: digital privacy.

[Graphics: Show visualization of data collection happening through various devices]

Right now, as you watch this video, dozens of companies are collecting data about you - from the obvious players like social media platforms and search engines to entities you might never suspect, like your smart TV, fitness tracker, or even your car.

[Graphics: Title - "Digital Privacy in 2025: Protecting Your Data in a Connected World"]

In this video, we'll cover:
- The current state of privacy in our digital ecosystem
- Who's collecting your data and what they're doing with it
- The real-world implications of surveillance capitalism
- Practical steps to protect your information
- Policy approaches that could transform the landscape

This isn't about paranoia - it's about understanding the tradeoffs we're making, often unknowingly, and regaining some control over our digital lives.

Let's dive in.`,
          notes:
            "Keep introduction conversational but authoritative. Use visualizations that make invisible data collection visible. Avoid framing as partisan issue - privacy concerns span political spectrum.",
          duration: 90,
        },
        {
          id: "4-2",
          title: "The Data Economy",
          content: `[Camera: Side angle with infographics]

To understand privacy today, we need to understand the business model that drives much of the internet: the data economy.

[Graphics: Simple visualization of data collection, processing, and monetization]

Many of the services we use daily—social media, search engines, apps, and more—are "free" because we pay with our data rather than our dollars. This isn't necessarily bad, but it creates incentives for companies to collect as much information as possible.

[Graphics: Types of data collected]

What kind of data? Everything from the obvious—like your search history and location—to the subtle—like how long you pause on certain content, your typing patterns, or even how you hold your phone. This data is then:

- Analyzed to predict your behavior and preferences
- Used to target advertising with remarkable precision
- Packaged and sold to data brokers
- Fed into AI systems to make them more effective
- Sometimes shared with government agencies

[Camera: Return to presenter]

The scale is staggering. By some estimates, the average internet user generates about 1.7 megabytes of data every second. That's over 140 gigabytes per day—enough to fill the storage on a new laptop every week.

And this data isn't just used to show you relevant ads. It's used to determine what content you see, what products you're offered and at what price, and increasingly, for consequential decisions about insurance, employment, credit, and more.

[Graphics: Show dark pattern examples]

To collect this data, companies employ sophisticated design techniques—sometimes called "dark patterns"—that nudge us toward revealing more information than we might intend to.

The result is an unprecedented system of surveillance that most of us have opted into without fully understanding the terms.`,
          notes:
            "Use concrete examples and analogies to make abstract data concepts tangible. Avoid technical jargon. Show examples of dark patterns like confusing privacy settings, opt-out buttons that are hard to find, etc.",
          duration: 180,
        },
        {
          id: "4-3",
          title: "Real-World Implications",
          content: `[Camera: Medium shot with case study graphics]

So what are the real-world implications of all this data collection? Let's look at a few examples that go beyond just seeing targeted ads.

[Graphics: Case study 1 - Price discrimination]

First, dynamic pricing. Companies can now set prices based on mountains of data about you—what device you're using, your location, your browsing history, even how urgently you need something. One study found that the same product or service can be priced differently for different consumers by as much as 300%.

[Graphics: Case study 2 - Information manipulation]

Second, information filtering. What you see online—from search results to social media feeds to news recommendations—is heavily influenced by algorithms trying to maximize your engagement. This can inadvertently trap us in "filter bubbles" where we rarely encounter information that challenges our existing beliefs.

[Graphics: Case study 3 - Mood manipulation]

Third, emotional manipulation. In 2014, Facebook conducted an experiment affecting over 600,000 users, showing some people more positive content and others more negative content to see how it affected their mood and behavior. They found they could indeed influence users' emotional states—all without explicit consent.

[Graphics: Case study 4 - Security risks]

Fourth, security vulnerabilities. The more data that's collected, the more exists to be potentially stolen or leaked. In 2023 alone, over 8.5 billion records were exposed in data breaches, affecting nearly every industry.

[Camera: Close-up]

The point isn't that all data collection is bad. Data drives incredible services we value, medical research that saves lives, and technologies that make our lives easier.

The issue is whether we—as individuals and as a society—have enough transparency, understanding, and control over how our information is used, and whether the current balance serves our collective interests.`,
          notes:
            "Use real examples with visuals but avoid being alarmist. Include how data can be used positively as well. Try to include examples that would concern people across political spectrum.",
          duration: 210,
        },
      ],
      createdAt: new Date(2024, 2, 18),
      updatedAt: new Date(2024, 2, 26),
    },
    {
      id: "5",
      contentPlanId: "5",
      title: "Voting Rights Explained",
      sections: [
        {
          id: "5-1",
          title: "Introduction",
          content: `[Camera: Direct address, neutral background]

Welcome back to the channel. Today we're exploring one of the foundational elements of any democracy: voting rights. The right to vote seems straightforward in principle, but in practice, it has a complex history and remains a subject of intense debate.

[Graphics: Title card "Voting Rights Explained"]

In this video, we'll cover:
- The historical evolution of voting rights in the United States
- Key legislation and court decisions that shaped access to the ballot
- Current controversies and debates around voting policies
- International perspectives on voting access

Whether you're on the left, right, or center politically, understanding the facts about voting rights is crucial to being an informed citizen. Let's dive in with an open mind and focus on what the evidence tells us.`,
          notes:
            "Maintain neutral, factual tone throughout. Acknowledge that voting rights can be politicized but emphasize that this video aims to provide historical context and factual information that viewers of all political perspectives can benefit from.",
          duration: 60,
        },
        {
          id: "5-2",
          title: "Historical Evolution",
          content: `[Camera: Side angle with historical timeline graphics]

To understand today's voting rights landscape, we need to understand its history.

[Graphics: Timeline beginning with Constitution]

When the United States was founded, voting was generally limited to white male property owners - roughly 6% of the population. The journey to universal suffrage took nearly two centuries.

[Graphics: Show key milestones with dates]

The 15th Amendment in 1870 prohibited denying the vote based on "race, color, or previous condition of servitude." Yet for nearly a century afterward, many states effectively blocked African American voters through poll taxes, literacy tests, and intimidation.

Women couldn't vote nationally until the 19th Amendment in 1920, after decades of advocacy by suffragists.

Native Americans weren't guaranteed voting rights until 1924, and even then, some states barred them from voting until the 1950s.

Poll taxes weren't outlawed until the 24th Amendment in 1964.

[Graphics: Voting Rights Act visuals]

The landmark Voting Rights Act of 1965 provided federal enforcement of voting rights, prohibiting discriminatory practices like literacy tests and requiring certain states with histories of discrimination to get federal approval before changing voting laws.

The minimum voting age was lowered to 18 with the 26th Amendment in 1971, partly in response to the draft during the Vietnam War.

[Camera: Return to presenter]

This history shows that voting rights in America haven't been static - they've expanded dramatically over time, though not without significant struggle and resistance. Understanding this context helps us better evaluate current debates about voting access and procedures.`,
          notes:
            "Use infographics and historical images to illustrate timeline. Include quotes from key figures in voting rights history from diverse perspectives. Keep political framing neutral, focusing on factual historical record.",
          duration: 180,
        },
        {
          id: "5-3",
          title: "Current Debates",
          content: `[Camera: Medium shot with graphics panel]

Today's debates about voting largely center on finding the right balance between two important values: making voting accessible while ensuring election integrity.

[Graphics: Split screen showing "Access" vs "Security" with key policies under each]

Policies that generally expand access include:
- Automatic voter registration
- Same-day registration
- Early voting periods
- Mail-in/absentee voting
- Restoring voting rights for former felons
- Multiple language ballots

Policies focused on security include:
- Voter ID requirements
- Regular voter roll maintenance
- Signature verification
- Limited voting periods
- In-person voting requirements
- Proof of citizenship requirements

[Camera: Close-up]

These approaches aren't necessarily mutually exclusive. Many democracies around the world implement both access-expanding and security-enhancing measures simultaneously.

[Graphics: International comparison]

For instance, many European countries require ID to vote but also automatically register citizens and make Election Day a holiday or weekend. Canada combines strict ID rules with aggressive efforts to register voters.

[Camera: Return to presenter]

When evaluating voting policies, it's helpful to ask evidence-based questions:
- What problem is the policy trying to solve, and is there data showing this problem actually exists?
- What does research tell us about the policy's impact on legitimate voters?
- Are there ways to address valid concerns while minimizing negative impacts?
- What tradeoffs are involved, and how do we weigh them?

The answers aren't always simple, and reasonable people can reach different conclusions based on how they prioritize different values.`,
          notes:
            "Present multiple perspectives fairly. Use specific examples but avoid citing recent politically charged legislation by name. Include data on actual frequency of voter fraud and effects of various voting restrictions on turnout. Use international comparison to show different approaches.",
          duration: 210,
        },
      ],
      createdAt: new Date(2024, 1, 10),
      updatedAt: new Date(2024, 2, 15),
    },
  ];

  // Save to localStorage
  localStorage.setItem("topics", JSON.stringify(topics));
  localStorage.setItem("researchNotes", JSON.stringify(researchNotes));
  localStorage.setItem("contentPlans", JSON.stringify(contentPlans));
  localStorage.setItem("scripts", JSON.stringify(scripts));

  // Mark as initialized
  localStorage.setItem("hasInitializedDummyData", "true");

  // Return data for potential use
  return { topics, researchNotes, contentPlans, scripts };
};
