import { AppraisalData, ScoredItem, UserProfile, SectionStatus } from './types';
import { APPRAISAL_SECTIONS, AppraisalSectionId } from './constants';

const APPRAISAL_KEY = 'jiit_faculty_appraisal_data';
const USER_KEY = 'jiit_faculty_user';
const AUTH_KEY = 'jiit_faculty_auth';
const USER_ID_KEY = 'user_id';

/**
 * Map frontend section IDs to AppraisalData keys
 */
const SECTION_ID_TO_DATA_KEY: Record<string, keyof AppraisalData> = {
  'general-details': 'generalDetails',
  '11-conference-events': 'conferenceEvents',
  '12-1-lectures-tutorials': 'lecturesTutorials',
  '12-2-reading-material': 'readingMaterial',
  '12-3-4-project-guidance-and-exam-duties': 'projectGuidance', // Combined section
  '13-student-activities': 'studentActivities',
  '14-research-papers': 'researchPapers',
  '15-books-chapters': 'booksChapters',
  '16-research-projects': 'researchProjects',
  '17-research-guidance': 'researchGuidance',
  '18-memberships': 'memberships',
  '19-other-info': 'otherInfo',
};

/**
 * Get the data key for a section ID
 */
const getDataKeyForSectionId = (sectionId: string): keyof AppraisalData | undefined => {
  return SECTION_ID_TO_DATA_KEY[sectionId];
};

export const getAppraisalData = (): AppraisalData => {
  if (typeof window === 'undefined') return { sectionStatus: {} };
  const data = localStorage.getItem(APPRAISAL_KEY);
  return data ? (JSON.parse(data) as AppraisalData) : { sectionStatus: {} };
};

export const setAppraisalData = (data: AppraisalData) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(APPRAISAL_KEY, JSON.stringify(data));
  }
};

/**
 * Clear all appraisal data
 */
export const clearAppraisalData = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(APPRAISAL_KEY);
  }
};

/**
 * Update section data using section ID from APPRAISAL_SECTIONS
 * @param sectionId - The section ID from APPRAISAL_SECTIONS (e.g., 'general-details', '11-conference-events')
 * @param data - The section data to save
 * @param score - The API score for the section
 * @param status - The completion status of the section
 */
export const updateSectionBySectionId = (
  sectionId: AppraisalSectionId,
  data: unknown,
  score: number,
  status: SectionStatus = 'completed'
) => {
  const dataKey = getDataKeyForSectionId(sectionId);
  if (!dataKey) {
    console.warn(`Unknown section ID: ${sectionId}`);
    return null;
  }

  const currentData = getAppraisalData();
  
  // If the section supports apiScore, attach it
  const updatedSection =
    data && typeof data === 'object' && data !== null
      ? { ...(data as Record<string, unknown>), apiScore: score }
      : data;
  
  const newStatus = { ...currentData.sectionStatus, [sectionId]: status };
  const updatedData = {
    ...currentData,
    [dataKey]: updatedSection,
    sectionStatus: newStatus,
  };
  
  setAppraisalData(updatedData);
  return updatedSection;
};

/**
 * Update section data using AppraisalData key (legacy method)
 * @deprecated Use updateSectionBySectionId instead
 */
export const updateSectionData = <T extends keyof AppraisalData>(
  sectionId: T,
  data: AppraisalData[T],
  score: number,
  status: SectionStatus = 'completed'
) => {
  const currentData = getAppraisalData();
  // If the section supports apiScore, attach it; otherwise just persist data as-is
  const updatedSection =
    data && typeof data === 'object' && data !== null && 'apiScore' in (data as Record<string, unknown>)
      ? ({ ...(data as Record<string, unknown>), apiScore: score } as AppraisalData[T])
      : data;
  const newStatus = { ...currentData.sectionStatus, [sectionId]: status };
  const updatedData = {
    ...currentData,
    [sectionId]: updatedSection,
    sectionStatus: newStatus,
  };
  setAppraisalData(updatedData);
  return updatedSection;
};

/**
 * Get section data using section ID from APPRAISAL_SECTIONS
 */
export const getSectionDataBySectionId = (
  sectionId: AppraisalSectionId
): unknown => {
  const dataKey = getDataKeyForSectionId(sectionId);
  if (!dataKey) {
    console.warn(`Unknown section ID: ${sectionId}`);
    return undefined;
  }
  
  const data = getAppraisalData();
  return data[dataKey];
};

