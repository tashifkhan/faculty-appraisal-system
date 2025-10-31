// API functions to interact with Django backend
// 
// This file handles all API calls to the Django backend, including:
// - Data transformation between frontend (camelCase) and backend (snake_case)
// - Section ID mapping from APPRAISAL_SECTIONS in constants.ts
// - API score calculation and retrieval
//
// Section IDs are imported from constants.ts to maintain consistency across the application.
// Valid section IDs: 'general-details', '11-conference-events', '12-1-lectures-tutorials', etc.

import { API_ENDPOINTS, APPRAISAL_SECTIONS } from './constants';
import { 
  apiFetch, 
  getUserId, 
  getItemBySection as getItemBySectionUtil,
  isValidSectionId 
} from './api';
import {
  ConferenceEntry,
  ConferenceSection,
  GeneralDetailsForm,
  GeneralDetailsSection,
  LecturesTutorialsSection,
  ResearchPaperEntry,
  ResearchPapersSection,
  ReadingMaterialEntry,
  ReadingMaterialSection,
  ProjectGuidanceSection,
  ExamDutyEntry,
  BooksChaptersSection,
  BookChapterEntry,
  ResearchProjectsSection,
  ResearchProjectEntry,
  ResearchGuidanceSection,
  ResearchGuidanceEntry,
  MembershipsSection,
  MembershipEntry,
  StudentActivitiesSection,
  OtherInfoSection,
} from './types';

/**
 * API Response type for backend responses
 */
interface ApiResponse {
  message: string;
  result?: {
    score?: number;
    [key: string]: unknown;
  };
}

/**
 * Get data for a specific section
 */
export const getItemBySection = getItemBySectionUtil;

// ==================== Item 1-10: General Details ====================

/**
 * Transform frontend GeneralDetailsForm to backend schema (item1_post_schema)
 */
function transformGeneralDetailsToBackend(data: GeneralDetailsForm, userId?: string) {
  const user_id = userId || getUserId();
  return {
    user_id,
    full_name: data.name,
    present_designation: data.presentDesignation,
    qualifications: data.qualifications,
    department: data.department,
    institute_joining_date: data.instituteJoiningDate,
    first_designation: data.firstDesignation,
    'present_pay_scale_&_pay': data.presentPayScaleAndPay,
    areas_of_specialization_and_current_interest: data.areasOfInterest,
    additional_qualification_acquired: data.additionalQualification,
    pursuing_higher_studies: data.pursuingHigherStudies,
  };
}

export const calculateGeneralDetailsScore = async (
  data: GeneralDetailsForm,
  userId?: string
): Promise<{ score: number; message: string }> => {
  const user_id = userId || getUserId();
  const payload = transformGeneralDetailsToBackend(data, user_id);
  
  const response = await apiFetch<{ message: string }>(
    API_ENDPOINTS.INJEST_ITEM_1_TO_10,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );

  // Fetch the updated data with score
  const result = await getItemBySection('1-10', user_id) as { score?: number };
  const score = result?.score || 10; // Default score if not returned
  
  return {
    score,
    message: response.message || 'Section submitted successfully',
  };
};

// ==================== Item 11: Conference Events ====================

/**
 * Transform frontend ConferenceEntry to backend schema (item2_post_schema)
 */
function transformConferenceToBackend(entries: ConferenceEntry[]) {
  return entries.map((entry) => {
    const [start_date, end_date] = entry.datesDuration.includes(' to ')
      ? entry.datesDuration.split(' to ')
      : [entry.datesDuration, entry.datesDuration];
    
    return {
      title: entry.title,
      start_date,
      end_date,
      'attended/organized': entry.attendedOrganized === 'organized',
      program_type: entry.programType,
      is_chief_organizer: entry.isChiefOrganiser === 'yes',
      sponsoring_agency: entry.sponsoringAgency,
      'organisation_&_place': entry.organisationPlace,
    };
  });
}

export const calculateConferenceScore = async (
  entries: ConferenceEntry[],
  userId?: string
): Promise<{ score: number; message: string }> => {
  const user_id = userId || getUserId();
  const data = transformConferenceToBackend(entries);
  
  const payload = {
    user_id,
    data,
  };

  const response = await apiFetch<ApiResponse>(
    API_ENDPOINTS.INJEST_ITEM_11,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );

  const score = response.result?.score || 0;
  
  return {
    score,
    message: response.message || 'Section submitted successfully',
  };
};

