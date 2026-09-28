# Al-Asar Degree College — public website

The public site (everything under `app/(public)`) is Al-Asar Degree College's own
website, built on the existing Next.js + Supabase application. The dashboard,
authentication, admissions, fees, recruitment and every other module are unchanged.

## Where content lives

| Content | Source | How to change it |
| --- | --- | --- |
| Welcome, history, leadership messages, future programs | `lib/site/content/institution.ts` | Edit the file (prospectus text) |
| BS programs, curricula, departments | `lib/site/content/programs.ts` | Edit the file |
| Admissions rules, merit formula, refund schedule | `lib/site/content/admissions.ts` | Edit the file |
| Attendance, conduct, anti-ragging, exams, library, uniform, hostel rules | `lib/site/content/policies.ts` | Edit the file |
| Facilities, gallery, hostels, student life | `lib/site/content/campus.ts` | Edit the file |
| Photographs | `lib/site/content/images.ts` + `public/images/al-asar/` | Replace the file, keep the key |
| Logo | `public/brand/al-asar-mark.svg` (+ `.png` for PDFs) | Replace with the official crest |
| Contact phone / email / address / office hours / map / social links | `site_settings` | Dashboard → System Settings |
| Homepage hero line, admissions notice banner | `site_settings` | Dashboard → System Settings |
| News & announcements | `portal_news` | Dashboard → Website News |
| Faculty directory | `faculty_directory` | Supabase (existing table) |
| Published fee amounts | `program_fees` | Supabase (existing table) — until rows exist, the site says fee details are available from the Administration / Accounts Office |
| Important admission dates | `important_dates` | Supabase (existing table) |
| Downloads | `download_categories`, `downloads` | Supabase (existing tables) |

Everything prospectus-derived is typed data, not markup — components only render it.
Nothing is invented: where the prospectus is silent (contact details, fees, faculty,
career paths for English/CS) the page shows an explicit "to be published" state.

## Connecting to the database

Admin-managed content is read from the `colleges` row whose slug is
`NEXT_PUBLIC_SITE_COLLEGE_SLUG` (default `al-asar-degree-college`).
`supabase/migrations/0095_al_asar_public_site_college.sql` creates that row. It is
additive and idempotent; run it against the **Al-Asar** Supabase project only. Until it
exists, the site renders fully from the prospectus content and shows no
database-driven items, and the admin settings pages show a warning.

The legacy network-wide pages (`/colleges`, `/college/<slug>`) redirect to the homepage
unless `ENABLE_MULTI_COLLEGE_SITES=true`.

## Design system

Brand tokens are CSS variables at the top of `app/globals.css` (`--aa-forest-*`,
`--aa-sand-*`, `--aa-brass-*`, `--aa-clay-*`), exposed to Tailwind as `forest-*`,
`sand-*`, `brass-*`, `clay-*`, `ink`, `line`. Typefaces: Source Serif 4 (display) and
IBM Plex Sans (text), loaded with `next/font` in `app/layout.tsx`. Shared building
blocks are in `components/site/`.
