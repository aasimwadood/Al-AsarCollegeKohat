/**
 * Rules & policies — attendance, code of honor, discipline, anti-ragging,
 * examinations, library, uniform and hostels — transcribed from the prospectus.
 */

export const ATTENDANCE = {
  minimumPercent: 75,
  general: [
    "Students are expected to be regular and punctual.",
    "Leave is granted only in case of genuine need.",
    "Students should apply for leave on medical grounds within a week of falling ill and the leave application should be accompanied by a medical certificate.",
    "The student must clearly write his/her Roll No., Name, Class, Section and Subjects on the leave application, get it signed by parents and submit it to the Principal's office.",
    "Half day leave is not allowed for students unless there is an emergency.",
  ],
  course:
    "Every student of the University is required to maintain at least 75% of the attendance in each course. A student who fails to meet the minimum requirements of attendance in any course shall not be allowed to take the final examination for that course.",
  lab: "In courses with Lab, every student studying such course is required to maintain at least 75% of the attendance in a lab and 75% in a classroom, separately. A student who fails to meet the minimum requirements of attendance, either in Lab or in a classroom, shall not be allowed to take the final examination for that whole course.",
  escalation: [
    { marker: "Absence reported", body: "The Instructor will report a student's absence, and the student may be placed on attendance probation by his/her HoD." },
    {
      marker: "10 consecutive working days",
      body: "The concerned HoD will notify a student who remains absent from classes for ten (10) consecutive working days through the Departmental notice board and a registered letter to his/her parents.",
    },
    {
      marker: "20 consecutive working days",
      body: "In case a student remains absent for twenty (20) consecutive working days from the classes, he/she will cease to be a student of KUST/College. The HoD shall notify this with a copy to the parents and all other concerned offices of the University.",
    },
  ],
  fines: [
    { item: "Absence for one day", amount: "Rs. 50/-" },
    { item: "Absent on own accord before the commencement of examination", amount: "Rs. 50/- per day" },
    { item: "Without ID card or not in proper uniform", amount: "Rs. 50/-" },
  ],
};

export const CODE_OF_HONOR = [
  "Respect for convictions of others in matters of religious conscience and customs.",
  "Refraining from indulgence in any activity that lowers the honor and prestige of Pakistan in any way.",
  "Truthfulness & honesty in dealing with other people.",
  "Respect for the elders and politeness to all especially to women, children, old people, weak and the helpless.",
  "Respect for his teachers and other authorities of the University.",
  "Cleanliness of body, mind, speech and habits.",
  "Helpfulness to fellow beings.",
  "Devotion to studies and sports.",
  "Protection & care of public property.",
];

export const DISCIPLINE_GUIDELINES = [
  "Be punctual and arrive at the college before the first period starts.",
  "Maintain personal hygiene and attend the college in proper dress.",
  "College students are not allowed to come to the college without uniform. They will not be allowed to enter the college gate.",
  "Use of abusive language is unbecoming of any civilized individual. Defaulters are not welcomed.",
  "College property is the student's own property. It becomes their duty to take care of the same.",
  "Articles like mobile phones, crackers, knives or any other objectionable item must not be brought to the College. Applying of Mehandi, Nail polish or Hair Colour is strictly prohibited. Strict action will be taken against the defaulters.",
  "English speaking is a must for the students while in the premises of the college.",
  "Silence in the corridors during lectures.",
  "Students must not attend classes other than their own without the permission of the Principal.",
  "No Society or Association can be formed in the College and no person invited to address a meeting without the Principal's prior permission and sanction.",
  "No student will be allowed to take active part in current politics.",
  "All College activities must be organized under the guidance and supervision of the Principal and Professor In-Charge with prior permission only.",
  "It is the responsibility of the student to read the notice boards regularly for important announcements made by the College authorities from time to time. They will not be excused or be given any concession on grounds of ignorance.",
  "In case of emergency, a student can leave the college with the permission of the Principal. Only parents and real brothers of the student bearing their ID card can contact the Principal.",
  "Students and their parents are expected to abide by the college rules and abstain from irregularities. Non-compliance of the above instructions will invite severe disciplinary action by the college authorities.",
  "Boys must keep their hair well-trimmed.",
  "Matters not covered under the existing rules or KUST rules will rest at the absolute discretion of the Principal.",
];

