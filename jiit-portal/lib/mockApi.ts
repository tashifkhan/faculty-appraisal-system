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
} from './types';

export const calculateGeneralDetailsScore = (data: GeneralDetailsForm | GeneralDetailsSection): number => {
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
    return total + (scores[entry.publicationType] || 10);
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

type SectionId =
  | 'general-details'
  | 'conference-events'
  | 'lectures-tutorials'
  | 'research-papers'
  | 'reading-material'
  | 'project-guidance'
  | (string & {});

type SectionPayloadMap = {
  'general-details': GeneralDetailsForm | GeneralDetailsSection;
  'conference-events': ConferenceSection | { entries: ConferenceEntry[] };
  'lectures-tutorials': LecturesTutorialsSection;
  'research-papers': ResearchPapersSection | { entries: ResearchPaperEntry[] };
  'reading-material': ReadingMaterialSection | { entries: ReadingMaterialEntry[] };
  'project-guidance': ProjectGuidanceSection;
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
          score = calculateGeneralDetailsScore(data as SectionPayloadMap['general-details']);
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
