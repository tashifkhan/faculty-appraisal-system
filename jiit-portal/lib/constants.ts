export const APPRAISAL_SECTIONS = [
  { id: 'general-details', title: '1. General Details', route: '/appraisal/general-details' },
  { id: 'conference-events', title: '2. Conference and All', route: '/appraisal/conference-events' },
  { id: 'lectures-tutorials', title: '3. Lectures/Tutorials/Practicals', route: '/appraisal/lectures-tutorials' },
  { id: 'reading-material', title: '4. Reading Material', route: '/appraisal/reading-material' },
  { id: 'project-guidance', title: '5. Project Guidance', route: '/appraisal/project-guidance' },
  { id: 'exam-duties', title: '6. Examination Duties', route: '/appraisal/exam-duties' },
  { id: 'student-activities', title: '7. Student Activities', route: '/appraisal/student-activities' },
  { id: 'research-papers', title: '8. Research Papers', route: '/appraisal/research-papers' },
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
] as const;