export const POINTS_TO_REMEMBER = [
  "Your attendance on all days of observance of function or festival in the college is compulsory.",
  "Whenever you go as a representative of the college or whenever you attend any college function, you must be in proper dress.",
  "All furniture, electric fittings etc. in the college are for your convenience. It is your duty to keep them in good condition.",
  "You must participate in all the college activities wholeheartedly.",
  "Make sure that you have taken all books and stationery required for the day.",
  "Make sure that you have completed the task assigned for the day.",
  "Reach the college at least five minutes before the starting of first period.",
  "Strictly avoid fiddling with the smart class equipment fitted in your classroom.",
  "Remember to switch off the light points and close the classroom door if you are the last to leave the classroom for your outdoor class.",
  "Gate pass is a must for the students to move out from the classroom.",
];

export const PROHIBITED_ACTS = {
  intro:
    "The following acts are prohibited for students and involvement of any student in any of these acts shall make them liable to penalties as described in these regulations:",
  items: [
    "Violation of any law of the country.",
    "Assault on the faculty, staff or fellow student of the university.",
    "Possession or consumption of any alcoholic drinks, prohibited drugs/intoxicants on the campus, using unauthorized medicines etc.",
    "Possession of arms of any kind, knives, blades or any sort of weapon, playing with fire-works, carrying catapult, shooting of birds, bringing pets, mobile phone, record players or radios, etc.",
    "Smoking in public places.",
    "Organizing any function/activity on the campus without the approval of the competent authority.",
    "Participation in any function organized on campus without the approval of the competent authority.",
    "Collecting money or receiving funds or pecuniary assistance for or on behalf of the University Organization except with the written permission of the Vice-Chancellor.",
    "Practices like staging, inciting or participating in protests, or abetting any walkout, strike, or other form of agitation against the University or its teachers or officers, inciting anyone to violence, disruption of the peaceful atmosphere of the University in any way, making inflammatory speeches or gestures which may cause resentment, issuing of pamphlets or cartoons casting aspersion on the teachers or staff of the University or the University bodies, or doing anything in any way likely to promote rift and hatred among the various groups or classes of the student community, issuing statements in the press making false accusations or lowering the prestige of the University.",
    "Stealing.",
    "The College prohibits any conduct by any student or students which has the effect of teasing, treating or handling with rudeness a fresher or any other student or indulging in rowdy or undisciplined activities. Ragging is totally prohibited in the Institution & anyone found guilty of ragging and/or abetting ragging, whether actively or passively, is liable to be punished in accordance with the regulations.",
  ],
};

export const INDISCIPLINE = {
  intro: "A student shall be held responsible for any of the following acts of indiscipline and shall be punished accordingly:",
  items: [
    "Commits any criminal or dishonorable act (whether committed within the College area or outside) or any act which is prejudicial to the interest of the University/College; shall be guilty of an act of indiscipline and shall be liable for each such act to one or more of the penalties mentioned in these regulations/rules.",
    "Posting any message, picture or video on social media about any fellow student and staff.",
    "Posting any political slogan on social media using the University/College name or logo.",
    "Posting any material on social media against any person, political parties, ethnic group, religion or any other organizations using the university platform.",
    "Commits a breach of rules of conduct as notified by the University from time to time.",
    "Disobeys the lawful order (verbal/written) of a teacher/officer/authority of the College, showing rudeness to teachers/warden/other staff etc.",
    "Deliberately damages property of the College/staff/students.",
    "Does not pay the fees, fines or other dues payable under the university/college regulations and rules.",
    "Does not comply with the rules relating to residence in hostels.",
    "Using indecent language, wears immodest dress, makes indecent remarks or gestures or behaves in a disorderly manner.",
    "Commits any offensive/sexual behavior as defined under the HEC Policy Guidelines against Sexual Harassment and adopted by the University.",
    "Instances of moral turpitude.",
  ],
};

export const PENALTIES =
  "On account of misconduct/breach of discipline, a student may be fined, rusticated from a course/subject, expelled from department/college/hostel for a specified period, or his admission may be cancelled, withdrawn, or he may be removed from sports ground or events etc. An appeal against any punishment shall be made to the Higher Authority within 15 working days of the notification of the decision.";

