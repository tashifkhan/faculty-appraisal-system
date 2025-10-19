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
  | 'practical_conducted'; // No. of Practical Exams Conducted

export interface ExamDutyEntry {
  id: string;
  activity: ExamDutyActivity;
  classLevel: 'UG' | 'PG';
  t1: number;
  t2: number;
  t3: number;
}

export interface ExamDutiesSection extends ScoredItem {
  entries: ExamDutyEntry[];
}

// 9. Books & Chapters in Books Written
export type BookChapterType = 'B' | 'C'; // B-Book, C-Chapter

export interface BookChapterEntry {
  id: string;
  authors: string;
  titleAndReference: string;
  publicationType: BookChapterType; // 'B' for Book, 'C' for Chapter
}

export interface BooksChaptersSection extends ScoredItem {
  entries: BookChapterEntry[];
}

// 8. Research Papers
export interface ResearchPaperEntry {
  id: string;
  authors: string;
  titleAndReference: string;
  publicationType: 'IJ' | 'NJ' | 'IC' | 'PN' | 'OA';
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
  studentActivities?: ScoredItem & Record<string, unknown>;
  researchPapers?: ResearchPapersSection;
  booksChapters?: BooksChaptersSection;
  researchProjects?: ResearchProjectsSection;
  researchGuidance?: ResearchGuidanceSection;
  memberships?: MembershipsSection;
  sectionStatus: { [key: string]: SectionStatus };
}

export interface UserProfile {
  name: string;
  email: string;
  department: string;
}

// 10. Research Projects & Consultancy Works
export type ResearchProjectStatus = 'Completed' | 'Ongoing';
export type ResearchProjectRole = 'Chief Investigator' | 'Co-Investigator';

export interface ResearchProjectEntry {
  id: string;
  title: string; // Title of Project / Consultancy
  sponsoringAgency: string;
  duration: string; // e.g., '2 years', '6 months'
  sanctionDate: string; // e.g., '2023-03-20' (ISO) or display string
  status: ResearchProjectStatus;
  amountSanctioned: number; // amount in currency units
  role: ResearchProjectRole;
}

export interface ResearchProjectsSection extends ScoredItem {
  entries: ResearchProjectEntry[];
}

// 11. Research Guidance
export type ResearchGuidanceLevel = 'PhD' | 'MTech' | 'BTech';
export type ResearchGuidanceStatus = 'Completed' | 'Ongoing';

export interface ResearchGuidanceEntry {
  id: string;
  enrolmentAndName: string; // Enrol. No. & Name
  title: string; // Title of Thesis/Dissertation/Project
  jointSupervisors: string;
  level: ResearchGuidanceLevel;
  status: ResearchGuidanceStatus;
}

export interface ResearchGuidanceSection extends ScoredItem {
  entries: ResearchGuidanceEntry[];
}

// 12. Memberships of Professional Bodies
export interface MembershipEntry {
  id: string;
  detail: string; // e.g., IEEE (Sr. Member), MIR Labs
}

export interface MembershipsSection extends ScoredItem {
  entries: MembershipEntry[];
}
