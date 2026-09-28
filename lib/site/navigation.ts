export type NavLink = { label: string; href: string; description?: string };
export type NavGroup = { label: string; href: string; columns?: { heading: string; links: NavLink[] }[]; feature?: NavLink & { image: string } };

export const PRIMARY_NAV: NavGroup[] = [
  {
    label: "About",
    href: "/about",
    columns: [
      {
        heading: "The College",
        links: [
          { label: "About Al-Asar", href: "/about", description: "Welcome, mission and the Al-Asar community" },
          { label: "Our History", href: "/about/history", description: "From 1993 to degree-level education" },
          { label: "Our Future", href: "/about/history#future", description: "Growth and planned programs" },
        ],
      },
      {
        heading: "Leadership",
        links: [
          { label: "Leadership Messages", href: "/about/leadership" },
          { label: "Chairman's Message", href: "/about/leadership/chairman" },
          { label: "Coordinator's Message", href: "/about/leadership/coordinator" },
          { label: "Principal's Message", href: "/about/leadership/principal" },
        ],
      },
    ],
    feature: {
      label: "Al-Asar Welfare Society",
      href: "/about#welfare-society",
      description: "A welfare society — not a business — offering free education to orphans and deserving students.",
      image: "/images/al-asar/academy-entrance.jpg",
    },
  },
  {
    label: "Academics",
    href: "/academics",
    columns: [
      {
        heading: "Departments",
        links: [
          { label: "Department of English", href: "/departments/english" },
          { label: "Department of Computer Science", href: "/departments/computer-science" },
          { label: "Department of Psychology", href: "/departments/psychology" },
        ],
      },
      {
        heading: "Academic System",
        links: [
          { label: "Academics Overview", href: "/academics" },
          { label: "Examination System", href: "/academics/examinations" },
          { label: "Faculty", href: "/faculty" },
          { label: "Future Programs", href: "/programs#future-programs" },
        ],
      },
    ],
  },
  {
    label: "Programs",
    href: "/programs",
    columns: [
      {
        heading: "BS Programs · 4 years",
        links: [
          { label: "BS English", href: "/programs/bs-english", description: "8 semesters · 135 credit hours" },
          { label: "BS Computer Science", href: "/programs/bs-computer-science", description: "8 semesters · minimum 135 credit hours" },
          { label: "BS Psychology", href: "/programs/bs-psychology", description: "8 semesters · minimum 138 credit hours" },
          { label: "All Programs", href: "/programs" },
        ],
      },
    ],
  },
  {
    label: "Admissions",
    href: "/admissions",
    columns: [
      {
        heading: "Admissions",
        links: [
          { label: "Admissions Overview", href: "/admissions" },
          { label: "Eligibility & Merit", href: "/admissions#merit" },
          { label: "Rules, Appeals & Cancellation", href: "/admissions#rules" },
          { label: "Fee Structure & Refunds", href: "/admissions/fee-structure" },
          { label: "Downloads", href: "/downloads" },
        ],
      },
    ],
  },
  {
    label: "Campus Life",
    href: "/campus",
    columns: [
      {
        heading: "Campus",
        links: [
          { label: "Campus & Facilities", href: "/campus" },
          { label: "Hostels", href: "/campus#hostels" },
          { label: "Student Life", href: "/student-life" },
        ],
      },
      {
        heading: "Student Handbook",
        links: [
          { label: "Rules & Policies", href: "/policies" },
          { label: "Attendance", href: "/policies/attendance" },
          { label: "Anti-Ragging Policy", href: "/policies/anti-ragging" },
          { label: "Uniform", href: "/policies/uniform" },
        ],
      },
    ],
  },
  { label: "Library", href: "/library" },
  { label: "News", href: "/news" },
  { label: "Contact", href: "/contact" },
];

export const FOOTER_NAV: { heading: string; links: NavLink[] }[] = [
  {
    heading: "Study",
    links: [
      { label: "BS English", href: "/programs/bs-english" },
      { label: "BS Computer Science", href: "/programs/bs-computer-science" },
      { label: "BS Psychology", href: "/programs/bs-psychology" },
      { label: "Future Programs", href: "/programs#future-programs" },
      { label: "Examination System", href: "/academics/examinations" },
    ],
  },
  {
    heading: "Admissions",
    links: [
      { label: "How Admission Works", href: "/admissions" },
      { label: "Merit Formula", href: "/admissions#merit" },
      { label: "Fee & Refund Policy", href: "/admissions/fee-structure" },
      { label: "Downloads", href: "/downloads" },
    ],
  },
  {
    heading: "College",
    links: [
      { label: "About Al-Asar", href: "/about" },
      { label: "Leadership", href: "/about/leadership" },
      { label: "Campus & Facilities", href: "/campus" },
      { label: "Library", href: "/library" },
      { label: "Rules & Policies", href: "/policies" },
      { label: "Careers", href: "/recruitment" },
    ],
  },
];
