export type UserRole = 'admin' | 'teacher' | 'student';

export interface Department {
  id: string;
  code: string; // e.g. CS, EE, BBA
  name: string; // e.g. Computer Science & IT
  hod: string; // e.g. Dr. Rehman Metha
  email: string;
  phone: string;
  building: string;
  description: string;
}

export interface AcademicSession {
  id: string;
  name: string; // e.g. Fall 2025
  code: string; // e.g. FA25
  startDate: string;
  endDate: string;
  status: 'active' | 'upcoming' | 'completed' | 'archived';
  isCurrent: boolean;
}

export interface Course {
  id: string;
  code: string; // e.g. CS-301
  title: string; // e.g. Data Structures & Algorithms
  departmentId: string;
  credits: number;
  semester: number;
  description: string;
  prerequisites: string;
  syllabusTopics: string[];
}

export interface Faculty {
  id: string;
  name: string;
  employeeId: string;
  email: string;
  phone: string;
  departmentId: string;
  designation: 'Professor' | 'Associate Professor' | 'Assistant Professor' | 'Lecturer' | 'Dean';
  qualification: string;
  officeRoom: string;
  specialization: string;
  avatar?: string;
}

export interface Student {
  id: string;
  name: string;
  rollNo: string;
  email: string;
  phone: string;
  departmentId: string;
  semester: number;
  section: string;
  cgpa: number;
  avatar?: string;
}

export interface CourseAllocation {
  id: string;
  courseId: string;
  facultyId: string;
  sessionId: string;
  section: string; // e.g. "A" or "B"
  semester: number;
}

export interface TimetableSlot {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime: string; // e.g. "09:00 AM"
  endTime: string; // e.g. "10:30 AM"
  courseId: string;
  facultyId: string;
  section: string;
  room: string; // e.g. "Lab 3" or "Room 204"
  type: 'Lecture' | 'Lab' | 'Tutorial';
}

export interface AttendanceRecord {
  id: string;
  courseId: string;
  section: string;
  date: string; // YYYY-MM-DD
  studentId: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks?: string;
}

export interface Assignment {
  id: string;
  courseId: string;
  section: string;
  facultyId: string;
  title: string;
  description: string;
  totalMarks: number;
  dueDate: string; // YYYY-MM-DDTHH:mm
  attachmentUrl?: string;
  createdAt: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  content: string;
  fileName?: string;
  status: 'submitted' | 'graded';
  marksObtained?: number;
  feedback?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  points: number;
}

export interface Quiz {
  id: string;
  courseId: string;
  section: string;
  facultyId: string;
  title: string;
  description: string;
  durationMinutes: number;
  totalMarks: number;
  dueDate: string;
  questions: QuizQuestion[];
  createdAt: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  studentName: string;
  attemptedAt: string;
  score: number;
  totalMarks: number;
  selectedAnswers: Record<string, number>;
}

export interface LectureMaterial {
  id: string;
  courseId: string;
  section: string;
  facultyId: string;
  week: number;
  title: string;
  moduleName: string;
  description: string;
  resourceType: 'slides' | 'notes' | 'pdf' | 'video';
  fileSize?: string;
  downloadUrl?: string;
  uploadedAt: string;
}

export interface ClassNote {
  id: string;
  courseId: string;
  section: string;
  facultyId: string;
  facultyName: string;
  title: string;
  content: string;
  priority: 'normal' | 'important' | 'urgent';
  createdAt: string;
}

export interface StudentResult {
  id: string;
  studentId: string;
  courseId: string;
  section: string;
  sessionId: string;
  assignmentsScore: number; // out of 20
  quizzesScore: number; // out of 20
  midtermScore: number; // out of 25
  finalExamScore: number; // out of 35
  totalScore: number; // out of 100
  gradeLetter: string; // 'A', 'B+', etc.
  gpa: number; // 4.0 scale
  remarks: string;
}

export interface MessageReply {
  id: string;
  senderRole: UserRole;
  senderName: string;
  message: string;
  timestamp: string;
}

export interface DiscussionThread {
  id: string;
  studentId: string;
  studentName: string;
  studentRollNo: string;
  recipientType: 'teacher' | 'admin';
  recipientId: string; // facultyId or 'admin-office'
  recipientName: string;
  courseId?: string; // if teacher message
  subject: string;
  message: string;
  status: 'open' | 'resolved';
  createdAt: string;
  replies: MessageReply[];
}