export const ANTI_RAGGING = {
  statement:
    "The college has a zero tolerance policy towards ragging. The college conforms to all the guidelines on Anti-Ragging issued from time to time.",
  definitionIntro: "Ragging constitutes one or more of any of the following acts:",
  definitions: [
    "Any conduct by any student or students whether by words spoken or written or by an act which has the effect of teasing, treating or handling with rudeness a fresher or any other student.",
    "Indulging in rowdy or undisciplined activities by any student or students which causes or is likely to cause annoyance, hardship, physical or psychological harm or to raise fear or apprehension thereof in any fresher or any other student.",
    "Asking any student to do any act which such student will not in the ordinary course do and which has the effect of causing or generating a sense of shame, or torment or embarrassment so as to adversely affect the physique or psyche of such fresher or any other student.",
    "Any act by a senior student that prevents, disrupts or disturbs the regular academic activity of any other student or a fresher.",
    "Exploiting the services of a fresher or any other student for completing the academic tasks assigned to an individual or a group of students.",
    "Any act of financial extortion or forceful expenditure burden put on a fresher or any other student by students.",
    "Any act of physical abuse including all variants of it: sexual abuse, homosexual assaults, stripping, forcing obscene and lewd acts, gestures, causing bodily harm or any other danger to health or person.",
    "Any act or abuse by spoken words, emails, post, public insults which would also include deriving perverted pleasure, vicarious or sadistic thrill from actively or passively participating in the discomfiture to fresher or any other student.",
    "Any act that affects the mental health and self-confidence of a fresher or any other student with or without an intent to derive a sadistic pleasure or showing off power, authority or superiority by a student over any fresher or any other student.",
    "Any act of physical or mental abuse (including bullying and exclusion) targeted at another student (fresher or otherwise) on the ground of colour, race, religion, caste, ethnicity, gender (including transgender), sexual orientation, appearance, nationality, regional origins, linguistic identity, place of birth, place of residence or economic background.",
  ],
  actionIntro:
    "The institution shall punish a student found guilty of ragging after following the procedure and in the manner prescribed hereunder:",
  actions: [
    "Suspension from attending classes and academic privileges.",
    "Withholding/withdrawing scholarship/fellowship and other benefits.",
    "Debarring from appearing in any test/examination or other evaluation process.",
    "Withholding results.",
    "Debarring from representing the institution in any regional, national or international meet, tournament, youth festival, etc.",
    "Suspension/expulsion from the hostel.",
    "Cancellation of admission.",
    "Rustication from the institution for a period ranging from one to four semesters.",
    "Expulsion from the institution and consequent debarring from admission to any other institution for a specified period.",
  ],
};

export const EXAMINATION = {
  intro: "For the BS 4 year degree program, there is a semester system of examination in Al-Asar Degree College.",
  session:
    "An academic year/session under the semester system comprises 02 regular semesters and an optional summer (shorter duration) semester.",
  semesters: [
    { name: "Fall Semester", window: "September – January", body: "Fall Semester normally starts in September and ends in January." },
    { name: "Spring Semester", window: "February – June", body: "Spring Semester normally starts in February and ends in June." },
    {
      name: "Summer Semester",
      window: "July – August (optional)",
      body: "A summer semester of 08 weeks duration may be offered during July and August. During the Summer Semester, the teaching hours per course per week will be increased to ensure the completion of total academic hour requirements per credit hour described under these rules.",
    },
  ],
  regularStructure:
    "The Regular Semester (Fall/Spring) shall consist of 15 weeks of teaching and 02 weeks of Final Examinations. The Mid Semester Examinations, Quizzes and Assignments are part of the teaching during the semester. In case of untoward circumstances, the duration of the semester may be changed, but the total academic hours must be completed. There may be a break of one week from teaching around the middle of a regular semester (Mid Semester Break/Sports Gala). During this period, co-curricular and extracurricular activities are organized by the University.",
  marksNote: "The following example is a guideline for one such distribution at the undergraduate level:",
  theoryCourse: {
    title: "03 credit hours — 3(3+0) course",
    rows: [
      { label: "Quizzes", percent: 10 },
      { label: "Homework", percent: 10 },
      { label: "Class Participation", percent: 5 },
      { label: "Mid Semester", percent: 25 },
      { label: "Final Exam", percent: 50 },
    ],
  },
  labCourse: {
    title: "04 credit hours — 4(3+1) course",
    intro:
      "Students' performance shall be evaluated by giving 25% weightage to their performance in Lab and 75% weightage to their performance in theory. A minimum of 13–15 experiments should be conducted during the semester where each experiment should be marked out of 10 using the above parameters.",
    lab: [
      { label: "Quizzes / Presentations / Assignments / Practical", percent: 15 },
      { label: "Lab attendance / lab report / conduct of experiment during lab; Final Examination / Viva voce", percent: 10 },
    ],
    theory: [
      { label: "Quizzes", percent: 5 },
      { label: "Assignment / Presentation", percent: 5 },
      { label: "Class Participation", percent: 5 },
      { label: "Mid-Semester Examination", percent: 20 },
      { label: "Semester Final Examination", percent: 40 },
    ],
  },
  offencesIntro:
    "Cases of indiscipline inside/in the premises of the examination hall(s) or use of unfair means shall be dealt with by the Examination Discipline Committee. Such cases shall be initially reported to the Departmental Discipline Committee constituted by the HoD under the KUST Statutes.",
  unfairMeansIntro:
    "Any candidate found guilty of the following matters, his/her case will be submitted to the Unfair Means Cases Committee (Semester system) constituted by the Head of the College/Institute.",
  offences: [
    {
      penalty: "Imposition of fine to a maximum of Rs. 20,000/-",
      items: [
        "Submits forged or fake documents in connection with an examination.",
        "Does anything that is immoral or illegal in connection with examination and which may be helpful to him/her in the examination.",
        "Misbehaves or creates any kind of disturbance in or around premises of the examination center.",
        "Uses abusive or obscene language in the answer script.",
        "Possesses any kind of weapon in or around premises of the examination center.",
        "Possesses any kind of electronic device which may be helpful in the examination.",
      ],
    },
    {
      penalty: "Cancellation of paper",
      items: [
        "(i) Willfully damages (removes a leaf from his answer book or mutilates) the answer book once during an examination.",
        "(ii) Cheating/copying from paper, book or notes.",
      ],
    },
    {
      penalty: "Cancellation of examination / cancellation of admission",
      items: [
        "Repeating 2(i).",
        "Repeating 2(ii).",
        "Commits impersonation in the examination.",
        "Assault on the faculty, staff and students of the university.",
      ],
    },
  ],
  appeal:
    "If a student is not satisfied with the decision of the Unfair Means Cases Committee, he/she may submit an appeal to the Appellate Committee through the office of the HoD within a week after the notification of the decision.",
};

