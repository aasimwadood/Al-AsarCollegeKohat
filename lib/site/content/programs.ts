/**
 * BS programs and departments, transcribed from the prospectus's "Graduate
 * Programs" and "Scheme of Studies" sections. Course codes shown as "—" are
 * printed as "***" (unassigned) in the prospectus. Totals per semester are
 * the prospectus's own stated totals.
 */
import { IMAGES, type SiteImage } from "./images";

export type Course = {
  code: string;
  title: string;
  credits: string;
  /** Renders an "OR" between this course and the next one. */
  orNext?: boolean;
};

export type Semester = {
  year: number;
  number: number;
  /** e.g. "Major in Literature" where a semester splits into tracks. */
  track?: string;
  totalCreditHours: number;
  courses: Course[];
  notes?: string[];
};

export type Program = {
  slug: string;
  name: string;
  shortName: string;
  departmentSlug: string;
  duration: string;
  semesters: number;
  creditHours: string;
  creditHoursDetail: string;
  summary: string;
  eligibility: string[];
  eligibilityNote?: string;
  careers?: string[];
  curriculum: Semester[];
  curriculumNotes: string[];
  image: SiteImage;
};

export type Department = {
  slug: string;
  name: string;
  programSlug: string;
  /** Short line used on cards. */
  tagline: string;
  introduction: string[];
  aims: string[];
  careers?: { intro: string; areas: string[] };
  image: SiteImage;
  icon: "english" | "computing" | "psychology";
};

const c = (code: string, title: string, credits: string, orNext?: boolean): Course => ({ code, title, credits, orNext });

