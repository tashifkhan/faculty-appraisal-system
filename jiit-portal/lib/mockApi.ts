// Mock API functions to simulate backend scoring

export const calculateGeneralDetailsScore = (data: any): number => {
  // Simple mock: 10 points for completing general details
  return 10;
};

export const calculateConferenceScore = (entries: any[]): number => {
  // Mock: 5 points per conference attended, 10 per organized
  return entries.reduce((total, entry) => {
    return total + (entry.attendedOrganized === 'organized' ? 10 : 5);
  }, 0);
};

export const calculateLecturesScore = (oddSemester: any[], evenSemester: any[]): number => {
  // Mock: 10 points per course
  return (oddSemester.length + evenSemester.length) * 10;
};

export const calculateResearchPapersScore = (entries: any[]): number => {
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

export const simulateApiCall = (sectionId: string, data: any): Promise<{ score: number; message: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let score = 0;
      
      switch (sectionId) {
        case 'general-details':
          score = calculateGeneralDetailsScore(data);
          break;
        case 'conference-events':
          score = calculateConferenceScore(data.entries || []);
          break;
        case 'lectures-tutorials':
          score = calculateLecturesScore(data.oddSemester || [], data.evenSemester || []);
          break;
        case 'research-papers':
          score = calculateResearchPapersScore(data.entries || []);
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