export const LIBRARY = {
  purpose:
    "The Library of the Al-Asar Degree College supports the mission of the college and is committed to providing information leading towards excellence in English, Computer and Psychology education. It endeavors to help students to gather multi-faceted knowledge and thereby facilitate the process of knowledge revolution and overall holistic personality development.",
  members: ["All regular and contract staff of the College", "All students of the College"],
  borrowing: [
    "A card will be issued to each member for the borrowing of books. This card will be provided to the user in a week after submission of the library registration form, will not be transferable, and should be surrendered at the time of taking clearance certificate for exam as well as for final degree.",
    "Library card (borrower card) will be valid up to the last semester exam clearance date.",
    "A member who loses his card shall inform the librarian in written form so that a duplicate card is issued to the member against a fine of Rs. 200.",
    "A duplicate card shall be issued 2 times only; thereafter, the library membership of the loser will be cancelled.",
    "Overdue books shall be punishable with a fine of Rs. 50 per day.",
    "No student shall be allowed to appear in the examination held by the College unless he or she obtains a clearance slip from the library to the effect that he or she has no books outstanding against them.",
    "In case a book is urgently required, the librarian may recall it at short notice any time and such a book shall be returned immediately by the borrower.",
    "In case of donated material, thesis, reports etc., the librarian will assess the cost/value of the material.",
  ],
  loanPeriods: [
    { member: "Teaching faculty", books: 6, period: "1 month" },
    { member: "Students", books: 4, period: "14 days" },
    { member: "Officers", books: 2, period: "14 days" },
  ],
  referenceOnlyIntro:
    "Reading material of the following nature shall not be issued. It can be consulted in the library only (except in special cases):",
  referenceOnly: [
    "Reference material (dictionaries, encyclopedias, atlases and other material marked “R”)",
    "Thesis, Research Reports, Pamphlets, Syllabi, Acts, Newspapers, Journals, etc.",
    "Microfilms, Slides, Cassettes, Tape Recorders and other allied materials",
    "All unprocessed materials",
    "Current periodicals",
    "Other materials assigned by the librarian",
  ],
  damageLoss: [
    "In case a member loses or damages a book, he/she shall stand liable to either of two conditions: either buy the book and hand it over to the library along with 25 percent of its price as fine, or pay three times the (current) price of the book. The price of a rare book shall be decided by the librarian.",
    "If a member leaves the organization without returning books borrowed from the library, the price of the book will be adjusted against his dues with the organization. If there is no outstanding balance to his name, his guarantor will pay the dues.",
  ],
  generalRules: [
    "A member shall not mutilate, or damage by writing or marking on pages. Violation of this rule shall require replacement of the damaged volume or payment of its price.",
    "If one volume of a set series is damaged and it is not available separately, the whole set shall have to be replaced.",
    "Members are advised to inspect books or other material at the time of issuance.",
    "During stocktaking, all library users should return their issued materials for checking purposes.",
    "The librarian is authorized to withdraw library facilities from any member who is found misusing the library material or facilities.",
    "Members of the library shall deposit their belongings at the counter near the entrance.",
    "In case any personal reading material has to be taken inside the library, permission must be sought from the librarian.",
    "All reading materials issued to the user shall be shown to the attendant at the exit before leaving.",
    "Eating, smoking, sleeping, mobile use, chatting and making noise is strictly prohibited in the library premises.",
    "Theft of books and tearing of pages is a crime.",
    "Complete silence shall be observed.",
  ],
  digital: [
    "Only the digital library should be used through the computers.",
    "No one is allowed to open or close the input and output devices of the computers.",
    "The USB permission must be taken from the desk in charge.",
    "The internet will be used by a user only for an hour and will be vacated for other users after a use of one hour.",
  ],
  clearance: [
    "Books will not be issued unless the clearance of borrowed material of the previous semester.",
    "No student shall be allowed to appear in the examination unless he or she obtains a clearance slip from the library.",
    "The library card should be surrendered at the time of taking the clearance certificate for exam as well as for the final degree.",
  ],
};

