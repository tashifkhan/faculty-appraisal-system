import { AppraisalData, ScoredItem, UserProfile } from './types';

const APPRAISAL_KEY = 'jiit_faculty_appraisal_data';
const USER_KEY = 'jiit_faculty_user';
const AUTH_KEY = 'jiit_faculty_auth';

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

export const updateSectionData = <T extends keyof AppraisalData>(
  sectionId: T,
  data: AppraisalData[T],
  score: number,
  status: 'completed' | 'in_progress' = 'completed'
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

export const getSectionData = <T extends keyof AppraisalData>(
  sectionId: T
): AppraisalData[T] | undefined => {
  const data = getAppraisalData();
  return data[sectionId];
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

export const getCompletedSectionsCount = (): number => {
  const data = getAppraisalData();
  return Object.values(data.sectionStatus).filter(status => status === 'completed').length;
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

export const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(USER_KEY);
  }
};
