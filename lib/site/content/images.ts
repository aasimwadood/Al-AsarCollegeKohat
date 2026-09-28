/**
 * Every photograph used on the public site, all taken from the official
 * Al-Asar Degree College prospectus. To replace or add a photo, drop the file
 * in public/images/al-asar and update the entry here — components only ever
 * reference these keys.
 */
export type SiteImage = { src: string; alt: string; width: number; height: number };

const img = (file: string, alt: string, width: number, height: number): SiteImage => ({
  src: `/images/al-asar/${file}`,
  alt,
  width,
  height,
});

export const IMAGES = {
  collegeAerial: img("college-building-aerial.jpg", "Aerial view of the Al-Asar Degree College building among the green hills of Usterzai Payan", 1076, 671),
  campusPanorama: img("campus-panorama.jpg", "Panoramic aerial view of the Al-Asar campus on the hills between Kohat and Hangu", 1800, 566),
  campusBuildings: img("campus-buildings-aerial.jpg", "Al-Asar Academy buildings surrounded by pine trees", 1084, 610),
  campusHillside: img("campus-hillside.jpg", "Al-Asar campus buildings on the hillside", 1051, 722),
  campusCourtyard: img("campus-courtyard.jpg", "Terraced courtyard garden in front of an arched veranda on the Al-Asar campus", 1090, 727),
  campusParking: img("campus-aerial-parking.jpg", "Aerial view of Al-Asar Academy buildings and parking area", 815, 458),
  academyEntrance: img("academy-entrance.jpg", "Entrance of an Al-Asar Academy building bearing the Academy crest", 1039, 584),
  mosque: img("mosque.jpg", "The domed mosque on the Al-Asar campus", 1095, 612),
  diningStudents: img("dining-hall-students.jpg", "Dining hall for students", 1103, 591),
  diningTeachers: img("dining-hall-teachers.jpg", "Dining hall for teachers", 1074, 586),
  schoolHostelBoys: img("school-hostel-boys.jpg", "School students hostel for boys", 687, 459),
  hostelCorridor: img("hostel-corridor.jpg", "Hostel veranda overlooking a garden", 939, 626),
  computerLab: img("computer-lab.jpg", "The Computer Science computer lab", 1443, 926),
  classroom: img("classroom.jpg", "A furnished classroom at Al-Asar Degree College", 664, 596),
  office: img("office.jpg", "An administrative office at the college", 975, 657),
  englishSign: img("department-of-english-sign.jpg", "Department of English signboard", 655, 436),
  psychologyBlock: img("psychology-block.jpg", "Psychology signage on the college building", 1600, 400),
  libraryHall: img("library-hall.jpg", "Students reading at long tables in the library", 850, 566),
  libraryReading: img("library-reading.jpg", "Students studying together in the library", 609, 360),
  libraryShelves: img("library-shelves.jpg", "A student selecting a reference volume from the library shelves", 1401, 758),
  libraryAssembly: img("library-assembly.jpg", "Students attending a session in the library", 644, 363),
  lecture: img("lecture-in-progress.jpg", "A lecture in progress in a classroom", 637, 363),
  quaid: img("quaid-e-azam.jpg", "Portrait of Quaid-e-Azam Muhammad Ali Jinnah", 432, 578),
  chairman: img("chairman-haji-ahmad-raza.jpg", "Haji Ahmad Raza, Chairman, Al-Asar Welfare Society", 1322, 595),
  coordinator: img("coordinator-iqbal-zeb-khattak.jpg", "Prof. Engr. Iqbal Zeb Khattak at his desk", 1088, 725),
  principal: img("principal-zafrullah-khan-wazir.jpg", "Prof. Zafrullah Khan Wazir, Principal", 270, 341),
} satisfies Record<string, SiteImage>;
