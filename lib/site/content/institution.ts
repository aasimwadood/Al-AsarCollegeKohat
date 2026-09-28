/**
 * Institutional content, transcribed from the official Al-Asar Degree College
 * prospectus. Wording is the prospectus's own; only obvious spelling slips
 * have been corrected. Do not add facts here that the prospectus (or the
 * college administration) has not supplied.
 */
import { IMAGES, type SiteImage } from "./images";

export const QUAID_MESSAGE = {
  heading: "Quaid's Message for Students",
  quote:
    "Develop a sound sense of discipline, character, initiative and a solid academic background. You must devote yourself whole-heartedly to your studies, for that is your first obligation to yourselves, your parents and to the state. You must learn to obey for only then you can learn to command.",
  attribution: "Muhammad Ali Jinnah",
  context: "Islamia College, Peshawar — 12th April, 1948",
};

export const WELCOME = {
  heading: "Welcome to Al-Asar Degree College, Usterzai Payan, Kohat",
  paragraphs: [
    "Al-Asar community (General public, Al-Asar Welfare Society (AWS), Chairman of the Society, Principal, Staff, Alumnae and Students of Al-Asar) is delighted to have this opportunity to welcome you for the upcoming first-ever entry to Al-Asar Degree College for higher degree programs.",
    "Our changing world is full of challenges and opportunities for young people. Finding an institution that can provide an education to fully prepare them for what lies ahead is vital. Al-Asar Welfare Society is one of those providing such types of educational opportunity on elementary, secondary and now on degree level too.",
    "The evolution of Al-Asar Academy, founded by the Al-Asar Welfare Society, is not the story of days; it is rather a continuous fruit of continuous effort which is still moving forward. Founded in 1993 as a middle level school, it sprung into full-fledged two separate sections for Boys and Girls from class Nursery to 12th. And now another milestone of graduation, degree level education, is achieved. It is located in a spacious area of about 200 Kanals outside the city, placed on the top of green hills in the middle of Kohat and Hangu district. Its panoramic site, tranquil atmosphere and pollution free environment have made it charming and attractive for all.",
    "We are one of Kohat's leading educational institutions i.e. Schools for Boys and Girls, for both boarding and day school pupils, a Technical college and the newly established degree college having departments of English, Psychology and Computer Science. Traditional and innovative educational methods, first-class facilities all combine to provide a uniquely rounded learning experience for boys and girls.",
    "The amount of time and pages would not be sufficient to record here all the achievements of Al-Asar Academy. But to mention just a few, every member of this society must acknowledge the struggle and contribution of the Chairman of Al-Asar Welfare Society, Haji Ahmed Raza, as it is not a private institution built for business purposes only, rather is a welfare society which every year offers free education (along with all academic expenses) for orphans and poor people in the shape of scholarships. Another best thing about Al-Asar educational institutions are the location and buildings that it possesses. Moreover, I assure that we have got well-qualified and skilled staff, who are utilizing their energies in best possible ways to make Al-Asar Degree College and its students more successful, educated, practical and able to compete in the market of the modern world.",
    "Unlike any other institution, Al-Asar Degree College is eco-friendly with its open air building, gardens, parks, grounds, parking areas, hostels, gym etc. Amidst this fresh and open environment, Al-Asar has got a unique nature for academic development as well. We have a well-equipped computer lab and a library. Moreover, Al-Asar community is here to support you every step of the way in your academic journey and career development.",
    "Ultimately however, to really understand the warm and welcoming atmosphere that makes Al-Asar different, you have to experience the college in person. So please pay us a visit — you will soon realize why we are so proud of our institutions.",
    "Al-Asar Academy, a beacon for the area, is producing students who are very assertive, alert and lively in their expression. It has, by the grace of God, won the confidence of the inhabitants of the area and it has succeeded in earning name and fame. May it prosper!",
  ],
  signature: "Al-Asar Community",
};

export const HISTORY = {
  paragraphs: [
    "The idea of establishing this Academy got reality in 1993 with collaboration of five dedicated, hard-working and honest persons of Usterzai Payan, Kohat. Among them Mr. Haji Ahmad Raza has been playing an active role since its inception till date.",
    "Initially, the concentration remained only to help the needy and deserving students of Usterzai by collecting money from the rich, which helped the students in getting books, uniform etc. As the time passed, their determination got stronger to achieve their goal of community uplift. At last, they managed to get enough resources as well as an area of around 148 kanals to erect the pillars of Al-Asar Academy.",
  ],
  closing: "The Academy has still a long way to achieve further expansion of its campus and to deliver best education to the generations.",
};

/** "Apart from Al-Asar Degree College, the Academy comprises of …" */
export const ACADEMY_COMPONENTS = [
  "Al-Asar Public School & College for Boys",
  "Al-Asar Public School & College for Girls",
  "Imam Ali Raza (A.S) Orphan Hostel",
  "School Students Hostel for Boys",
  "College Students Hostel for Boys",
  "School & College Students Hostel for Girls",
  "Bachelor Teacher Hostel",
  "Suite for Principal",
  "Beautiful Mosque",
  "Dining hall for students",
  "Dining hall for teachers",
];

