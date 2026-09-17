/**
 * The five dimensions of the Engineering DNA system.
 *
 * PROVENANCE — worth keeping straight, because this is a hiring document.
 *
 * Corroborated by the résumé, the project list, or this repository:
 *   React, Next.js, TypeScript, JavaScript, Angular, React Native,
 *   Tailwind CSS, Redux, Node.js, Express, Spring Boot, Java, Python,
 *   FastAPI, GraphQL, MongoDB, REST APIs, CI/CD, team leadership,
 *   code review, mentoring.
 *
 * Asserted by Pavan and NOT independently corroborated here:
 *   AWS, Docker, Kubernetes, AI agents, LLM applications, prompt
 *   engineering, developer tooling.
 *
 * Pruning any of them is a one-line edit in this file.
 */

export type DimensionId = "product" | "frontend" | "backend" | "cloud" | "ai";

export type Dimension = {
  id: DimensionId;
  index: string;
  label: string;
  /** One line on what the dimension means in practice — never a definition. */
  summary: string;
  technologies: readonly string[];
};

/**
 * Ordered as a delivery pipeline: decide, build the surface, build what
 * holds it up, ship it, then teach the machine to do the dull parts. The
 * order is the point — this is a sequence, not a list.
 */
export const dimensions: readonly Dimension[] = [
  {
    id: "product",
    index: "01",
    label: "Product",
    summary: "Deciding what is worth building, and what can wait.",
    technologies: [
      "Discovery",
      "Scoping",
      "Team leadership",
      "Code review",
      "Mentoring",
    ],
  },
  {
    id: "frontend",
    index: "02",
    label: "Frontend",
    summary: "The layer a product gets judged on, before anything else.",
    technologies: [
      "React",
      "Next.js",
      "TypeScript",
      "JavaScript",
      "Angular",
      "React Native",
      "Tailwind CSS",
      "Redux",
    ],
  },
  {
    id: "backend",
    index: "03",
    label: "Backend",
    summary: "Services that stay boring while everything above them changes.",
    technologies: [
      "Java",
      "Spring Boot",
      "Node.js",
      "Express",
      "Python",
      "FastAPI",
      "GraphQL",
      "MongoDB",
      "REST APIs",
    ],
  },
  {
    id: "cloud",
    index: "04",
    label: "Cloud",
    summary: "Where it runs, and how it gets there without a manual step.",
    technologies: ["AWS", "Docker", "Kubernetes", "CI/CD"],
  },
  {
    id: "ai",
    index: "05",
    label: "AI / Agents",
    summary: "Putting models to work on the repetitive parts of engineering.",
    technologies: [
      "AI agents",
      "LLM applications",
      "Prompt engineering",
      "Developer tooling",
    ],
  },
];

export const dna = {
  /** The centre of the composition. Typography, not an object. */
  centre: "Build",
  outro: {
    kicker: "Next",
    index: "03",
    title: "Career.log",
  },
} as const;

export const technologyCount = dimensions.reduce(
  (total, dimension) => total + dimension.technologies.length,
  0,
);
