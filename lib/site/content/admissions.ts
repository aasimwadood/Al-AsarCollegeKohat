/** Admissions, merit and fee/refund rules — from the prospectus "Admissions" and "Fee Structure" sections. */

export const ADMISSIONS_INTRO =
  "The University/Affiliated Colleges shall admit students to the programs offered by the University through regulations laid out in this document. At the time of admission, every student shall submit a character certificate issued by the institutions earlier attended; failing this the admission may not be considered confirmed.";

export const ADMISSION_PROCEDURE = [
  "The admissions into BS or equivalent programs shall be widely advertised (both in local and national print media as well as social media) by the office of Admission.",
  "The admission shall be open to all as per Khyber Pakhtunkhwa University Act including for those as per quota approved by the competent authorities from time to time, provided the approved eligibility criteria for the programs are met.",
  "Applications shall be received and processed as per procedure advertised at the time of admissions.",
  "The admission shall be based on merit established through the performance of the candidates in SSC or equivalent, HSSC or equivalent and the percentage marks in the entrance exam (NAT/ETEA/ETC/other approved modes of entrance test). The acceptable percentage marks in entrance test shall be as approved from time to time by the competent authority.",
  "Candidates without valid results of the entrance test shall be allowed to register for admission. However, their cases shall be considered for admission only after fulfilling the eligibility requirements duly supported by documentary evidence.",
  "The admission offered shall be initially considered provisional and shall be confirmed through a notification by the HoD after due verification of the supporting documents. Any mistake in the documentary evidence or false statement on part of the candidate may lead to the cancellation of admission.",
  "In cases of equivalency, only a certificate issued by the IBCC shall be considered acceptable for the purpose of admission.",
  "A candidate may apply for admission to more than one degree program with the condition to clearly state priorities. In case a student fails to accept an offer made in a program of his first choice during the due period, he may be considered for admission into any other program depending on the availability of seats as per his eligibility and merit.",
  "A candidate can apply on general merit as well as on reserved quota at the same time. In case of unavailability of eligible candidates for a particular program, reserved quota or open merit may be considered inter-convertible with the approval of the Higher Authority.",
];

export const MERIT_COMPONENTS = [
  { key: "A", label: "SSC / Equivalent", weight: 10, detail: "Percent marks in SSC or equivalent" },
  { key: "B", label: "HSSC / Equivalent", weight: 40, detail: "Percent marks in HSSC or equivalent" },
  {
    key: "C",
    label: "NAT / Entrance Test / Approved Test",
    weight: 50,
    detail: "Percent marks in NAT / Entrance Test (ETEA) / ETC (HEC) / other Provinces Testing Agencies with valid passing marks",
  },
];

export const MERIT_PROCESS = [
  "A general merit list shall be displayed online / on Departmental Notice Boards or both, opened for queries.",
  "Queries regarding the merit list shall be entertained within the notified time period both online as well as through mode of communication by the office of the respective HoD.",
  "After entertaining all sorts of queries, the HoD shall notify offer of admission through a list displayed online / on departmental notice boards.",
  "In case of availability of seats, admission could be extended through the notification of second, third, etc. merit lists.",
  "The provisionally admitted students shall submit their supporting documents in original in the office of the respective HoD for verification. Any evidence found contradictory to the already submitted copies of the documents at the time of admission may lead to the cancellation of admission.",
  "There shall be no requirement of provision of NOC / study leave for admission in any degree program at KUST.",
  "If a student is expelled or ceased from the degree program based on poor academic performance, he/she may not be allowed admission in the same degree program again.",
];

/** Documents the prospectus explicitly mentions. Nothing else is listed. */
export const REQUIRED_DOCUMENTS = [
  { item: "Character certificate", detail: "Issued by the institution(s) earlier attended — without it the admission may not be considered confirmed." },
  { item: "Supporting documents in original", detail: "Submitted to the office of the respective HoD for verification by provisionally admitted students." },
  { item: "IBCC equivalence certificate", detail: "Required in cases of equivalency — only a certificate issued by the IBCC is acceptable." },
  { item: "Valid entrance test result", detail: "NAT / ETEA / ETC (HEC) or another approved test, where available at the time of application." },
];

export const INELIGIBILITY =
  "Persons convicted for moral turpitude by a court of law shall not be eligible for admission to any program in the University/College. A candidate who has been rusticated/expelled or whose entry in any College/University of the country has been banned for any reason whatsoever at any time during his academic career shall not be admitted to any program without permission of the Syndicate.";

export const CONFIRMATION =
  "All the admissions will be provisional till the approval of the competent authority. No candidate will be entitled to deposit any dues if admission is not offered or claim any right till the confirmation of the admission.";

export const CANCELLATION = [
  "The Head of the respective teaching department reserves the right to refuse/cancel the admission of candidates at any stage or revoke the degree of one who obtained his/her admission by making any misstatement or concealing a material fact particularly regarding his/her age, domicile, marks obtained, degree, or due to any other valid reason. Appeal against any such decision can be made to the Head of College / Admission Appellate Committee. Such cancellation shall be notified on the notice board and shall be immediately communicated to the candidate concerned through registered post on the address as mentioned in the admission form.",
  "The condition of receipt/issuance of migration certificate has been relaxed for those candidates/students who are registered for 02 degree programs simultaneously as per the HEC policy.",
];

export const APPEALS =
  "When a candidate has been refused admission or his admission has been cancelled, he/she will be entitled to prefer an appeal before the Appellate Committee within three (03) days of the notification displayed on the notice board of the department concerned. All such appeals must be presented in person to the Principal who shall cause these appeals to be received and shall inform there and then the candidates about the date when these appeals will be heard. The candidates shall be entitled to be present at the time of hearing if he/she so desires. The decision of the Committee shall be final and shall be communicated to the candidate. After finalization/closure of admissions, no appeal shall lie and thus the time-barred appeals received after the prescribed period of three (03) days and appeals received in a manner other than prescribed above shall not be entertained.";

export const FEE = {
  heading: "Fee Structure as per KUST Regular Class Fee",
  availability:
    "Separate fee details and fee slip will be available from the admin/account office for each discipline/program/department.",
  registration:
    "In case of students already registered with KUST, registration fee and other fees will be charged as prescribed. However, the earlier deposited registration fee, if any, will be refunded/adjusted. The original registration number will remain intact.",
  refundIntro:
    "If a student wants to cancel his/her admission, then the refund of fee shall be made on the submission of a written application on a judicial paper worth Rs. 50/-, duly attested by oath commissioner as per the following details:",
  refundSchedule: [
    { refund: "Full", percent: 100, window: "Up to 7th day of commencement of classes" },
    { refund: "Half", percent: 50, window: "From 8th–15th day of commencement of classes" },
    { refund: "No", percent: 0, window: "From 16th day of commencement of classes" },
  ],
  transfer:
    "Provided that any student who has got readmission within seven days of the 1st admission to another discipline/program/department shall transfer the deposited fee to such new discipline/program/department.",
  readmission:
    "The name of a student will also be struck off due to non-payment of dues and rude behavior. The student may be allowed re-admission by the Principal. The fee for re-admission will be Rs. 500/-. However, readmission can be granted only once.",
};