// ==================== Item 12.1: Lectures/Tutorials ====================

/**
 * Transform frontend LecturesTutorialsSection to backend schema (item3_post_schema)
 */
function transformLecturesToBackend(
  semester: LecturesTutorialsSection['oddSemester'] | LecturesTutorialsSection['evenSemester']
) {
  return semester.map((course) => ({
    course_code: course.courseCode,
    course_title: course.courseTitle,
    contact_hr_per_week: parseInt(course.contactHoursPerWeek) || 0,
    total_hour_scheduled: course.scheduledHours,
    total_hour_engaged: course.engagedHours,
  }));
}

export const calculateLecturesScore = async (
  oddSemester: LecturesTutorialsSection['oddSemester'],
  evenSemester: LecturesTutorialsSection['evenSemester'],
  userId?: string
): Promise<{ score: number; message: string }> => {
  const user_id = userId || getUserId();
  
  // Submit odd semester
  let oddScore = 0;
  if (oddSemester.length > 0) {
    const oddPayload = {
      user_id,
      semester: 'odd',
      data: transformLecturesToBackend(oddSemester),
    };
    
    const oddResponse = await apiFetch<ApiResponse>(
      API_ENDPOINTS.INJEST_ITEM_12_1,
      {
        method: 'POST',
        body: JSON.stringify(oddPayload),
      }
    );
    oddScore = oddResponse.result?.score || 0;
  }

  // Submit even semester
  let evenScore = 0;
  if (evenSemester.length > 0) {
    const evenPayload = {
      user_id,
      semester: 'even',
      data: transformLecturesToBackend(evenSemester),
    };
    
    const evenResponse = await apiFetch<ApiResponse>(
      API_ENDPOINTS.INJEST_ITEM_12_1,
      {
        method: 'POST',
        body: JSON.stringify(evenPayload),
      }
    );
    evenScore = evenResponse.result?.score || 0;
  }

  const totalScore = oddScore + evenScore;
  
  return {
    score: totalScore,
    message: `Section submitted successfully. Odd semester: ${oddScore}, Even semester: ${evenScore}`,
  };
};

// ==================== Item 12.2: Reading Material ====================
// Note: Backend doesn't have a specific endpoint for item 12.2 yet
// Using mock calculation for now

export const calculateReadingMaterialScore = (entries: ReadingMaterialEntry[]): number => {
  // Mock: sum of self-assessed API scores, capped per entry at 5
  return entries.reduce((total, e) => total + Math.min(Math.max(Number(e.selfAssessedApi) || 0, 0), 5), 0);
};

// ==================== Item 12.3-12.4: Project Guidance & Exam Duties ====================

/**
 * Transform frontend ProjectGuidance and ExamDuties to backend schema (item5_post_schema)
 */
function transformProjectGuidanceExamDutiesToBackend(
  projectGuidance: ProjectGuidanceSection,
  examDuties: ExamDutyEntry[]
) {
  return {
    '12.3': {
      number_of_projects_guided: projectGuidance.projectsGuided,
      number_of_students_guided: projectGuidance.studentsGuided,
    },
    '12.4': examDuties.map((entry) => ({
      activity: entry.activity,
      class: entry.classLevel || '',
      t1: entry.t1,
      t2: entry.t2,
      t3: entry.t3,
    })),
  };
}

export const calculateProjectGuidanceScore = async (
  projectGuidance: ProjectGuidanceSection,
  examDuties: ExamDutyEntry[],
  userId?: string
): Promise<{ score: number; message: string }> => {
  const user_id = userId || getUserId();
  const data = transformProjectGuidanceExamDutiesToBackend(projectGuidance, examDuties);
  
  const payload = {
    user_id,
    data,
  };

  const response = await apiFetch<ApiResponse>(
    API_ENDPOINTS.INJEST_ITEM_12_3_TO_12_4,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );

  const score = response.result?.score || 0;
  
  return {
    score,
    message: response.message || 'Section submitted successfully',
  };
};