/**
 * Journey milestones. Only events the prospectus states are listed; where it
 * gives no year, none is shown.
 */
export const JOURNEY = [
  {
    marker: "1993",
    title: "An idea becomes reality",
    body: "Five dedicated residents of Usterzai Payan, Kohat — among them Haji Ahmad Raza — establish the Academy, first helping needy and deserving students with books and uniforms.",
  },
  {
    marker: "Campus",
    title: "Pillars of the Academy",
    body: "Their determination for community uplift grows stronger, and they manage to get enough resources as well as an area of around 148 kanals to erect the pillars of Al-Asar Academy.",
  },
  {
    marker: "Growth",
    title: "From middle school to Nursery–12th",
    body: "Founded as a middle level school, Al-Asar Academy grows into two separate full-fledged sections for Boys and Girls, from class Nursery to 12th.",
  },
  {
    marker: "2024–25",
    title: "Degree-level education",
    body: "Al-Asar Degree College welcomes its first-ever session for BS programs in English, Computer Science and Psychology, in affiliation with KUST.",
  },
];

/**
 * Figures quoted with the context in which the prospectus states them.
 * The prospectus gives two different land figures in two different
 * contexts; both are kept, each with its own context, rather than being
 * reconciled into one number.
 */
export const FACTS_IN_CONTEXT = [
  { value: "1993", label: "Al-Asar Academy founded", context: "Our History" },
  { value: "3,000", label: "Students, Nursery to Higher Secondary", context: "2,000 boys and 1,000 girls — Our Future" },
  { value: "700", label: "Orphan students studying in the Academy", context: "Some supported by the institute — Our Future" },
  { value: "3", label: "BS degree programs", context: "English, Computer Science, Psychology" },
];

export const CAMPUS_AREA_NOTE = {
  welcome: "“about 200 Kanals outside the city, placed on the top of green hills in the middle of Kohat and Hangu district” — describing the Academy's location (Welcome).",
  history: "“an area of around 148 kanals to erect the pillars of Al-Asar Academy” — describing the land first acquired (Our History).",
};

export const FUTURE = {
  paragraphs: [
    "Currently as many as 3000 students (2000 boys and 1000 girls) are studying in various grades from Nursery to Higher Secondary levels.",
    "Since its inception Al-Asar Academy has constantly supported the deserving orphan and poor students by completely or partially waiving the school fees. At present 700 orphan students are studying in the academy with some being supported by this institute. However, the majority of the students still need financial assistance.",
    "In addition to the current three BS degree programs in English, Computer Science and Psychology, the college building has the capacity for more programs, and we intend to provide Degrees and Diplomas in:",
  ],
  plannedPrograms: [
    "BS Biology",
    "BS Physics",
    "BS Electronics",
    "BS Telecommunication",
    "BS Chemistry",
    "BS Mathematics",
    "BS Urdu",
    "BS Political Science",
    "BS Pak Studies",
    "BS Education",
    "BS Software Engineering",
    "BS Nursing",
    "BS Radiology",
    "BS Lab Technology",
  ],
  plannedProgramsNote: "And many more",
};

export type LeaderMessage = {
  slug: string;
  name: string;
  designation: string;
  office: string;
  credentials?: string;
  photo: SiteImage;
  /** Photo framing for cropped portraits. */
  photoPosition?: string;
  motto?: string;
  excerpt: string;
  paragraphs: string[];
  closing?: string;
  signature?: string;
};

