import type { Metadata, Viewport } from "next";
import {
  Bricolage_Grotesque,
  Instrument_Sans,
  JetBrains_Mono,
} from "next/font/google";
import { site } from "@/lib/data/site";
import { currentRecord, educationRecord } from "@/lib/data/experience";
import { socials } from "@/lib/data/socials";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { CustomCursor } from "@/components/motion/CustomCursor";
import { Preloader } from "@/components/chrome/Preloader";
import { Navigation } from "@/components/chrome/Navigation";
import { ScrollProgress } from "@/components/chrome/ScrollProgress";
import { SectionRail } from "@/components/chrome/SectionRail";
import { Footer } from "@/components/chrome/Footer";
import "./globals.css";
import { cn } from "@/lib/utils";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bricolage",
});

const sans = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-instrument",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains",
});

const title = `${site.name} — ${site.discipline}`;

const ogImage = {
  url: "/og.png",
  width: 1200,
  height: 630,
  alt: title,
  type: "image/png",
};

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: title,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  keywords: [...site.keywords],
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: site.locale,
    url: site.url,
    siteName: site.name,
    title,
    description: site.description,
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: site.description,
    images: [ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  category: "technology",
};

export const viewport: Viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

/** Person schema — lets search results resolve the name to a real profile. */
const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  url: site.url,
  jobTitle: site.role,
  email: `mailto:${site.email}`,
  telephone: site.phone,
  description: site.description,
  address: {
    "@type": "PostalAddress",
    addressLocality: site.location.city,
    addressRegion: site.location.region,
    addressCountry: site.location.country,
  },
  /* Read from the career log, so the markup cannot drift from the page. */
  worksFor: {
    "@type": "Organization",
    name: currentRecord.organisation,
  },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: educationRecord.organisation,
  },
  knowsAbout: [
    "React",
    "Next.js",
    "React Native",
    "Node.js",
    "TypeScript",
    "GraphQL",
    "MongoDB",
  ],
  sameAs: socials
    .filter((social) => social.id !== "email")
    .map((social) => social.href),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={cn(display.variable, sans.variable, mono.variable, "font-sans")}
      suppressHydrationWarning
    >
      <body className="grain bg-void text-ink antialiased">
        <script
          type="application/ld+json"
          // Serialised from a local constant; no user input reaches this.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />

        <a
          href="#index"
          className="label sr-only focus:not-sr-only focus:fixed focus:left-5 focus:top-5 focus:z-[100] focus:bg-accent focus:px-4 focus:py-3 focus:text-void"
        >
          Skip to content
        </a>

        <SmoothScroll>
          <Preloader />
          <CustomCursor />
          <ScrollProgress />
          <Navigation />
          <SectionRail />
          <main id="main">{children}</main>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
