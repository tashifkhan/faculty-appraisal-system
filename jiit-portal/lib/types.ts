// Generic interface for items that have an API score
export interface ScoredItem {
  apiScore: number | null;
  hodRemarks?: string;
}

// 1. General Details
export interface GeneralDetailsForm {
  name: string;
  presentDesignation: string;
  qualifications: string;
  department: string;
  instituteJoiningDate: string;
  firstDesignation: string;
  presentPayScaleAndPay: number;
  areasOfInterest: string;
  additionalQualification: string;
  pursuingHigherStudies: string;
}

export interface GeneralDetailsSection extends GeneralDetailsForm, ScoredItem {}

// 2. Conference and All
export interface ConferenceEntry {
  id: string;
  title: string;
  datesDuration: string;
  sponsoringAgency: string;
  organisationPlace: string;
  attendedOrganized: 'attended' | 'organized';
  isChiefOrganiser?: 'yes' | 'no';
  programType: 'course' | 'program' | 'seminar' | 'conference' | 'workshop';
}

export interface ConferenceSection {
  entries: ConferenceEntry[];
  apiScore: number | null;
  hodRemarks?: string;
}

// 3. Lectures/Tutorials
export interface CourseEntry {
  id: string;
  courseCode: string;
  courseTitle: string;
  contactHoursPerWeek: string;
  scheduledHours: number;
  engagedHours: number;
}

export interface LecturesTutorialsSection extends ScoredItem {
  oddSemester: (CourseEntry & ScoredItem)[];
  evenSemester: (CourseEntry & ScoredItem)[];
}

// 4. Reading / Instructional Material
export interface ReadingMaterialEntry {
  id: string;
  courseCode: string;
  consulted: string; // Knowledge Resources Consulted
  prescribed: string; // Knowledge Resources Prescribed
  additional: string; // Additional Resources Provided
  selfAssessedApi: number; // Self assessed API score per course
  hodRemarks?: string; // Approved/Pending/Rejected
}

export interface ReadingMaterialSection extends ScoredItem {
  entries: ReadingMaterialEntry[];
}

// 5. Project Guidance (UG level)
export interface ProjectGuidanceSection extends ScoredItem {
  projectsGuided: number;
  studentsGuided: number;
}

// 6. Examination Duties
export type ExamDutyActivity =
  | 'qp_set' // No. of Q. Papers Set
  | 'ab_evaluated' // No. of A/B Evaluated
  | 'practical_conducted' // No. of Practical Exams Conducted
  | 'invigilation_duties'; // No. of Examination Invigilation Duties

export interface ExamDutyEntry {
  id: string;
  activity: ExamDutyActivity;
  classLevel?: 'UG' | 'PG'; // Optional for invigilation_duties
  invigilationType?: 'allotted' | 'performed'; // Only for invigilation_duties
  t1: number;
  t2: number;
  t3: number;
}

export interface ExamDutiesSection extends ScoredItem {
  entries: ExamDutyEntry[];
}

// 9. Books & Chapters in Books Written
export type BookChapterType = 'B' | 'C'; // B-Book, C-Chapter

export interface BookChapterAuthor {
  id: string;
  name: string;
  authorType: string;
}

export interface BookChapterEntry {
  id: string;
  titleAndCompleteReference: string;
  publisherType: string;
  isChapter: boolean;
  numberOfChapters: number;
  userAuthorType: string;
  otherAuthors: BookChapterAuthor[];
}

export interface BooksChaptersSection extends ScoredItem {
  entries: BookChapterEntry[];
}

// 8. Research Papers
export enum PublicationType {
  IJ = "IJ",
  NJ = "NJ",
  IC = "IC",
  PN = "PN",
  OA = "OA",
  OJ = "OJ"
}

export interface OtherAuthor {
  id: string;
  name: string;
  authorType: string;
}

export interface ResearchPaperEntry {
  id: string;
  titleAndCompleteReference: string;
  pubType: PublicationType;
  isbnIssn: string;
  indexed: boolean;
  impactFactor: number;
  userAuthorType: string;
  otherAuthors: OtherAuthor[];
}

