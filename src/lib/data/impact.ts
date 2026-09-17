/*
 * The IMPACT interlude — one figure at a time, in narrative order:
 * experience → scale → users → quality → reliability → future.
 *
 * PROVENANCE — every figure here is already stated in projects.ts or derived
 * from the career dates. Nothing is added, rounded or invented for the sake
 * of a fuller sequence; the source project is named so a reader can go and
 * check it in Selected Work.
 */
import { EXPERIENCE_YEARS } from "./experience";
import { projectBySlug } from "./projects";

export type ImpactMetric = {
  /** The number itself, as display text. */
  figure: string;
  /** The mark that trails it — set in accent, so it is authored apart. */
  suffix?: string;
  /** Authored as lines, because the break is the composition. */
  label: readonly string[];
  /** Where the figure comes from. Secondary, and deliberately small. */
  source?: string;
};

/** Titles live in projects.ts; quoting them by slug keeps the two in step. */
const from = (slug: string): string | undefined => projectBySlug(slug)?.title;

export const impact = {
  /** Matches the `impact` entry in the sections list in site.ts. */
  index: "06",
  label: "Impact",
  metrics: [
    {
      figure: String(EXPERIENCE_YEARS),
      suffix: "+",
      label: ["Years", "engineering"],
    },
    {
      figure: "10,000",
      suffix: "+",
      label: ["Downloads"],
      source: from("happily-health"),
    },
    {
      figure: "1,000",
      suffix: "+",
      label: ["Active users"],
      source: from("amc-ladder"),
    },
    {
      figure: "35",
      suffix: "%",
      label: ["Fewer", "production errors"],
      source: from("credr"),
    },
    {
      figure: "99.9",
      suffix: "%",
      label: ["Uptime at peak"],
      source: from("myclnq"),
    },
    /* The one entry that is not a measurement — the sequence has to land. */
    {
      figure: "∞",
      label: ["Still building."],
    },
  ] as const satisfies readonly ImpactMetric[],
} as const;

export type ImpactData = typeof impact;