export const calculateExamDutiesScore = (entries: ExamDutyEntry[]): number => {
  // This is calculated together with project guidance in the backend
  // Return a placeholder score for individual calculation
  const weights: Record<string, number> = {
    qp_set: 1,
    ab_evaluated: 0.02,
    practical_conducted: 0.5,
    invigilation_duties: 0.1,
  };
  return Math.round(
    entries.reduce((total, e) => {
      const sum = (Number(e.t1) || 0) + (Number(e.t2) || 0) + (Number(e.t3) || 0);
      return total + sum * (weights[e.activity] ?? 0.1);
    }, 0)
  );
};

// ==================== Item 13: Student Activities ====================

/**
 * Transform frontend StudentActivitiesSection to backend schema (item6_post_schema)
 */
function transformStudentActivitiesToBackend(data: StudentActivitiesSection) {
  return {
    A: data.A.map((item) => ({
      name_of_club: item.nameOfClub,
      played_lead_role: item.playedLeadRole,
      details_of_activities: item.detailsOfActivities,
    })),
    B: data.B.map((item) => ({
      role: item.role,
      details_of_activities: item.detailsOfActivities,
    })),
    C: data.C.map((item) => ({
      position_type: item.positionType,
      details_of_activities: item.detailsOfActivities,
    })),
    D: data.D.map((item) => ({
      nature: item.nature,
      details_of_activities: item.detailsOfActivities,
    })),
    E: data.E.map((item) => ({
      points: item.points,
      details_of_activities: item.detailsOfActivities,
    })),
  };
}

export const calculateStudentActivitiesScore = async (
  data: StudentActivitiesSection,
  userId?: string
): Promise<{ score: number; message: string }> => {
  const user_id = userId || getUserId();
  const transformedData = transformStudentActivitiesToBackend(data);
  
  const payload = {
    user_id,
    data: transformedData,
  };

  const response = await apiFetch<ApiResponse>(
    API_ENDPOINTS.INJEST_ITEM_13,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );

  const score = response.result?.score || 0;
  
  return {
    score,
    message: response.message || 'Section submitted successfully',
  };
};

// ==================== Item 14: Research Papers ====================

/**
 * Transform frontend ResearchPaperEntry to backend schema (item7_post_schema)
 */
function transformResearchPapersToBackend(entries: ResearchPaperEntry[]) {
  return entries.map((entry) => ({
    title_and_complete_reference: entry.titleAndCompleteReference,
    pub_type: entry.pubType,
    isbn_issn: entry.isbnIssn,
    indexed: entry.indexed,
    impact_factor: entry.impactFactor,
    user_author_type: entry.userAuthorType,
    other_authors: entry.otherAuthors.map((author) => ({
      name: author.name,
      author_type: author.authorType,
    })),
  }));
}

export const calculateResearchPapersScore = async (
  entries: ResearchPaperEntry[],
  userId?: string
): Promise<{ score: number; message: string }> => {
  const user_id = userId || getUserId();
  const data = transformResearchPapersToBackend(entries);
  
  const payload = {
    user_id,
    data,
  };

  const response = await apiFetch<ApiResponse>(
    API_ENDPOINTS.INJEST_ITEM_14,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );

  const score = response.result?.score || 0;
  
  return {
    score,
    message: response.message || 'Section submitted successfully',
  };
};

// ==================== Item 15: Books & Chapters ====================

/**
 * Transform frontend BookChapterEntry to backend schema (item8_post_schema)
 */
function transformBooksChaptersToBackend(entries: BookChapterEntry[]) {
  return entries.map((entry) => ({
    title_and_complete_reference: entry.titleAndCompleteReference,
    publisher_type: entry.publisherType,
    is_chapter: entry.isChapter,
    number_of_chapters: entry.numberOfChapters,
    user_author_type: entry.userAuthorType,
    other_authors: entry.otherAuthors.map((author) => ({
      name: author.name,
      author_type: author.authorType,
    })),
  }));
}

export const calculateBooksChaptersScore = async (
  entries: BookChapterEntry[],
  userId?: string
): Promise<{ score: number; message: string }> => {
  const user_id = userId || getUserId();
  const data = transformBooksChaptersToBackend(entries);
  
  const payload = {
    user_id,
    data,
  };

  const response = await apiFetch<ApiResponse>(
    API_ENDPOINTS.INJEST_ITEM_15,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );

  const score = response.result?.score || 0;
  
  return {
    score,
    message: response.message || 'Section submitted successfully',
  };
};

