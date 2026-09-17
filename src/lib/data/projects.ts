/**
 * The project record. Single source of truth for the Selected Work gallery,
 * the `/projects/[slug]` pages, the sitemap and every figure quoted anywhere
 * else on the site.
 *
 * PROVENANCE — this is a hiring document.
 *
 * Titles, subtitles, technologies, engineering detail and every impact figure
 * below are supplied verbatim by Pavan. Nothing is inferred, rounded, or
 * filled in to make a section look fuller. Where a case-study section has not
 * been written yet the field is simply absent, and the page renders one fewer
 * section rather than a paragraph nobody wrote.
 *
 * `links` are the live URLs already published on this site before the
 * rewrite; the two projects without a public address carry none.
 */

/** Selects the generated composition in components/visuals/ProjectVisual.tsx. */
export type ProjectVisual =
  | "assess"
  | "analytics"
  | "mobile"
  | "marketplace"
  | "care"
  | "booking";

/** A measured outcome. `value` is display text — never re-derived or rounded. */
export type ImpactStat = {
  value: string;
  label: string;
};

export type ProjectLink = {
  label: string;
  href: string;
};

/**
 * The six sections a full case study will carry. Only `overview`,
 * `implementation` and `impact` are written; the rest wait for real content
 * rather than being invented here.
 */
export type CaseStudy = {
  overview?: string;
  problem?: string;
  approach?: string;
  architecture?: string;
  implementation?: readonly string[];
};

export type Project = {
  /** Display index, and the order the gallery runs in. */
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  /** The project's role in the set — its billing, not a category label. */
  kicker: string;
  description: string;
  technologies: readonly string[];
  role: string;
  impact: readonly ImpactStat[];
  /** Engineering detail, as supplied. */
  highlights: readonly string[];
  /** Product capabilities, where the project has a capability surface. */
  capabilities?: readonly string[];
  visualType: ProjectVisual;
  featured: boolean;
  links: readonly ProjectLink[];
  caseStudy: CaseStudy;
};

/**
 * Assess Pro's capability surface, as supplied. Declared before the project
 * list so the headline figure can be counted from it rather than typed twice.
 */
const assessCapabilities = [
  "Learner portal",
  "Admin portal",
  "Topic management",
  "AI-generated question papers",
  "Proctored exams",
  "MCQ questions",
  "Coding questions",
  "Descriptive questions",
  "Exam timers",
  "Auto-save",
  "Fullscreen enforcement",
  "Tab-switch detection",
  "Monaco Editor",
  "Python",
  "SQL",
  "JavaScript",
  "Java",
  "Conversational AI chatbot",
  "Requirement input",
  "Test strategy generation",
  "Guided interactions",
  "AI-assisted question paper generation",
  "Agent simulation from Beginner to Expert",
  "Learner performance dashboards",
  "Custom data visualizations",
] as const;

/**
 * JS Fitness Coach's capability surface, as supplied. Declared before the
 * project list so the headline figure can be counted from it rather than
 * typed twice.
 */
const fitnessCapabilities = [
  "Trainer profile",
  "Service listing",
  "Time-slot availability",
  "Time-slot booking",
  "Automated email confirmations",
] as const;