export const PROGRAMS: Program[] = [
  {
    slug: "bs-english",
    name: "BS English",
    shortName: "English",
    departmentSlug: "english",
    duration: "4 years",
    semesters: 8,
    creditHours: "135",
    creditHoursDetail: "Total credit hours offered: 135",
    summary:
      "Literature and linguistics, communication and critical thinking — preparing students for effective communication at all levels and forums.",
    eligibility: [
      "F.A / F.Sc or equivalent with 45% marks",
      "40% NAT / passed relevant criteria test which may be decided by the university",
    ],
    curriculum: [
      {
        year: 1,
        number: 1,
        totalCreditHours: 18,
        courses: [
          c("ENG151", "Functional English", "3(3+0)"),
          c("CS101", "Introduction to Computing", "3(2+1)"),
          c("BS121", "Principles of Management", "3(3+0)"),
          c("JMC101", "Introduction to Communication", "3(3+0)"),
          c("PHI102", "Introduction to Logic", "3(3+0)"),
          c("ECO111", "Principles of Microeconomics", "3(3+0)"),
        ],
      },
      {
        year: 1,
        number: 2,
        totalCreditHours: 18,
        courses: [
          c("ENG152", "Academic Reading and Writing", "3(3+0)"),
          c("—", "Everyday Science", "3(3+0)"),
          c("SOC101", "Introduction to Sociology", "3(3+0)"),
          c("PS221", "Constitutional & Political Development in Pakistan", "3(3+0)"),
          c("STAT101", "Introduction to Statistics", "3(3+0)"),
          c("ENG102", "Introduction to Linguistics", "3(3+0)"),
        ],
      },
      {
        year: 2,
        number: 3,
        totalCreditHours: 18,
        courses: [
          c("ENG253", "Communication Skills", "3(3+0)"),
          c("PS101", "Pakistan Studies", "3(3+0)"),
          c("IS101", "Islamic Studies", "3(3+0)"),
          c("ENG201", "English Literature — Short Stories, Essays and Novella", "3(3+0)"),
          c("ENG221", "Phonetics and English Phonology", "3(3+0)"),
          c("ENG231", "History of English Literature — Anglo-Saxon to Restoration", "3(3+0)"),
        ],
      },
      {
        year: 2,
        number: 4,
        totalCreditHours: 15,
        courses: [
          c("ENG232", "History of English Literature — Neo-classics to Date", "3(3+0)"),
          c("ENG222", "Semantics", "3(3+0)"),
          c("ENG254", "Advanced Academic Reading and Writing", "3(3+0)"),
          c("ENG223", "Morphology and Syntax", "3(3+0)"),
          c("BS131", "Human Resource Management", "3(3+0)"),
        ],
        notes: [
          "Students who want to exit after the 4th semester: Entrepreneurship / Students Club / Sports (non-credit) and Internship (non-credit).",
        ],
      },
      {
        year: 3,
        number: 5,
        totalCreditHours: 18,
        courses: [
          c("ENG361", "Literary Criticism I", "3(3+0)"),
          c("ENG311", "14th to 18th Century Poetry", "3(3+0)"),
          c("ENG312", "18th to 19th Century Novel", "3(3+0)"),
          c("ENG391", "Research Methodology", "3(3+0)"),
          c("ENG321", "Sociolinguistics", "3(3+0)"),
          c("ENG322", "Discourse Analysis", "3(3+0)"),
        ],
      },
      {
        year: 3,
        number: 6,
        totalCreditHours: 18,
        courses: [
          c("ENG362", "Literary Criticism II", "3(3+0)"),
          c("ENG313", "Translation Theory and Literary Studies", "3(3+0)"),
          c("ENG314", "Classics in Drama", "3(3+0)"),
          c("ENG323", "Lexical Studies", "3(3+0)"),
          c("ENG324", "Psycholinguistics", "3(3+0)"),
          c("ENG392", "Qualitative and Quantitative Research Methods", "3(3+0)"),
        ],
      },
      {
        year: 4,
        number: 7,
        track: "Major in Literature",
        totalCreditHours: 15,
        courses: [
          c("ENG411", "Twentieth Century Poetry and Drama", "3(3+0)"),
          c("ENG412", "American Literature", "3(3+0)"),
          c("ENG413", "South Asian Literature in English", "3(3+0)"),
          c("ENG414", "Romantic Poetry", "3(3+0)"),
          c("ENG491", "Senior Design Project-I (as per HEC criteria)", "9(3+6)", true),
          c("ENG415", "Twentieth Century Literary Movements", "3(3+0)"),
          c("—", "Entrepreneurship / Students Club / Sports", "Non-credit"),
        ],
      },
      {
        year: 4,
        number: 7,
        track: "Major in Linguistics",
        totalCreditHours: 15,
        courses: [
          c("ENG441", "Language Teaching Methodologies", "3(3+0)"),
          c("ENG421", "Pragmatics", "3(3+0)"),
          c("ENG422", "Second Language Acquisition", "3(3+0)"),
          c("ENG442", "TEFL", "3(3+0)"),
          c("ENG491", "Senior Design Project-I (as per HEC criteria)", "9(3+6)", true),
          c("ENG423", "Feminist Linguistics", "3(3+0)"),
          c("—", "Entrepreneurship / Students Club / Sports", "Non-credit"),
        ],
      },
      {
        year: 4,
        number: 8,
        track: "Major in Literature",
        totalCreditHours: 15,
        courses: [
          c("ENG416", "Twentieth Century Fiction and Non-fiction", "3(3+0)"),
          c("ENG443", "Teaching Methodology", "3(3+0)"),
          c("ENG417", "Postcolonial Studies", "3(3+0)"),
          c("ENG424", "Journalistic Discourse", "3(3+0)"),
          c("ENG492", "Senior Design Project-II (as per HEC criteria)", "9(3+6) (continued)", true),
          c("ENG418", "Shakespearean Studies", "3(3+0)"),
          c("—", "Internship", "Non-credit"),
        ],
      },
      {
        year: 4,
        number: 8,
        track: "Major in Linguistics",
        totalCreditHours: 15,
        courses: [
          c("ENG486", "Syllabus Designing and Materials Development", "3(3+0)"),
          c("ENG425", "Stylistics", "3(3+0)"),
          c("ENG426", "Language, Culture and Identity", "3(3+0)"),
          c("ENG427", "Genre Analysis", "3(3+0)"),
          c("ENG492", "Senior Design Project-II (as per HEC criteria)", "9(3+6) (continued)", true),
          c("ENG451", "Intercultural Communication (ICC)", "3(3+0)"),
          c("—", "Internship", "Non-credit"),
        ],
      },
    ],
    curriculumNotes: ["Course outline will be provided at the time of commencement of classes."],
    image: IMAGES.englishSign,
  },
  {
    slug: "bs-computer-science",
    name: "BS Computer Science",
    shortName: "Computer Science",
    departmentSlug: "computer-science",
    duration: "4 years",
    semesters: 8,
    creditHours: "135",
    creditHoursDetail: "Minimum 135 credit hours",
    summary:
      "Programming and solution development, databases, networks and software engineering — producing highly skilled professionals for the fastest growing sector.",
    eligibility: ["F.Sc Pre-Engineering, Pre-Medical", "ICS", "A-Level or Equivalent"],
    eligibilityNote: "Only those students can apply for admission who have passed one of the above.",
    curriculum: [
      {
        year: 1,
        number: 1,
        totalCreditHours: 15,
        courses: [
          c("PH1101", "Introduction to Philosophy", "3(3+0)"),
          c("BS121", "Principles of Management", "3(3+0)"),
          c("CS101", "Introduction to Computing", "3(2+1)"),
          c("ENG152", "Academic Reading and Writing", "3(3+0)"),
          c("RS105", "Islamic Studies", "3(3+0)"),
        ],
      },
      {
        year: 1,
        number: 2,
        totalCreditHours: 18,
        courses: [
          c("—", "Social Ethics and Civil Engagement", "3(3+0)"),
          c("SWS101", "Introduction to Sociology", "3(3+0)"),
          c("—", "Everyday Science", "3(3+0)"),
          c("ENG253", "Communication Skills", "3(3+0)"),
          c("PS101", "Pakistan Studies", "3(3+0)"),
          c("PHI101", "Introduction to Sociology", "3(3+0)"),
        ],
      },
      {
        year: 2,
        number: 3,
        totalCreditHours: 19,
        courses: [
          c("ENG334", "Teaching Writing", "3(3+0)"),
          c("STAT101", "Introduction to Statistics", "3(3+0)"),
          c("MATH101", "Calculus-I", "3(2+1)"),
          c("MATH103", "Discrete Mathematics", "3(3+0)"),
          c("PHY101", "Introduction to Mechanics", "4(3+1)"),
          c("CS102", "Programming Fundamentals", "3(2+1)"),
        ],
      },
      {
        year: 2,
        number: 4,
        totalCreditHours: 18,
        courses: [
          c("CS211", "Data Structure and Algorithms", "3(2+1)"),
          c("—", "Modern Physics", "3(3+0)"),
          c("STAT221", "Basic Inferential Statistics", "3(3+0)"),
          c("MATH271", "Ordinary Differential Equations", "3(3+0)"),
          c("MATH102", "Introduction to Probability Distribution", "3(3+0)"),
          c("CS131", "Digital Logic and Design", "3(2+1)"),
        ],
      },
      {
        year: 3,
        number: 5,
        totalCreditHours: 17,
        courses: [
          c("CS251", "Software Engineering", "3(3+0)"),
          c("CS363", "Artificial Intelligence", "3(3+0)"),
          c("CS222", "Database Concepts", "4(3+1)"),
          c("CS212", "Operating System Concepts", "3(3+0)"),
          c("CS213", "Object Oriented Programming", "4(3+1)"),
        ],
      },
      {
        year: 3,
        number: 6,
        totalCreditHours: 18,
        courses: [
          c("CS311", "Theory of Automata", "3(3+0)"),
          c("CS241", "Web Development", "4(3+1)"),
          c("CS371", "Data Communication and Computer Network", "4(3+1)"),
          c("CS233", "Computer Organization and Assembly Language", "3(3+0)"),
          c("CS316", "Visual Programming", "4(3+1)"),
        ],
      },
      {
        year: 4,
        number: 7,
        totalCreditHours: 17,
        courses: [
          c("CS411", "Design and Analysis of Algorithms", "4(3+1)"),
          c("CS372", "Information Security", "3(3+0)"),
          c("CS417", "Mobile Application Development", "4(3+1)"),
          c("CS—", "SE-1 / NW-1 / AI-1", "3(3+0)"),
          c("CS498", "Final Year Project-I", "3(0+3)"),
          c("CS494", "Industrial Training Internship", "Non-credit"),
        ],
      },
      {
        year: 4,
        number: 8,
        totalCreditHours: 13,
        courses: [
          c("CS443", "Computer Graphics", "4(3+1)"),
          c("CS477", "SE-2 / NW-2 / AI-2", "3(3+0)"),
          c("CS3-—", "SE-3 / NW-3 / AI-3", "3(3+0)"),
          c("CS499", "Final Year Project-II", "3(0+3)"),
        ],
      },
    ],
    curriculumNotes: [
      "Internship can be taken during any semester of AD/BS programs.",
      "Course outline will be provided at the time of admission.",
      "SE / NW / AI denote Software Engineering, Networking and Artificial Intelligence elective streams.",
    ],
    image: IMAGES.computerLab,
  },
  {
    slug: "bs-psychology",
    name: "BS Psychology",
    shortName: "Psychology",
    departmentSlug: "psychology",
    duration: "4 years",
    semesters: 8,
    creditHours: "138",
    creditHoursDetail: "Minimum 138 credit hours",
    summary:
      "The science of human behaviour — theories, methods and evidence, from cognitive and social psychology to clinical, counseling and research practice.",
    eligibility: ["F.A / F.Sc / A-Level or Equivalent with minimum 45% or 2nd Division"],
    eligibilityNote: "As per KUST admission policy.",
    careers: [
      "Educational Institutes",
      "Special Education Institutes",
      "Armed Forces",
      "Industry",
      "Health Professions",
      "Management",
      "Advertising and Marketing",
      "Human Resources",
      "Research Organizations",
      "Counseling",
      "Social Services",
    ],
    curriculum: [
      {
        year: 1,
        number: 1,
        totalCreditHours: 18,
        courses: [
          c("CS101", "Introduction to Computing", "3(3+0)"),
          c("IS101", "Islamic Studies", "3(3+0)"),
          c("PS101", "Pakistan Studies", "3(3+0)"),
          c("ENG151", "Functional English", "3(3+0)"),
          c("PSY101", "Introduction to Psychology", "3(3+0)"),
          c("STAT101", "Introduction to Statistics", "3(3+0)"),
        ],
      },
      {
        year: 1,
        number: 2,
        totalCreditHours: 18,
        courses: [
          c("MATH101", "Mathematics-I", "3(3+0)"),
          c("ENG152", "Academic Reading and Writing", "3(3+0)"),
          c("ENG153", "Communication Skills", "3(3+0)"),
          c("SOS101", "Introduction to Sociology", "3(3+0)"),
          c("PSY102", "Introduction to Psychology", "3(3+0)"),
          c("PSY103", "Experimental Psychology", "3(2+1)"),
        ],
      },
      {
        year: 2,
        number: 3,
        totalCreditHours: 18,
        courses: [
          c("ECO102", "Fundamental Economics", "3(3+0)"),
          c("PH101", "Introduction to Philosophy", "3(3+0)"),
          c("BS121", "Principles of Management", "3(3+0)"),
          c("BIO101", "Introduction to Biology", "3(3+0)"),
          c("PSY231", "Social Psychology", "3(3+0)"),
          c("PSY232", "Ethical Issues in Psychology", "3(3+0)"),
        ],
      },
      {
        year: 2,
        number: 4,
        totalCreditHours: 15,
        courses: [
          c("ENG334", "Technical and Business Writing", "3(3+0)"),
          c("MS181", "Principles of Public Administration", "3(3+0)"),
          c("PHI101", "Introduction to Logic", "3(3+0)"),
          c("PSY341", "Development of Psychology", "3(3+0)"),
          c("JMC101", "Introduction to Journalism and Mass Communication", "3(3+0)"),
        ],
      },
      {
        year: 3,
        number: 5,
        totalCreditHours: 18,
        courses: [
          c("PSY211", "Physiological Psychology", "3(3+0)"),
          c("PSY322", "Cognitive Psychology", "3(3+0)"),
          c("PSY333", "Theories of Personality", "3(3+0)"),
          c("PSY334", "Psychopathology-I", "3(3+0)"),
          c("PSY336", "Positive Psychology", "3(3+0)"),
          c("PSY337", "Gender Issues in Psychology", "3(3+0)"),
        ],
      },
      {
        year: 3,
        number: 6,
        totalCreditHours: 18,
        courses: [
          c("PSY335", "Psychopathology-II", "3(3+0)"),
          c("PSY351", "Educational Psychology", "3(3+0)"),
          c("PSY352", "Organizational Psychology", "3(3+0)"),
          c("PSY353", "Cross Culture Psychology", "3(3+0)"),
          c("PSY354", "Islamic Psychology", "3(3+0)"),
          c("PSY362", "Psychological Testing-I", "3(3+0)"),
        ],
      },
      {
        year: 4,
        number: 7,
        totalCreditHours: 15,
        courses: [
          c("PSY363", "Psychological Testing-II", "3(3+0)"),
          c("PSY366", "Research Method-I", "3(3+0)"),
          c("PSY443", "Neuropsychology", "3(3+0)"),
          c("PSY456", "Clinical Psychology", "3(3+0)"),
          c("PSY465", "Data Analysis Using SPSS", "3(3+0)"),
        ],
      },
      {
        year: 4,
        number: 8,
        totalCreditHours: 15,
        courses: [
          c("PSY455", "Health Psychology", "3(3+0)"),
          c("PSY457", "Forensic Psychology", "3(3+0)"),
          c("PSY459", "Counseling Psychology", "3(3+0)"),
          c("PSY466", "Research Method-II", "3(3+0)"),
          c("PSY499", "Research Project", "3(3+0)"),
        ],
      },
    ],
    curriculumNotes: ["Course outline will be provided at the time of admission."],
    image: IMAGES.libraryReading,
  },
];