// ==================== Item 16: Research Projects ====================

/**
 * Transform frontend ResearchProjectEntry to backend schema (item9_post_schema)
 */
function transformResearchProjectsToBackend(entries: ResearchProjectEntry[]) {
  return entries.map((entry) => ({
    title: entry.title,
    sponsoring_agency: entry.sponsoringAgency,
    duration: entry.duration,
    sanction_date: entry.sanctionDate,
    status: entry.status,
    is_hss: entry.isHss,
    amount_sanctioned: entry.amountSanctioned,
    is_consultancy: entry.isConsultancy,
    user_author_type: entry.userAuthorType,
    other_authors: entry.otherAuthors.map((author) => ({
      name: author.name,
      author_type: author.authorType,
    })),
  }));
}

export const calculateResearchProjectsScore = async (
  entries: ResearchProjectEntry[],
  userId?: string
): Promise<{ score: number; message: string }> => {
  const user_id = userId || getUserId();
  const data = transformResearchProjectsToBackend(entries);
  
  const payload = {
    user_id,
    data,
  };

  const response = await apiFetch<ApiResponse>(
    API_ENDPOINTS.INJEST_ITEM_16,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );

  const score = response.result?.score || 0;
  
  return {
    score,
    message: response.message || 'Section submitted successfully',
  };
};

// ==================== Item 17: Research Guidance ====================

/**
 * Transform frontend ResearchGuidanceEntry to backend schema (item10_post_schema)
 */
function transformResearchGuidanceToBackend(entries: ResearchGuidanceEntry[]) {
  return entries.map((entry) => ({
    title: entry.title,
    enroll_no_and_name: entry.enrollNoAndName,
    degree: entry.degree,
    status: entry.status,
    months_ongoing: entry.monthsOngoing,
    user_author_type: entry.userAuthorType,
    other_authors: entry.otherAuthors.map((author) => ({
      name: author.name,
      author_type: author.authorType,
    })),
  }));
}

export const calculateResearchGuidanceScore = async (
  entries: ResearchGuidanceEntry[],
  userId?: string
): Promise<{ score: number; message: string }> => {
  const user_id = userId || getUserId();
  const data = transformResearchGuidanceToBackend(entries);
  
  const payload = {
    user_id,
    data,
  };

  const response = await apiFetch<ApiResponse>(
    API_ENDPOINTS.INJEST_ITEM_17,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );

  const score = response.result?.score || 0;
  
  return {
    score,
    message: response.message || 'Section submitted successfully',
  };
};

// ==================== Item 18: Memberships ====================

/**
 * Transform frontend MembershipEntry to backend schema (item11_post_schema)
 */
function transformMembershipsToBackend(entries: MembershipEntry[]) {
  return entries.map((entry) => ({
    position_type: entry.positionType,
    membership_details: entry.membershipDetails,
  }));
}

export const calculateMembershipsScore = async (
  entries: MembershipEntry[],
  userId?: string
): Promise<{ score: number; message: string }> => {
  const user_id = userId || getUserId();
  const data = transformMembershipsToBackend(entries);
  
  const payload = {
    user_id,
    data,
  };

  const response = await apiFetch<ApiResponse>(
    API_ENDPOINTS.INJEST_ITEM_18,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );

  const score = response.result?.score || 0;
  
  return {
    score,
    message: response.message || 'Section submitted successfully',
  };
};

// ==================== Item 19: Other Information ====================

/**
 * Transform frontend OtherInfoSection to backend schema (item12_post_schema)
 */
function transformOtherInfoToBackend(data: OtherInfoSection) {
  return {
    self: data.self.map((item) => ({
      details: item.details,
      points: item.points,
    })),
    national: data.national.map((item) => ({
      details: item.details,
    })),
    international: data.international.map((item) => ({
      details: item.details,
    })),
  };
}

export const calculateOtherInfoScore = async (
  data: OtherInfoSection,
  userId?: string
): Promise<{ score: number; message: string }> => {
  const user_id = userId || getUserId();
  const transformedData = transformOtherInfoToBackend(data);
  
  const payload = {
    user_id,
    data: transformedData,
  };

  const response = await apiFetch<ApiResponse>(
    API_ENDPOINTS.INJEST_ITEM_19,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );

  const score = response.result?.score || 0;
  
  return {
    score,
    message: response.message || 'Section submitted successfully',
  };
};