export const projects: readonly Project[] = [
  {
    id: "01",
    slug: "assess-pro",
    title: "Assess Pro",
    subtitle: "AI-powered online assessment platform",
    kicker: "Flagship",
    description:
      "A full-stack AI-powered online assessment platform with separate learner and admin portals.",
    technologies: [
      "Next.js",
      "React",
      "Tailwind CSS",
      "shadcn/ui",
      "FastAPI",
      "REST APIs",
      "Monaco Editor",
      "Context API",
      "AI workflows",
    ],
    role: "Full-stack",
    /*
     * No percentages exist for this one, so the figures count what the
     * product actually contains. The first is derived, so it can never drift
     * away from the list it describes.
     */
    impact: [
      {
        value: String(assessCapabilities.length).padStart(2, "0"),
        label: "Capabilities",
      },
      { value: "04", label: "Editor languages" },
      { value: "02", label: "Portals" },
    ],
    capabilities: assessCapabilities,
    highlights: [
      "Built a responsive Next.js frontend.",
      "Created reusable React components.",
      "Used Context API for global state including authentication, student data, notifications and agent execution.",
      "Implemented complete exam workflows.",
      "Integrated Monaco Editor for Python, SQL, JavaScript and Java.",
      "Implemented exam timers and auto-save.",
      "Implemented fullscreen enforcement.",
      "Implemented tab-switch detection.",
      "Built conversational UI for AI-assisted assessment workflows.",
      "Built admin portal with AI-assisted question paper generation.",
      "Implemented agent simulation from Beginner through Expert.",
      "Built learner performance dashboards and data visualizations.",
      "Used AI-assisted development tools to accelerate component generation, API integration and debugging.",
    ],
    visualType: "assess",
    featured: true,
    links: [],
    caseStudy: {
      overview:
        "A full-stack AI-powered online assessment platform with separate learner and admin portals.",
    },
  },
  {
    id: "02",
    slug: "amc-ladder",
    title: "AMC Ladder",
    subtitle: "Exam preparation platform",
    kicker: "Product scale",
    description:
      "A scalable exam preparation platform for the AMC CAT, with test management, analytics, real-time progress tracking and subscription payments.",
    technologies: ["Next.js", "Tailwind CSS", "Node.js", "Razorpay"],
    role: "Full-stack",
    impact: [
      { value: "1,000+", label: "Active users" },
      { value: "~40%", label: "Performance improvement" },
      { value: "20%", label: "More successful transactions" },
    ],
    highlights: [
      "Architected and launched a scalable exam preparation platform for AMC CAT.",
      "Onboarded 1,000+ active users within the first 3 months.",
      "Improved application performance by approximately 40%.",
      "Built optimized Next.js rendering architecture.",
      "Built Tailwind-based UI architecture.",
      "Developed Node.js backend services.",
      "Implemented test management.",
      "Implemented analytics.",
      "Implemented real-time progress tracking.",
      "Built detailed performance reports.",
      "Built analytics dashboards.",
      "Integrated Razorpay payment gateway.",
      "Enabled secure subscription workflows.",
      "Improved successful transactions by approximately 20%.",
      "Used AI-assisted development workflows for debugging, boilerplate generation and feature implementation.",
    ],
    visualType: "analytics",
    featured: false,
    links: [{ label: "Visit site", href: "https://www.amcladder.com/" }],
    caseStudy: {
      overview:
        "A scalable exam preparation platform for the AMC CAT, launched and grown to 1,000+ active users in its first three months.",
    },
  },
  {
    id: "03",
    slug: "happily-health",
    title: "Happily Health",
    subtitle: "Health & wellness mobile platform",
    kicker: "Mobile / scale",
    description:
      "A cross-platform health and wellness application, built and led with a team of four engineers.",
    technologies: ["React Native", "Node.js"],
    role: "Front-end lead, team of 4",
    impact: [
      { value: "10,000+", label: "Downloads" },
      { value: "30%", label: "Faster feature development" },
    ],
    highlights: [
      "Led development with a team of 4 engineers.",
      "Built a cross-platform mobile application.",
      "Achieved 10,000+ downloads during the initial release cycle.",
      "Created scalable and reusable UI component architecture.",
      "Reduced feature development time by approximately 30%.",
      "Implemented secure authentication.",
      "Integrated APIs.",
      "Built backend services.",
      "Focused on healthcare data protection requirements.",
      "Optimized application performance.",
      "Improved user flows and usability.",
    ],
    visualType: "mobile",
    featured: false,
    links: [
      {
        label: "Google Play",
        href: "https://play.google.com/store/apps/details?id=com.sunpooh.Health&hl=en",
      },
    ],
    caseStudy: {
      overview:
        "A cross-platform health and wellness application that reached 10,000+ downloads in its initial release cycle.",
    },
  },
  {
    id: "04",
    slug: "credr",
    title: "CredR",
    subtitle: "Used bike & scooter marketplace",
    kicker: "Marketplace / operations",
    description:
      "A large React.js marketplace, stabilised and extended — plus the internal dealer management tool that took the manual work out of running it.",
    technologies: ["React.js", "Node.js", "REST APIs"],
    role: "Full-stack",
    impact: [
      { value: "35%", label: "Fewer production errors" },
      { value: "15 hrs", label: "Saved per week" },
      { value: "15%", label: "Daily active user growth" },
    ],
    highlights: [
      "Stabilized and enhanced a large React.js marketplace platform.",
      "Reduced production errors by 35%.",
      "Improved user retention.",
      "Built an internal dealer management tool using React.js and Node.js.",
      "Automated operational workflows.",
      "Saved approximately 15 hours per week for the operations team.",
      "Collaborated with backend, product and design teams.",
      "Contributed to a 15% increase in daily active users.",
      "Improved API integrations.",
      "Improved frontend performance.",
      "Improved cross-device user experience.",
    ],
    visualType: "marketplace",
    featured: false,
    links: [{ label: "Visit site", href: "https://www.credr.com" }],
    caseStudy: {
      overview:
        "A used two-wheeler marketplace: platform stability on the storefront, and an internal dealer tool behind it.",
    },
  },
  {
    id: "05",
    slug: "myclnq",
    title: "MyCLNQ",
    subtitle: "Family healthcare application",
    kicker: "Healthcare / mobile",
    description:
      "Appointment booking, clinic discovery and medical records for a household, on React Native over Node.js services.",
    technologies: ["React Native", "Node.js"],
    role: "Mobile engineer",
    impact: [
      { value: "25%", label: "Lower average wait time" },
      { value: "4.0★", label: "Google Play rating" },
      { value: "99.9%", label: "Uptime at peak" },
    ],
    highlights: [
      "Developed appointment booking.",
      "Developed clinic locator.",
      "Reduced average user wait time by 25%.",
      "Designed accessible and responsive UI components.",
      "Contributed to a 4.0★ Google Play rating.",
      "Integrated React Native application with Node.js backend services.",
      "Implemented appointment scheduling.",
      "Integrated medical records functionality.",
      "Maintained 99.9% uptime during peak usage.",
      "Collaborated with backend teams to ensure reliable API communication.",
    ],
    visualType: "care",
    featured: false,
    links: [
      {
        label: "Google Play",
        href: "https://play.google.com/store/search?q=myclnq&c=apps&hl=en",
      },
    ],
    caseStudy: {
      overview:
        "A family healthcare application: booking, clinic discovery and records, held to 99.9% uptime at peak.",
    },
  },
  {
    id: "06",
    slug: "js-fitness-coach",
    title: "JS Fitness Coach",
    subtitle: "Personal trainer booking platform",
    kicker: "Booking / scheduling",
    description:
      "A booking platform for a personal fitness coach — trainer profile and services, time-slot scheduling, and automated email confirmations.",
    technologies: ["Next.js", "React", "Tailwind CSS", "EmailJS"],
    role: "Full-stack (solo)",
    impact: [
      {
        value: String(fitnessCapabilities.length).padStart(2, "0"),
        label: "Capabilities",
      },
    ],
    capabilities: fitnessCapabilities,
    highlights: [
      "Built a Next.js application for a personal fitness coach's public booking site.",
      "Designed a trainer profile and service listing.",
      "Implemented time-slot based availability for the trainer's schedule.",
      "Built a booking flow for visitors to reserve an available time slot.",
      "Integrated EmailJS to send automated booking confirmation emails.",
      "Styled the interface with Tailwind CSS.",
      "Deployed the application to Netlify.",
    ],
    visualType: "booking",
    featured: false,
    links: [
      { label: "Visit site", href: "https://jsfitnesscoach.netlify.app/" },
    ],
    caseStudy: {
      overview:
        "A booking platform for a personal fitness coach: trainer profile, service details, and time-slot scheduling with automated email confirmations.",
    },
  },
];