export const LEADERSHIP: LeaderMessage[] = [
  {
    slug: "chairman",
    name: "Haji Ahmad Raza",
    designation: "Chairman",
    office: "Al-Asar Welfare Society",
    photo: IMAGES.chairman,
    photoPosition: "72% 30%",
    motto: "Every child is like a seed having a potential to grow if nourished with love and care.",
    excerpt:
      "The tiny seedling sowed thirty years ago has now grown into a full-fledged tree with penetrated roots and spreading its branches.",
    paragraphs: [
      "Ever since its inception, Al-Asar Academy has been instrumental in discovering itself through its students spawned over a number of motivated alumni who have in their various spheres reached the heights of excellence both in Pakistan and abroad. The tiny seedling sowed thirty (30) years ago has now grown into a full-fledged tree with penetrated roots and spreading its branches.",
      "Here, at Al-Asar all challenges are met with composure and patience of energetic and well qualified and experienced teaching staff. The focus is always on a comprehensive and holistic development of its students.",
      "Al-Asar Academy feels satisfied at having achieved its objective of providing to the community a steady stream of enlightened professionals.",
      "Wishing for the Principal's, staff and the students' success for future and may the flag of Al-Asar Academy be always held high!",
    ],
    signature: "Haji Ahmad Raza",
  },
  {
    slug: "coordinator",
    name: "Prof. Engr. Iqbal Zeb Khattak",
    designation: "Coordinator",
    office: "Al-Asar Academy",
    credentials: "M.Phil. (Engg.), Master in IT, Ex Director, Gomal University Sub Campus",
    photo: IMAGES.coordinator,
    photoPosition: "40% 30%",
    motto: "Education is a shared commitment between dedicated teachers, motivated students and enthusiastic parents with high expectations.",
    excerpt:
      "We seek solutions not excuses, deliver great results and serve the community by imparting quality education.",
    paragraphs: [
      "As Principal, it's a privilege to have the opportunity to lead Al-Asar education institutions in its next exciting phase of development to higher education by establishing Al-Asar Degree College. It is nice to greet you all for the upcoming first ever session 2024-2025 and expect that it brings in desired fruits to each one of you.",
      "We begin with our aim to strive for better and not to rest on our laurels here at Al-Asar Academy. We seek solutions not excuses, deliver great results and serve the community by imparting quality education.",
      "I believe that the role of educational institutions is not only to pursue excellence but to channelize and empower its students to be lifelong learners, critical thinkers and productive members of an ever changing global society.",
      "Here at Al-Asar Academy we are striving hard to provide a blend of scholastic and co-scholastic activities. Best possible efforts by a team of well qualified faculty and efficient mentors is being made to inculcate strong values combining with academics and extra-curricular activities. Harnessing and sprouting every individual into a self-reliant, independent, determined and focused adult to shoulder responsibilities, as an integral part of life.",
      "Children require a supportive environment at education institutions as well as at home. Targeting specific goals & priorities we help children to move forward purposefully in life and have the pleasure of watching their dreams turned to reality.",
      "I request parents who are the most strengthening power to join hands with us in molding the future of children. Your consistent support empowers us to do the best, and I pay gratitude to you for having faith in us. I am also thankful to the management who has always been by my side and guiding me to add a new leaf to the grandeur of this elite education city.",
    ],
    signature: "Prof. Engr. Iqbal Zeb Khattak",
  },
  {
    slug: "principal",
    name: "Prof. Zafrullah Khan Wazir",
    designation: "Principal",
    office: "Al-Asar Degree College",
    photo: IMAGES.principal,
    photoPosition: "50% 20%",
    excerpt:
      "Sincerity, commitment and hard work are our guiding principles; and our focus is on fostering critical and analytical thinking of students.",
    paragraphs: [
      "Love and wishes!",
      "I feel obliged to extend my heartfelt gratitude and thanks to the Chairman Al-Asar Welfare Society, Haji Ahmad Raza, and the Coordinator Al-Asar Academy, Prof. Iqbal Zeb Khattak for offering me the position of Principal in the newly established Degree College Usterzai Payan, Kohat, because to be a part of Al-Asar family is a matter of pride, prestige and privilege. I feel highly indebted for this great honor, tantamount to the recognition of my academic and administrative services at Govt Colleges and Universities of KP. And I feel excited to honor this new venture of great mission and vision to the best of my potential, skills and expertise. Keeping in view the Vision and Mission of Al-Asar Welfare Society and the facilities and arrangements for the BS programs, I feel confident that this institution will become an example of itself amidst the institutions offering graduate level education and research.",
      "The history of Al-Asar Academy is witness to the fact that this education complex is a place of intellectual, moral and spiritual growth where students are trained to face the challenges of life with dignity, integrity and success. Apart from producing doctors, engineers, civil servants and teachers etc, Al-Asar has produced educated people who prove the epitome of gentility, humanity, fairness, courage and sacrifice.",
      "Welcome to Al-Asar Degree College! Just come, you will stay for long for yourself. Here everything is worth seeing and worth visiting — the panoramic natural beauty, the serenity and tranquility, the beautiful buildings, gardens, gyms, hostels, the well equipped labs and classrooms and offices, rich library plus Digital library, and above all the missionary zeal and fervor for the great cause of humanity and service to the community and nation. Students are invited to join us for BS programs in English, Computer Science and Psychology. You can trust us; we are determined and skilled to lead our students in their pursuit of academic excellence and professional development. Sincerity, commitment and hard work are our guiding principles; and our focus is on fostering critical and analytical thinking of students for a true comprehension of concepts and ideas and their applications in real life. Here Education and Research go hand in hand.",
      "To cut the matter short, we have dreams of plans, policies and strategies to take the students out of the rut of rote learning, cramming and memorizing (without understanding) and put them on the track of fact finding and research that leads to comprehension, appreciation, interpretation and critical evaluation. The faculty will prove that they are mentors, leaders, guides, helpers, facilitators in your struggle in pursuit of academic achievements and leadership qualities. Get assured, Al-Asar Degree College will prove itself a congenial scholarly place where you will get great education with a big difference. And mark the words: we have promises to keep and miles to go before we sleep.",
    ],
    closing: "Thank you for your time and consideration! Adieu!",
    signature: "Prof. Zafrullah Khan Wazir",
  },
];

export function getLeader(slug: string) {
  return LEADERSHIP.find((l) => l.slug === slug) ?? null;
}