// ==================== Main Simulation Function ====================

/**
 * Extract section IDs from APPRAISAL_SECTIONS for type safety
 */
type SectionId = typeof APPRAISAL_SECTIONS[number]['id'] | (string & {});

type SectionPayloadMap = {
  'general-details': GeneralDetailsForm | GeneralDetailsSection;
  '11-conference-events': ConferenceSection | { entries: ConferenceEntry[] };
  '12-1-lectures-tutorials': LecturesTutorialsSection;
  '14-research-papers': ResearchPapersSection | { entries: ResearchPaperEntry[] };
  '12-2-reading-material': ReadingMaterialSection | { entries: ReadingMaterialEntry[] };
  '12-3-4-project-guidance-and-exam-duties': { projectGuidance: ProjectGuidanceSection; examDuties: ExamDutyEntry[] };
  '13-student-activities': StudentActivitiesSection;
  '15-books-chapters': BooksChaptersSection | { entries: BookChapterEntry[] };
  '16-research-projects': ResearchProjectsSection | { entries: ResearchProjectEntry[] };
  '17-research-guidance': ResearchGuidanceSection | { entries: ResearchGuidanceEntry[] };
  '18-memberships': MembershipsSection | { entries: MembershipEntry[] };
  '19-other-info': OtherInfoSection;
};

export const simulateApiCall = async <T extends SectionId>(
  sectionId: T,
  data: T extends keyof SectionPayloadMap ? SectionPayloadMap[T] : unknown
): Promise<{ score: number; message: string }> => {
  try {
    // Validate section ID
    if (!isValidSectionId(sectionId as string)) {
      console.warn(`Unknown section ID: ${sectionId}`);
    }

    switch (sectionId) {
      case 'general-details':
        return await calculateGeneralDetailsScore(data as GeneralDetailsForm);
      
      case '11-conference-events':
        return await calculateConferenceScore(
          (data as ConferenceSection | { entries: ConferenceEntry[] }).entries || []
        );
      
      case '12-1-lectures-tutorials': {
        const d = data as LecturesTutorialsSection;
        return await calculateLecturesScore(d.oddSemester || [], d.evenSemester || []);
      }
      
      case '14-research-papers':
        return await calculateResearchPapersScore(
          (data as ResearchPapersSection | { entries: ResearchPaperEntry[] }).entries || []
        );
      
      case '12-2-reading-material': {
        // Using mock for now since backend doesn't have this endpoint
        const score = calculateReadingMaterialScore(
          (data as ReadingMaterialSection | { entries: ReadingMaterialEntry[] }).entries || []
        );
        return {
          score,
          message: `Section submitted successfully. API Score: ${score}`,
        };
      }
      
      case '12-3-4-project-guidance-and-exam-duties': {
        // Handle combined section
        const combinedData = data as { projectGuidance: ProjectGuidanceSection; examDuties: ExamDutyEntry[] };
        return await calculateProjectGuidanceScore(
          combinedData.projectGuidance,
          combinedData.examDuties || []
        );
      }
      
      case '13-student-activities':
        return await calculateStudentActivitiesScore(data as StudentActivitiesSection);
      
      case '15-books-chapters':
        return await calculateBooksChaptersScore(
          (data as BooksChaptersSection | { entries: BookChapterEntry[] }).entries || []
        );
      
      case '16-research-projects':
        return await calculateResearchProjectsScore(
          (data as ResearchProjectsSection | { entries: ResearchProjectEntry[] }).entries || []
        );
      
      case '17-research-guidance':
        return await calculateResearchGuidanceScore(
          (data as ResearchGuidanceSection | { entries: ResearchGuidanceEntry[] }).entries || []
        );
      
      case '18-memberships':
        return await calculateMembershipsScore(
          (data as MembershipsSection | { entries: MembershipEntry[] }).entries || []
        );
      
      case '19-other-info':
        return await calculateOtherInfoScore(data as OtherInfoSection);
      
      default:
        // Fallback for unknown sections
        console.warn(`No handler for section: ${sectionId}, using default score`);
        return {
          score: 5,
          message: 'Section submitted successfully (default score)',
        };
    }
  } catch (error) {
    console.error('Error in simulateApiCall:', error);
    throw error;
  }
};