export const UNIFORM = {
  boys: {
    summer: [
      "Knee length, full sleeves shirt with collar and proper Shalwar.",
      "Men's jewelry is forbidden.",
      "Black shoes / black joggers with black socks. Open slippers are not allowed.",
    ],
    winter: "Addition of Sky Blue waistcoat and Sky Blue coat.",
  },
  girls: {
    summer: [
      "White cotton / wash-n-wear uniform: below knee length, full sleeves shirt with half collar having buttons and proper Shalwar and Dupatta with Sky Blue lab coat (no need of wearing lab coat if she wears Burka etc.). Tight Pajamas / Jeans etc. are not allowed.",
      "Make-up and jewelry are forbidden.",
      "Black shoes / black joggers with black socks. Open slippers are not allowed.",
    ],
    winter: "Addition of Sky Blue coat.",
  },
  general: [
    "Uniform can be made available by the institution on order.",
    "Neat and complete uniform, according to the season, as above, is a must for all.",
    "All students are expected to observe simplicity.",
    "Fine is levied and strict disciplinary action is taken in case of non-observance of uniform.",
  ],
};

export const HOSTEL_RULES = [
  "Smoking, alcohol & narcotic consumption is strictly prohibited in and around the hostel premises. Strict action will be taken against offenders.",
  "Loitering in the hostel campus during class hours will not be appreciated.",
  "The Management & Staff will not be responsible for personal belongings.",
  "Late comers will be penalized.",
  "Students must keep the campus & rooms clean. Defacing walls, equipment, furniture etc. is strictly prohibited.",
  "Birthday/other celebrations are strictly prohibited in the hostel.",
  "Students must turn off all electrical equipment & lights before leaving their rooms.",
  "Students are not allowed to organize any group activities in their room.",
  "Food will be served only in the designated Dining Hall(s) and only during the specified timings. Wasting food & water will not be encouraged.",
  "All lights must be switched off before 11 pm in the rooms. Only study lamps are permitted.",
  "Students are not allowed to use mobile phones without the permission of the warden. Cell phones of those at fault will be confiscated.",
  "Tipping of Wardens, Security Guards, Cleaning staff etc. is not permitted.",
  "Visitors are allowed only in the Warden Room between 4:30 p.m. and 6:30 p.m. Visitors are not allowed beyond the visiting area. No outside guests/students will be allowed inside the hostel.",
  "Any complaints regarding electric equipment, plumbing etc. are required to be brought to the notice of the Head Boys who will inform the Warden concerned accordingly.",
  "Students should not enter other hostels or rooms of other students in the same hostel without permission.",
  "Strict silence shall be observed in the hostel during study and sleeping hours. Care should be taken at all times to ensure that music/loud talking is NOT audible outside the room.",
  "Any manner of festivities and noise making/celebrations will not be entertained, which may cause disturbance to other inmates in the hostel premises.",
  "Students during their stay in the hostel will be governed by the management rules. In case of non-compliance of the rules, a student's admission can be cancelled or a fine can be imposed after the recommendation of the Warden and approval of the Principal.",
];