/**
 * Get section data using AppraisalData key (legacy method)
 * @deprecated Use getSectionDataBySectionId instead
 */
export const getSectionData = <T extends keyof AppraisalData>(
  sectionId: T
): AppraisalData[T] | undefined => {
  const data = getAppraisalData();
  return data[sectionId];
};

/**
 * Get section status by section ID
 */
export const getSectionStatus = (sectionId: AppraisalSectionId): SectionStatus => {
  const data = getAppraisalData();
  return data.sectionStatus[sectionId] || 'not_started';
};

/**
 * Update section status
 */
export const updateSectionStatus = (
  sectionId: AppraisalSectionId,
  status: SectionStatus
) => {
  const currentData = getAppraisalData();
  const updatedData = {
    ...currentData,
    sectionStatus: {
      ...currentData.sectionStatus,
      [sectionId]: status,
    },
  };
  setAppraisalData(updatedData);
};

export const getTotalScore = (): number => {
  const data = getAppraisalData();
  let total = 0;
  
  (Object.keys(data) as Array<keyof AppraisalData | 'sectionStatus'>).forEach((key) => {
    if (key !== 'sectionStatus') {
      const section = data[key as keyof AppraisalData];
      if (section && typeof section === 'object' && 'apiScore' in (section as ScoredItem)) {
        const s = (section as ScoredItem).apiScore;
        if (typeof s === 'number') total += s;
      }
    }
  });
  
  return total;
};

/**
 * Get score for a specific section
 */
export const getSectionScore = (sectionId: AppraisalSectionId): number | null => {
  const sectionData = getSectionDataBySectionId(sectionId);
  if (sectionData && typeof sectionData === 'object' && 'apiScore' in (sectionData as ScoredItem)) {
    return (sectionData as ScoredItem).apiScore;
  }
  return null;
};

/**
 * Get all section scores as a map
 */
export const getAllSectionScores = (): Record<string, number | null> => {
  const scores: Record<string, number | null> = {};
  APPRAISAL_SECTIONS.forEach((section) => {
    scores[section.id] = getSectionScore(section.id);
  });
  return scores;
};

export const getCompletedSectionsCount = (): number => {
  const data = getAppraisalData();
  return Object.values(data.sectionStatus).filter(status => status === 'completed').length;
};

/**
 * Get total number of sections
 */
export const getTotalSectionsCount = (): number => {
  return APPRAISAL_SECTIONS.length;
};

/**
 * Get completion percentage
 */
export const getCompletionPercentage = (): number => {
  const completed = getCompletedSectionsCount();
  const total = getTotalSectionsCount();
  return total > 0 ? Math.round((completed / total) * 100) : 0;
};

/**
 * Check if a section is completed
 */
export const isSectionCompleted = (sectionId: AppraisalSectionId): boolean => {
  return getSectionStatus(sectionId) === 'completed';
};

/**
 * Get all incomplete sections
 */
export const getIncompleteSections = (): string[] => {
  const data = getAppraisalData();
  return APPRAISAL_SECTIONS.filter(
    (section) => data.sectionStatus[section.id] !== 'completed'
  ).map((section) => section.id);
};

export const setUser = (user: UserProfile) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

export const getUser = (): UserProfile | null => {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
};

/**
 * Set user ID for API calls
 */
export const setUserId = (userId: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_ID_KEY, userId);
  }
};

/**
 * Get user ID for API calls
 */
export const getUserId = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(USER_ID_KEY);
};

/**
 * Clear user ID
 */
export const clearUserId = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(USER_ID_KEY);
  }
};

export const setAuth = (isAuthenticated: boolean) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_KEY, JSON.stringify(isAuthenticated));
  }
};

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  const data = localStorage.getItem(AUTH_KEY);
  return data ? JSON.parse(data) : false;
};

/**
 * Set authentication token
 */
export const setAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
  }
};

/**
 * Get authentication token
 */
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
};

/**
 * Clear authentication token
 */
export const clearAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
  }
};

/**
 * Logout user and clear all data
 */
export const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem('auth_token');
  }
};

/**
 * Clear all app data (useful for debugging)
 */
export const clearAllData = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(APPRAISAL_KEY);
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem('auth_token');
  }
};
