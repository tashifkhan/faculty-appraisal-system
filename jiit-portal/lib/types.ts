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

export interface LecturesTutorialsSection {
  oddSemester: (CourseEntry & ScoredItem)[];
  evenSemester: (CourseEntry & ScoredItem)[];
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
  // For not-yet-modeled sections, use a generic, typed placeholder
  readingMaterial?: ScoredItem & Record<string, unknown>;
  projectGuidance?: ScoredItem & Record<string, unknown>;
  examDuties?: ScoredItem & Record<string, unknown>;
  studentActivities?: ScoredItem & Record<string, unknown>;
  researchPapers?: ResearchPapersSection;
  booksChapters?: ScoredItem & Record<string, unknown>;
  researchProjects?: ScoredItem & Record<string, unknown>;
  researchGuidance?: ScoredItem & Record<string, unknown>;
  memberships?: ScoredItem & Record<string, unknown>;
  sectionStatus: { [key: string]: SectionStatus };
}

export interface UserProfile {
  name: string;
  email: string;
  department: string;
}