export interface ResearchPapersSection {
  entries: ResearchPaperEntry[];
  apiScore: number | null;
  hodRemarks?: string;
}

// Section Status
export type SectionStatus = 'not_started' | 'in_progress' | 'completed';

// Overall Appraisal Data structure
export interface AppraisalData {
  generalDetails?: GeneralDetailsSection;
  conferenceEvents?: ConferenceSection;
  lecturesTutorials?: LecturesTutorialsSection;
  readingMaterial?: ReadingMaterialSection;
  projectGuidance?: ProjectGuidanceSection;
  examDuties?: ExamDutiesSection;
  studentActivities?: StudentActivitiesSection;
  researchPapers?: ResearchPapersSection;
  booksChapters?: BooksChaptersSection;
  researchProjects?: ResearchProjectsSection;
  researchGuidance?: ResearchGuidanceSection;
  memberships?: MembershipsSection;
  otherInfo?: OtherInfoSection;
  sectionStatus: { [key: string]: SectionStatus };
}

export interface UserProfile {
  name: string;
  email: string;
  department: string;
}

// 10. Research Projects & Consultancy Works
export type ResearchProjectStatus = 'Completed' | 'Ongoing';

export interface ResearchProjectAuthor {
  id: string;
  name: string;
  authorType: string;
}

export interface ResearchProjectEntry {
  id: string;
  title: string;
  sponsoringAgency: string;
  duration: string;
  sanctionDate: string;
  status: string;
  isHss: boolean;
  amountSanctioned: number;
  isConsultancy: boolean;
  userAuthorType: string;
  otherAuthors: ResearchProjectAuthor[];
}

export interface ResearchProjectsSection extends ScoredItem {
  entries: ResearchProjectEntry[];
}

// 11. Research Guidance
export type ResearchGuidanceLevel = 'PhD' | 'MTech' | 'BTech';
export type ResearchGuidanceStatus = 'Completed' | 'Ongoing';

export interface ResearchGuidanceAuthor {
  id: string;
  name: string;
  authorType: string;
}

export interface ResearchGuidanceEntry {
  id: string;
  title: string;
  enrollNoAndName: string;
  degree: string;
  status: string;
  monthsOngoing: number;
  userAuthorType: string;
  otherAuthors: ResearchGuidanceAuthor[];
}

export interface ResearchGuidanceSection extends ScoredItem {
  entries: ResearchGuidanceEntry[];
}

// 12. Memberships of Professional Bodies
export interface MembershipEntry {
  id: string;
  positionType: string;
  membershipDetails: string;
}

export interface MembershipsSection extends ScoredItem {
  entries: MembershipEntry[];
}

// 19. Other Information (API Points)
export interface OtherInfoEntry {
  id: string;
  details: string;
  points: number;
}

export interface OtherInfoSection extends ScoredItem {
  self: OtherInfoEntry[];
  national: Omit<OtherInfoEntry, "points">[];
  international: Omit<OtherInfoEntry, "points">[];
}

// 7. Student Activities (Contribution/Participation in Students Extra & Co‑Curricular activities)

// SECTION 13A — Societies/Hubs (incorporate event details)
export interface SocietyActivity {
  id: string;
  nameOfClub: string;
  playedLeadRole: boolean;
  detailsOfActivities: string;
}

// SECTION 13B — Departmental Activities & Development
export interface DepartmentalActivity {
  id: string;
  role: string;
  detailsOfActivities: string;
}

// SECTION 13C — Institute Activities & Development
export interface InstituteActivity {
  id: string;
  positionType: string;
  detailsOfActivities: string;
}

// SECTION 13D — Special/Extension/Expert/Invited Lectures Delivered
export interface LectureActivity {
  id: string;
  nature: string;
  detailsOfActivities: string;
}

// SECTION 13E — Articles, Monographs, Technical Reports, Reviews Written
export interface ArticleActivity {
  id: string;
  points: number;
  detailsOfActivities: string;
}

export interface StudentActivitiesForm {
  A: SocietyActivity[];
  B: DepartmentalActivity[];
  C: InstituteActivity[];
  D: LectureActivity[];
  E: ArticleActivity[];
}

export interface StudentActivitiesSection extends StudentActivitiesForm, ScoredItem {}