export const DEPARTMENTS: Department[] = [
  {
    slug: "english",
    name: "Department of English",
    programSlug: "bs-english",
    tagline: "Language, literature and the confidence to communicate at every level.",
    icon: "english",
    image: IMAGES.englishSign,
    introduction: [
      "Department of English is the most prestigious department of Al-Asar Degree College, Usterzai Payan, Kohat.",
      "The department takes pride in its skilled, highly qualified and experienced faculty members led by Prof. Zafrullah Khan Wazir, who has recently retired from Post Graduate Degree College, Kohat. He has the potential to raise the standards of English Language Skills along with his team to meet the global challenges of the 21st Century.",
    ],
    aims: [
      "In this age of corporate competition, English Language learning and critical thinking is an imperative to communicate on national as well as international level. We prepare our male/female students for effective communication at all levels and forums.",
      "We inculcate in our students self-confidence by enhancing their creativity through comparative literature studies, developing their oratorical, presentation and dramatic skills. At the end of the Literature Course of BS our students are not only able to comprehend and appreciate different genres of Literature but they can also think and reproduce in English Language independently and effectively.",
      "We also aim to groom our students to make them useful and civilized members of the society who contribute towards its development through their humanitarian outlook on life and good manners along with adept spoken and written English language skills.",
    ],
  },
  {
    slug: "computer-science",
    name: "Department of Computer Science",
    programSlug: "bs-computer-science",
    tagline: "Programming, systems and solution development for a technology-driven economy.",
    icon: "computing",
    image: IMAGES.computerLab,
    introduction: [
      "With the onset of rapid economic growth and technological advancements across the globe, the market-oriented subjects have emerged as an essential need for the students to explore new vistas of knowledge and to cater to the nation's development.",
      "Information technology is the fastest growing sector all over the world. Database professionals and Computer Programmers are highly demanded in all competitive markets. Now, it is the call of time to equip our youth with the latest and fast changing technology of computer education. Our future would depend on whether we are users or manufacturers of computers.",
      "The Computer Science Department has established a computer lab which is fully equipped with the latest computers and highly skilled technical staff.",
    ],
    aims: [
      "Realizing the importance and market oriented nature of computer subjects, the Department of Computer Science offers a four years degree program in Computer Science. This program strives to produce highly skilled professionals who apply special skills and knowledge to everyday workplace situations. Most important, we are aiming to build excellent programming and solution development skills.",
    ],
  },
  {
    slug: "psychology",
    name: "Department of Psychology",
    programSlug: "bs-psychology",
    tagline: "Understanding how people think, act and interact — the science of human behaviour.",
    icon: "psychology",
    image: IMAGES.libraryReading,
    introduction: [
      "Department of Psychology is the need of today. The field is important because it offers answers to the question, “What makes humans tick?” Studying psychology can mean walking away with a greater understanding of how humans handle everyday life.",
      "We're all interested in what makes people behave in a certain way, how they think, act and interact with others. That's why studying psychology — the science of human behavior — is interesting in its own right.",
    ],
    aims: [
      "Our psychology courses enable our students to gain an understanding of ideas, theories and methods in psychology, to learn how to analyze and evaluate psychological concepts, and how to develop skills in assessing different kinds of evidence, including both quantitative and qualitative data. It can also help develop a range of widely applicable transferable skills.",
    ],
    careers: {
      intro:
        "Psychology is also a dynamic academic discipline. Psychology graduates are valued for their sound research training and professional approach. They can use the knowledge and skills to develop as applied Psychology. Students or graduates take advantage of exciting and challenging job opportunities in areas such as:",
      areas: [
        "Educational Institutes",
        "Special Education Institutes",
        "Armed Forces",
        "Industry",
        "Health Professions",
        "Management",
        "Advertising and Marketing",
        "Human Resources",
        "Research Organizations",
        "Counseling",
        "Social Services",
      ],
    },
  },
];

export const GRADUATE_PROGRAMS_INTRO = [
  "Al-Asar Degree College (ADC) in affiliation with Kohat University of Science and Technology (KUST), is offering BS four years degree program divided into 8 semesters with 2 semesters each year. By joining this program, you are offered the opportunity to find an area of interest which will enable you to grow and pursue further higher education.",
  "ADC feels proud to announce the following three disciplines of the BS program initially under the umbrella of Al-Asar Welfare Society, Al-Asar Academy, Usterzai Payan, Kohat.",
];

export function getProgram(slug: string) {
  return PROGRAMS.find((p) => p.slug === slug) ?? null;
}
export function getDepartment(slug: string) {
  return DEPARTMENTS.find((d) => d.slug === slug) ?? null;
}
