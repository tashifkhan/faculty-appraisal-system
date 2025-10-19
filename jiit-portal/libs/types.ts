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
  entries: (ConferenceEntry & ScoredItem)[];
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
  entries: (ResearchPaperEntry & ScoredItem)[];
}

// Section Status
export type SectionStatus = 'not_started' | 'in_progress' | 'completed';

// Overall Appraisal Data structure
export interface AppraisalData {
  generalDetails?: GeneralDetailsSection;
  conferenceEvents?: ConferenceSection;
  lecturesTutorials?: LecturesTutorialsSection;
  readingMaterial?: any;
  projectGuidance?: any;
  examDuties?: any;
  studentActivities?: any;
  researchPapers?: ResearchPapersSection;
  booksChapters?: any;
  researchProjects?: any;
  researchGuidance?: any;
  memberships?: any;
  sectionStatus: { [key: string]: SectionStatus };
}

export interface UserProfile {
  name: string;
  email: string;
  department: string;
}
