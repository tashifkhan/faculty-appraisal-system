export const APPRAISAL_SECTIONS = [
  { id: 'general-details', title: '1. General Details', route: '/appraisal/general-details' },
  { id: '11-conference-events', title: '2. Conference and All', route: '/appraisal/11-conference-events' },
  { id: '12-1-lectures-tutorials', title: '3. Lectures/Tutorials/Practicals', route: '/appraisal/12-1-lectures-tutorials' },
  { id: '12-2-reading-material', title: '4. Reading Material', route: '/appraisal/12-2-reading-material' },
  { id: '12-3-4-project-guidance-and-exam-duties', title: '5. Project Guidance', route: '/appraisal/12-3-4-project-guidance-and-exam-duties' },
  // { id: '12-4-exam-duties', title: '6. Examination Duties', route: '/appraisal/exam-duties' },
  { id: '13-student-activities', title: '7. Student Activities', route: '/appraisal/13-student-activities' },
  { id: '14-research-papers', title: '8. Research Papers', route: '/appraisal/14-research-papers' },
  { id: 'books-chapters', title: '9. Books & Chapters', route: '/appraisal/books-chapters' },
  { id: 'research-projects', title: '10. Research Projects', route: '/appraisal/research-projects' },
  { id: 'research-guidance', title: '11. Research Guidance', route: '/appraisal/research-guidance' },
  { id: 'memberships', title: '12. Memberships', route: '/appraisal/memberships' },
] as const;

export const PUBLICATION_TYPES = [
  { value: 'IJ', label: 'International Journal' },
  { value: 'NJ', label: 'National Journal' },
  { value: 'IC', label: 'International Conference' },
  { value: 'PN', label: 'Patent' },
  { value: 'OA', label: 'Open Access' },
  { value: 'OJ', label: 'Other Journal' },
] as const;