export const featuredProject =
  projects.find((project) => project.featured) ?? projects[0];

export function projectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

/**
 * The flagship's scroll story: the platform workflow, one phase per beat.
 * Each phase names a capability the product actually has.
 */
export const assessPhases = [
  { id: "assess", index: "01", label: "Assess", note: "Topic management, guided workflows" },
  { id: "generate", index: "02", label: "Generate", note: "AI-authored question papers" },
  { id: "execute", index: "03", label: "Execute", note: "Proctored, timed, auto-saved" },
  { id: "analyze", index: "04", label: "Analyze", note: "Learner performance dashboards" },
  { id: "improve", index: "05", label: "Improve", note: "Agent simulation, Beginner to Expert" },
] as const;

/**
 * Every technology that ships inside a project here, listed once.
 *
 * Deduplicated on a canonical key rather than the literal string: the
 * projects were written up naming the same library as both "React" and
 * "React.js", and a plain Set would report that as two technologies. The
 * first spelling encountered is the one displayed.
 */
export const shippedStack: readonly string[] = (() => {
  const seen = new Map<string, string>();
  for (const project of projects) {
    for (const technology of project.technologies) {
      const key = technology.toLowerCase().replace(/.js$/, "");
      if (!seen.has(key)) seen.set(key, technology);
    }
  }
  return [...seen.values()];
})();

export const work = {
  title: ["Things", "I've", "built."],
  /** The one word that resolves to accent. */
  titleAccent: "built.",
  note: "An assessment platform, three web products and two mobile apps.",
  outro: { kicker: "Next", index: "06", title: "Impact" },
} as const;
