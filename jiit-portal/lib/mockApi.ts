// Mock API functions to simulate backend scoring
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
  ExamDutiesSection,
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
} from './types';

export const calculateGeneralDetailsScore = (): number => {
  // Simple mock: 10 points for completing general details
  return 10;
};

export const calculateConferenceScore = (entries: ConferenceEntry[]): number => {
  // Mock: 5 points per conference attended, 10 per organized
  return entries.reduce((total, entry) => {
    return total + (entry.attendedOrganized === 'organized' ? 10 : 5);
  }, 0);
};

export const calculateLecturesScore = (
  oddSemester: LecturesTutorialsSection['oddSemester'],
  evenSemester: LecturesTutorialsSection['evenSemester']
): number => {
  // Mock: 10 points per course
  return (oddSemester.length + evenSemester.length) * 10;
};

export const calculateResearchPapersScore = (entries: ResearchPaperEntry[]): number => {
  // Mock: Different scores based on publication type
  const scores: { [key: string]: number } = {
    IJ: 20, // International Journal
    NJ: 15, // National Journal
    IC: 10, // International Conference
    PN: 25, // Patent
    OA: 12, // Open Access
  };
  
  return entries.reduce((total, entry) => {
    return total + (scores[entry.pubType] || 10);
  }, 0);
};

export const calculateReadingMaterialScore = (entries: ReadingMaterialEntry[]): number => {
  // Mock: sum of self-assessed API scores, capped per entry at 5
  return entries.reduce((total, e) => total + Math.min(Math.max(Number(e.selfAssessedApi) || 0, 0), 5), 0);
};

export const calculateProjectGuidanceScore = (data: ProjectGuidanceSection): number => {
  // Mock: 2 points per project and 0.2 per student, rounded
  const p = Math.max(0, Number(data.projectsGuided) || 0);
  const s = Math.max(0, Number(data.studentsGuided) || 0);
  return Math.round(p * 2 + s * 0.2);
};

export const calculateExamDutiesScore = (entries: ExamDutyEntry[]): number => {
  // Mock: weight by activity; sum of t1+t2+t3 with multipliers
  const weights: Record<string, number> = {
    qp_set: 1, // each set counts 1
    ab_evaluated: 0.02, // 50 scripts ~ 1 point
    practical_conducted: 0.5, // each practical ~ 0.5
  };
  return Math.round(
    entries.reduce((total, e) => {
      const sum = (Number(e.t1) || 0) + (Number(e.t2) || 0) + (Number(e.t3) || 0);
      return total + sum * (weights[e.activity] ?? 0.1);
    }, 0)
  );
};


type SectionId =
  | 'general-details'
  | 'conference-events'
  | 'lectures-tutorials'
  | 'research-papers'
  | 'reading-material'
  | 'project-guidance'
  | 'exam-duties'
  | 'books-chapters'
  | 'research-projects'
  | 'research-guidance'
  | 'memberships'
  | 'student-activities'
  | (string & {});

type SectionPayloadMap = {
  'general-details': GeneralDetailsForm | GeneralDetailsSection;
  'conference-events': ConferenceSection | { entries: ConferenceEntry[] };
  'lectures-tutorials': LecturesTutorialsSection;
  'research-papers': ResearchPapersSection | { entries: ResearchPaperEntry[] };
  'reading-material': ReadingMaterialSection | { entries: ReadingMaterialEntry[] };
  'project-guidance': ProjectGuidanceSection;
  'exam-duties': ExamDutiesSection | { entries: ExamDutyEntry[] };
  'books-chapters': BooksChaptersSection | { entries: BookChapterEntry[] };
  'research-projects': ResearchProjectsSection | { entries: ResearchProjectEntry[] };
  'research-guidance': ResearchGuidanceSection | { entries: ResearchGuidanceEntry[] };
  'memberships': MembershipsSection | { entries: MembershipEntry[] };
  'student-activities': StudentActivitiesSection;
};

export const simulateApiCall = <T extends SectionId>(
  sectionId: T,
  data: T extends keyof SectionPayloadMap ? SectionPayloadMap[T] : unknown
): Promise<{ score: number; message: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let score = 0;
      
      switch (sectionId) {
        case 'general-details':
          score = calculateGeneralDetailsScore();
          break;
        case 'conference-events':
          score = calculateConferenceScore((data as ConferenceSection | { entries: ConferenceEntry[] }).entries || []);
          break;
        case 'lectures-tutorials':
          {
            const d = data as LecturesTutorialsSection;
            score = calculateLecturesScore(d.oddSemester || [], d.evenSemester || []);
          }
          break;
        case 'research-papers':
          score = calculateResearchPapersScore((data as ResearchPapersSection | { entries: ResearchPaperEntry[] }).entries || []);
          break;
        case 'reading-material':
          score = calculateReadingMaterialScore((data as ReadingMaterialSection | { entries: ReadingMaterialEntry[] }).entries || []);
          break;
        case 'project-guidance':
          score = calculateProjectGuidanceScore(data as ProjectGuidanceSection);
          break;
        case 'exam-duties':
          score = calculateExamDutiesScore((data as ExamDutiesSection | { entries: ExamDutyEntry[] }).entries || []);
          break;
        default:
          score = 5; // Default score for other sections
      }
      
      resolve({
        score,
        message: `Section submitted successfully. API Score: ${score}`,
      });
    }, 500); // Simulate network delay
  });
};
