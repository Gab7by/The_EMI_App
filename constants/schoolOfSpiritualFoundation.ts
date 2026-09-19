import { MaterialCommunityIcons } from "@expo/vector-icons"

export const SSF_BYLINE = "with Rev. Dr. Seth Owusu"
export const PROGRAM_WEEKS = 8

export type CurriculumTopic = {
  id: string
  title: string
}

// "What This School Entails" - always visible on the detail screen, not
// tucked behind a tap, since concrete curriculum is the most concrete,
// appetite-whetting content on the page.
export const CURRICULUM_TOPICS: CurriculumTopic[] = [
  { id: "bible-doctrine", title: "Bible Doctrine & Biblical Study" },
  { id: "eschatology", title: "Eschatology: The Doctrine of Last Things" },
  { id: "sin-fall-mediator", title: "Sin, the Fall & Christ the Mediator" },
  { id: "biblical-marriage", title: "Biblical Marriage" },
  { id: "child-training", title: "Child Training & Family Discipleship" },
  { id: "the-holy-bible", title: "The Holy Bible" },
  { id: "god-nature-attributes", title: "God: Nature & Attributes" },
  { id: "christ-holy-spirit", title: "Christ & the Holy Spirit" },
  { id: "christian-ordinances", title: "Christian Ordinances & Spiritual Foundations" },
  { id: "baptism-holy-spirit", title: "Baptism & the Holy Spirit" },
  { id: "redemption-benefits", title: "Redemption & Its Benefits" },
  { id: "justification", title: "Justification & Victorious Living" },
  { id: "redemption-healing", title: "Redemption, Healing & Divine Health" },
  { id: "repentance-restitution", title: "Repentance & Restitution" },
  { id: "sanctification", title: "Sanctification & Consecrated Living" },
  { id: "personal-evangelism", title: "Personal Evangelism & Soul Winning" },
]

export type AccordionStep = {
  title: string
  description: string
}

export type BulletGroup = {
  label: string
  items: string[]
}

// A flat, optional-field shape rather than a generic block-AST - there
// are exactly 7 fixed sections with a known, small set of content shapes
// to express, not an arbitrary CMS document. AccordionSection renders
// whichever of these are present, in this order: subtitle -> paragraphs
// -> steps -> bulletGroups (else bullets) -> callout -> quote ->
// closingLine.
export type AccordionSectionContent = {
  id: string
  icon: keyof typeof MaterialCommunityIcons.glyphMap
  title: string
  subtitle?: string
  paragraphs?: string[]
  steps?: AccordionStep[]
  bullets?: string[]
  bulletsLabel?: string
  bulletGroups?: BulletGroup[]
  callout?: string
  quote?: string
  closingLine?: string
}

