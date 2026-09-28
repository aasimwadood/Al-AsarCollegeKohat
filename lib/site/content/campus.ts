/** Campus, facilities, hostels and student life — from the prospectus. */
import { IMAGES, type SiteImage } from "./images";

export type Facility = {
  name: string;
  /** Prospectus wording that mentions the facility. */
  source: string;
  image?: SiteImage;
};

export const FACILITIES: Facility[] = [
  { name: "Computer Lab", source: "A computer lab fully equipped with the latest computers and highly skilled technical staff.", image: IMAGES.computerLab },
  { name: "Library & Digital Library", source: "A rich library plus Digital library supporting English, Computer and Psychology education.", image: IMAGES.libraryHall },
  { name: "Classrooms & Labs", source: "The well equipped labs and classrooms and offices.", image: IMAGES.classroom },
  { name: "Mosque", source: "A beautiful mosque on the campus.", image: IMAGES.mosque },
  { name: "Hostels", source: "Four hostels, each equipped with playground and gym.", image: IMAGES.hostelCorridor },
  { name: "Dining Halls", source: "Dining hall for students and dining hall for teachers.", image: IMAGES.diningStudents },
  { name: "Gardens, Parks & Grounds", source: "An eco-friendly, open air building with gardens, parks and grounds.", image: IMAGES.campusCourtyard },
  { name: "Gym", source: "Gyms, and each hostel equipped with playground and gym." },
  { name: "Parking Areas", source: "Parking areas across the campus.", image: IMAGES.campusParking },
];

export const CAMPUS_GALLERY: { image: SiteImage; caption: string }[] = [
  { image: IMAGES.collegeAerial, caption: "Al-Asar Degree College" },
  { image: IMAGES.campusPanorama, caption: "The campus on the green hills between Kohat and Hangu" },
  { image: IMAGES.mosque, caption: "Mosque" },
  { image: IMAGES.campusCourtyard, caption: "Courtyard garden" },
  { image: IMAGES.campusBuildings, caption: "Academy buildings" },
  { image: IMAGES.diningStudents, caption: "Dining hall for students" },
  { image: IMAGES.diningTeachers, caption: "Dining hall for teachers" },
  { image: IMAGES.schoolHostelBoys, caption: "School students hostel for boys" },
  { image: IMAGES.computerLab, caption: "Computer lab" },
  { image: IMAGES.libraryShelves, caption: "Library" },
  { image: IMAGES.campusHillside, caption: "Campus buildings on the hillside" },
  { image: IMAGES.academyEntrance, caption: "Al-Asar Academy entrance" },
];

export const HOSTELS = {
  intro: "Al-Asar Academy has four hostels, each equipped with playground and gym.",
  list: [
    "Boys hostel for college section",
    "Boys hostel for school section",
    "Girls hostel for girls section and female teaching staff",
    "Teachers hostel for bachelors",
  ],
  details: [
    "About 22 teachers with diversified experiences and qualifications have been accommodated to upgrade and maintain the students' abilities and standards after school hours.",
    "The junior and senior hostels provide accommodation to the students of grade 5 to 10 and 11, 12 respectively. Currently, at least 150 students are provided accommodation within these hostels.",
  ],
  applicationNote:
    "Students should read the rules and regulations before signing the application form (a copy of the rules is attached with the application form).",
};

export const STUDENT_LIFE = {
  enrichment:
    "Through such extension activities, the College has made a conscious effort in creating a culture of social service and responsibility. The activities are run by the students' council headed by the Teacher In-charge for Students Affairs.",
  council: [
    "The Students Council is a student body consisting of student representatives from various classes and has always worked on the ideal of ‘For the students, by the students.’ The Council helps the college to conduct various activities like admissions, arranging seminars, distribution of results, alumni meet, and many more.",
    "The purpose of the student council is to allow students to develop leadership by organizing and carrying out college activities and service projects. In addition to planning events that contribute to college spirit and community welfare, the student council is the voice of the student body. It works towards the betterment of the students and their college experience.",
    "The Council consists of the following 7 clubs where committee members are working together for all the activities. This prestigious apex body serves as a bridge between the students and the college.",
  ],
  motto: "Students of today, leaders of tomorrow.",
  clubs: [
    { name: "Naat and Qirat Club" },
    { name: "Debate Club" },
    { name: "Arts Club", detail: "Essay Writing, Poetry, Painting and Calligraphy etc." },
    { name: "Drama and Culture Club" },
    { name: "Social Welfare Club" },
    { name: "Science Club" },
    { name: "Sports Club" },
  ],
  sports: [
    "We are passionate about sport at Al-Asar Degree College. It plays a vital role in the life of all our pupils here and we have a long tradition of producing competitive and successful teams in both major and minor sports. We are proud to say that Alasrians are regularly selected to earn a good name for Khyber Pakhtunkhwa.",
    "The institution firmly believes in the unique educational and social values that the experience of playing team sports provides, and considers participation in team sports to be very important for all ages or ability levels. Ultimately, everyone is encouraged to represent the institution in the major sports teams.",
    "Team games are integrated into the pattern of the week, encouraging the development of skills in cricket, football, volleyball, basketball, badminton and table tennis. Regular competitive fixtures are well supported, encouraging team spirit, collective responsibility and high personal standards — all attributes that can prove invaluable in future life.",
  ],
  sportsList: ["Cricket", "Football", "Volleyball", "Basketball", "Badminton", "Table Tennis"],
  support:
    "Since its inception Al-Asar Academy has constantly supported the deserving orphan and poor students by completely or partially waiving the school fees, and the Al-Asar Welfare Society every year offers free education (along with all academic expenses) for orphans and poor people in the shape of scholarships.",
};
