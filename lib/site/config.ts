/**
 * Identity of the institution this deployment serves. Everything
 * institution-specific that is not editable content lives here, so the
 * public site never hardcodes the name/location in components.
 *
 * `collegeSlug` links the public site to its row in `colleges` (0042): when
 * that row exists, admin-edited content (site_settings, portal_news,
 * faculty_directory, program_fees, downloads …) is layered on top of the
 * prospectus content in lib/site/content. When it doesn't, the site still
 * renders fully from the prospectus.
 */
export const SITE = {
  name: "Al-Asar Degree College",
  shortName: "Al-Asar",
  location: "Usterzai Payan, Kohat",
  region: "Khyber Pakhtunkhwa, Pakistan",
  affiliation: "Kohat University of Science and Technology (KUST)",
  affiliationShort: "KUST",
  parentBody: "Al-Asar Welfare Society",
  parentInstitution: "Al-Asar Academy",
  collegeSlug: process.env.NEXT_PUBLIC_SITE_COLLEGE_SLUG || "al-asar-degree-college",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
  /** Replace with the official crest when supplied (keep the same path). */
  logo: "/brand/al-asar-mark.svg",
  defaultOgImage: "/images/al-asar/college-building-aerial.jpg",
  description:
    "Al-Asar Degree College, Usterzai Payan, Kohat — BS programs in English, Computer Science and Psychology in affiliation with Kohat University of Science and Technology (KUST), established by the Al-Asar Welfare Society.",
} as const;

export const fullTitle = `${SITE.name} | ${SITE.location}`;