export const ACCORDION_SECTIONS: AccordionSectionContent[] = [
  {
    id: "program-structure",
    icon: "calendar-check-outline",
    title: "Program Structure",
    subtitle: "8 Weeks. One Foundation. A Lifetime of Impact.",
    paragraphs: [
      "The School of Spiritual Foundation runs for 8 consecutive weeks. Each week is intentionally designed to build upon the previous one - students must complete the requirements of each module before progressing to the next.",
    ],
    steps: [
      { title: "Learn", description: "Complete the assigned teaching and study materials." },
      { title: "Engage", description: "Participate in prayer, discussions, assignments and spiritual exercises." },
      { title: "Practice", description: "Apply what you've learned through evangelism and practical Kingdom service." },
      { title: "Reflect", description: "Complete your weekly assignment and personal reflection." },
      { title: "Report", description: "Submit your required reports and evidence of participation." },
      { title: "Progress", description: "Once requirements are satisfactorily completed, the next module becomes available." },
    ],
    callout: "Important: Progression through SSF is intentional, not automatic. Consistency, participation and completion of assigned requirements are essential to your growth and qualification for graduation.",
  },
  {
    id: "weekly-responsibilities",
    icon: "clipboard-check-outline",
    title: "Weekly Responsibilities",
    subtitle: "Every week, you are expected to:",
    steps: [
      { title: "Complete the Teaching", description: "Watch the weekly teaching in full, study the supporting materials, take notes, and reflect on how it applies to your life." },
      { title: "Engage in Prayer", description: "Attend the scheduled weekly prayer session and participate in prayer activities, while maintaining a personal prayer life." },
      { title: "Complete Your Assignment", description: "Complete and submit the weekly assignment or reflection within the specified period, demonstrating your understanding and application." },
      { title: "Complete Your Practicum", description: "Participate in the assigned evangelism or outreach activity, engage people with the Gospel, pray for those you reach, follow up, and submit a short report of who you reached and how it went." },
      { title: "Progress to the Next Module", description: "The next module unlocks only once the current week's requirements are complete." },
    ],
  },
  {
    id: "accountability-engagement",
    icon: "shield-check-outline",
    title: "Accountability & Engagement",
    subtitle: "SSF is designed for transformation, not just information.",
    paragraphs: [
      "Knowledge without application does not produce maturity. SSF requires every student to take personal responsibility for their growth and participation. At the end of each week, you'll confirm that you've completed the teaching, studied the materials, participated in prayer, completed your assignment, participated in evangelism or practicum, and submitted your report.",
    ],
    // The recurring motif from the source material - kept to this one
    // appearance only, not repeated across every section.
    quote: "Consistency is part of the training. Accountability is part of the formation. Application is part of the learning. Transformation is the goal.",
  },
  {
    id: "practicum",
    icon: "bullhorn-outline",
    title: "Practicum: Evangelism & Missions",
    paragraphs: [
      "SSF is committed to producing believers who don't merely know the Gospel but are equipped and willing to communicate and demonstrate it. Every student actively participates in evangelism and missions throughout the program.",
    ],
    bulletGroups: [
      {
        label: "Evangelism may include:",
        items: ["Soul-winning conversations", "Sharing the Gospel", "Personal invitations", "Prayer and ministry", "Follow-up"],
      },
      {
        label: "Missions & outreach may include:",
        items: ["Scheduled outreach initiatives", "Community evangelism", "Missions assignments", "Group outreach", "Other Kingdom assignments designated by the School"],
      },
    ],
    quote: "You are not only being trained to receive. You are being trained to serve.",
  },
  {
    id: "prayer-fasting-week",
    icon: "hands-pray",
    title: "Prayer & Fasting Stretch Week",
    subtitle: "A week of deeper consecration.",
    paragraphs: [
      "During the 8-week journey there is a dedicated Prayer & Fasting Stretch Week - a focused season of prayer, fasting, consecration, spiritual discipline, and fellowship with God. It is mandatory for all students and should be approached with seriousness and a heart prepared for growth.",
    ],
    bulletsLabel: "The purpose - an opportunity to:",
    bullets: [
      "Deepen your prayer life",
      "Strengthen spiritual discipline",
      "Develop sensitivity to God",
      "Examine your life and consecration",
      "Draw closer to God",
      "Prepare for Kingdom assignment",
    ],
    closingLine: "Don't merely learn about the foundation. Allow God to build it in you.",
  },
  {
    id: "final-assessment",
    icon: "certificate-outline",
    title: "Final Assessment & Graduation",
    subtitle: "Finishing the journey.",
    paragraphs: [
      "Graduation requires more than watching all the videos. Students must demonstrate consistent participation, completion and engagement throughout the 8 weeks.",
    ],
    bulletsLabel: "To qualify for graduation, you must:",
    bullets: [
      "Complete all weekly teachings",
      "Complete all assignments and reflections",
      "Participate in scheduled prayer sessions",
      "Complete required evangelism and practicum activities",
      "Submit all required reports",
      "Participate in the Prayer & Fasting Stretch Week",
      "Maintain consistent participation throughout",
      "Complete the Final Assessment and attain the minimum required score",
    ],
  },
  {
    id: "expectations",
    icon: "target",
    title: "What We Expect of You",
    subtitle: "By the end of these 8 weeks, we desire to see you:",
    steps: [
      { title: "Grounded in Your Identity in Christ", description: "Know who you are in Christ, and live from that reality." },
      { title: "Established in the Word", description: "A consistent appetite for Scripture that shapes your convictions and decisions." },
      { title: "Disciplined in Prayer", description: "A consistent personal prayer life." },
      { title: "Walking in Holiness & Consecration", description: "A lifestyle that reflects devotion and surrender to Christ." },
      { title: "Active in Evangelism", description: "Intentional about reaching others with the Gospel." },
      { title: "Prepared for Kingdom Assignment", description: "Equipped with the spiritual foundation, discipline, character and readiness for Kingdom service." },
    ],
  },
]

export const CLOSING_STATEMENT = {
  title: "Your Foundation Season",
  body: "This is your foundation season. Don't rush through it, don't treat it casually, and don't settle for merely completing activities - allow God to work deeply in you.",
  charge: "Study diligently. Pray deeply. Live consecrated. Serve faithfully. Evangelize boldly. Grow intentionally. Finish strong.",
}

export const ENROLLMENT_CTA = {
  label: "Enrollment Starting Soon",
  confirmation: "We'll notify you the moment enrollment opens - thank you for your patience.",
}
