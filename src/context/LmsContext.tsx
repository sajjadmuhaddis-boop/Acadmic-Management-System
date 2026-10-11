import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  Department,
  AcademicSession,
  Course,
  Faculty,
  Student,
  CourseAllocation,
  TimetableSlot,
  AttendanceRecord,
  Assignment,
  AssignmentSubmission,
  Quiz,
  QuizAttempt,
  LectureMaterial,
  ClassNote,
  StudentResult,
  DiscussionThread,
} from '../types/lms';
import {
  initialDepartments,
  initialSessions,
  initialCourses,
  initialFaculty,
  initialStudents,
  initialAllocations,
  initialTimetable,
  initialAttendance,
  initialAssignments,
  initialSubmissions,
  initialQuizzes,
  initialQuizAttempts,
  initialLectureMaterials,
  initialClassNotes,
  initialResults,
  initialDiscussions,
} from '../data/initialData';

interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}

interface LmsContextType {
  // Current user & context
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  activeFacultyId: string;
  setActiveFacultyId: (id: string) => void;
  activeStudentId: string;
  setActiveStudentId: (id: string) => void;
  activeSessionId: string;
  setActiveSessionId: (id: string) => void;

  // Entities
  departments: Department[];
  sessions: AcademicSession[];
  courses: Course[];
  facultyList: Faculty[];
  students: Student[];
  allocations: CourseAllocation[];
  timetable: TimetableSlot[];
  attendance: AttendanceRecord[];
  assignments: Assignment[];
  submissions: AssignmentSubmission[];
  quizzes: Quiz[];
  quizAttempts: QuizAttempt[];
  lectureMaterials: LectureMaterial[];
  classNotes: ClassNote[];
  results: StudentResult[];
  discussions: DiscussionThread[];

  // Toast
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;

  // Admin Actions
  addCourse: (course: Omit<Course, 'id'>) => void;
  updateCourse: (id: string, course: Partial<Course>) => void;
  deleteCourse: (id: string) => void;

  addSession: (session: Omit<AcademicSession, 'id'>) => void;
  updateSession: (id: string, session: Partial<AcademicSession>) => void;
  deleteSession: (id: string) => void;

  addDepartment: (dept: Omit<Department, 'id'>) => void;
  updateDepartment: (id: string, dept: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;

  addTimetableSlot: (slot: Omit<TimetableSlot, 'id'>) => void;
  updateTimetableSlot: (id: string, slot: Partial<TimetableSlot>) => void;
  deleteTimetableSlot: (id: string) => void;

  addFaculty: (faculty: Omit<Faculty, 'id'>) => void;
  updateFaculty: (id: string, faculty: Partial<Faculty>) => void;
  deleteFaculty: (id: string) => void;

  addAllocation: (allocation: Omit<CourseAllocation, 'id'>) => void;
  updateAllocation: (id: string, allocation: Partial<CourseAllocation>) => void;
  deleteAllocation: (id: string) => void;

  // Teacher Actions
  saveAttendanceSheet: (courseId: string, section: string, date: string, records: { studentId: string; status: 'present' | 'absent' | 'late' | 'excused'; remarks?: string }[]) => void;
  addAssignment: (assignment: Omit<Assignment, 'id' | 'createdAt'>) => void;
  updateAssignment: (id: string, assignment: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;
  gradeSubmission: (submissionId: string, marksObtained: number, feedback: string) => void;

  addQuiz: (quiz: Omit<Quiz, 'id' | 'createdAt'>) => void;
  updateQuiz: (id: string, quiz: Partial<Quiz>) => void;
  deleteQuiz: (id: string) => void;

  addLectureMaterial: (material: Omit<LectureMaterial, 'id' | 'uploadedAt'>) => void;
  updateLectureMaterial: (id: string, material: Partial<LectureMaterial>) => void;
  deleteLectureMaterial: (id: string) => void;

  addClassNote: (note: Omit<ClassNote, 'id' | 'createdAt' | 'facultyName'>) => void;
  updateClassNote: (id: string, note: Partial<ClassNote>) => void;
  deleteClassNote: (id: string) => void;

  updateStudentResult: (id: string, scores: Partial<StudentResult>) => void;

  // Student Actions
  submitAssignment: (assignmentId: string, studentId: string, content: string, fileName?: string) => void;
  submitQuizAttempt: (quizId: string, studentId: string, selectedAnswers: Record<string, number>) => void;
  createDiscussionThread: (data: { recipientType: 'teacher' | 'admin'; recipientId: string; recipientName: string; courseId?: string; subject: string; message: string }) => void;
  replyToDiscussion: (threadId: string, message: string) => void;
  toggleDiscussionStatus: (threadId: string) => void;

  // Helpers
  resetToDefaultData: () => void;
  getCurrentFaculty: () => Faculty | undefined;
  getCurrentStudent: () => Student | undefined;
  getCurrentSession: () => AcademicSession | undefined;
}

const LmsContext = createContext<LmsContextType | null>(null);

const STORAGE_KEY = 'edupulse_lms_v1_data';

export const LmsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRole, setActiveRole] = useState<UserRole>('admin');
  const [activeFacultyId, setActiveFacultyId] = useState<string>('fac-1');
  const [activeStudentId, setActiveStudentId] = useState<string>('stu-1');
  const [activeSessionId, setActiveSessionId] = useState<string>('sess-1');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Initialize state from localStorage or initialData
  const [departments, setDepartments] = useState<Department[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_departments`);
    return saved ? JSON.parse(saved) : initialDepartments;
  });

  const [sessions, setSessions] = useState<AcademicSession[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_sessions`);
    return saved ? JSON.parse(saved) : initialSessions;
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_courses`);
    return saved ? JSON.parse(saved) : initialCourses;
  });

  const [facultyList, setFacultyList] = useState<Faculty[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_faculty`);
    return saved ? JSON.parse(saved) : initialFaculty;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_students`);
    return saved ? JSON.parse(saved) : initialStudents;
  });

  const [allocations, setAllocations] = useState<CourseAllocation[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_allocations`);
    return saved ? JSON.parse(saved) : initialAllocations;
  });

  const [timetable, setTimetable] = useState<TimetableSlot[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_timetable`);
    return saved ? JSON.parse(saved) : initialTimetable;
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_attendance`);
    return saved ? JSON.parse(saved) : initialAttendance;
  });

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_assignments`);
    return saved ? JSON.parse(saved) : initialAssignments;
  });

  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_submissions`);
    return saved ? JSON.parse(saved) : initialSubmissions;
  });

  const [quizzes, setQuizzes] = useState<Quiz[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_quizzes`);
    return saved ? JSON.parse(saved) : initialQuizzes;
  });

  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_quizAttempts`);
    return saved ? JSON.parse(saved) : initialQuizAttempts;
  });

  const [lectureMaterials, setLectureMaterials] = useState<LectureMaterial[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_lectureMaterials`);
    return saved ? JSON.parse(saved) : initialLectureMaterials;
  });

  const [classNotes, setClassNotes] = useState<ClassNote[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_classNotes`);
    return saved ? JSON.parse(saved) : initialClassNotes;
  });

  const [results, setResults] = useState<StudentResult[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_results`);
    return saved ? JSON.parse(saved) : initialResults;
  });

  const [discussions, setDiscussions] = useState<DiscussionThread[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_discussions`);
    return saved ? JSON.parse(saved) : initialDiscussions;
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_departments`, JSON.stringify(departments));
  }, [departments]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_sessions`, JSON.stringify(sessions));
  }, [sessions]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_courses`, JSON.stringify(courses));
  }, [courses]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_faculty`, JSON.stringify(facultyList));
  }, [facultyList]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_students`, JSON.stringify(students));
  }, [students]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_allocations`, JSON.stringify(allocations));
  }, [allocations]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_timetable`, JSON.stringify(timetable));
  }, [timetable]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_attendance`, JSON.stringify(attendance));
  }, [attendance]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_assignments`, JSON.stringify(assignments));
  }, [assignments]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_submissions`, JSON.stringify(submissions));
  }, [submissions]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_quizzes`, JSON.stringify(quizzes));
  }, [quizzes]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_quizAttempts`, JSON.stringify(quizAttempts));
  }, [quizAttempts]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_lectureMaterials`, JSON.stringify(lectureMaterials));
  }, [lectureMaterials]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_classNotes`, JSON.stringify(classNotes));
  }, [classNotes]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_results`, JSON.stringify(results));
  }, [results]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_discussions`, JSON.stringify(discussions));
  }, [discussions]);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Helper getters
  const getCurrentFaculty = () => facultyList.find((f) => f.id === activeFacultyId) || facultyList[0];
  const getCurrentStudent = () => students.find((s) => s.id === activeStudentId) || students[0];
  const getCurrentSession = () => sessions.find((s) => s.id === activeSessionId) || sessions[0];

  // Admin Courses
  const addCourse = (courseData: Omit<Course, 'id'>) => {
    const newCourse: Course = {
      ...courseData,
      id: `course-${Date.now()}`,
    };
    setCourses((prev) => [newCourse, ...prev]);
    showToast(`Course "${newCourse.code} - ${newCourse.title}" created successfully!`);
  };

  const updateCourse = (id: string, updated: Partial<Course>) => {
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
    showToast('Course updated successfully.');
  };

  const deleteCourse = (id: string) => {
    const target = courses.find((c) => c.id === id);
    setCourses((prev) => prev.filter((c) => c.id !== id));
    // also remove allocations and timetable slots associated with it
    setAllocations((prev) => prev.filter((a) => a.courseId !== id));
    setTimetable((prev) => prev.filter((t) => t.courseId !== id));
    showToast(`Course ${target?.code || ''} removed.`);
  };

  // Admin Sessions
  const addSession = (sessionData: Omit<AcademicSession, 'id'>) => {
    const newSession: AcademicSession = {
      ...sessionData,
      id: `sess-${Date.now()}`,
    };
    if (newSession.isCurrent) {
      setSessions((prev) => prev.map((s) => ({ ...s, isCurrent: false })));
      setActiveSessionId(newSession.id);
    }
    setSessions((prev) => [newSession, ...prev]);
    showToast(`Academic session "${newSession.name}" added!`);
  };

  const updateSession = (id: string, updated: Partial<AcademicSession>) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const res = { ...s, ...updated };
          if (updated.isCurrent) {
            setActiveSessionId(id);
          }
          return res;
        }
        if (updated.isCurrent) {
          return { ...s, isCurrent: false };
        }
        return s;
      })
    );
    showToast('Academic session updated.');
  };

  const deleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    showToast('Academic session deleted.');
  };

  // Admin Departments
  const addDepartment = (deptData: Omit<Department, 'id'>) => {
    const newDept: Department = {
      ...deptData,
      id: `dept-${Date.now()}`,
    };
    setDepartments((prev) => [newDept, ...prev]);
    showToast(`Department "${newDept.name}" added successfully!`);
  };

  const updateDepartment = (id: string, updated: Partial<Department>) => {
    setDepartments((prev) => prev.map((d) => (d.id === id ? { ...d, ...updated } : d)));
    showToast('Department updated successfully.');
  };

  const deleteDepartment = (id: string) => {
    setDepartments((prev) => prev.filter((d) => d.id !== id));
    showToast('Department deleted.');
  };

  // Admin Timetable
  const addTimetableSlot = (slotData: Omit<TimetableSlot, 'id'>) => {
    const newSlot: TimetableSlot = {
      ...slotData,
      id: `tt-${Date.now()}`,
    };
    setTimetable((prev) => [...prev, newSlot]);
    showToast(`Timetable schedule slot added.`);
  };

  const updateTimetableSlot = (id: string, updated: Partial<TimetableSlot>) => {
    setTimetable((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));
    showToast('Schedule slot updated.');
  };

  const deleteTimetableSlot = (id: string) => {
    setTimetable((prev) => prev.filter((t) => t.id !== id));
    showToast('Schedule slot removed.');
  };

  // Admin Faculty
  const addFaculty = (facData: Omit<Faculty, 'id'>) => {
    const newFac: Faculty = {
      ...facData,
      id: `fac-${Date.now()}`,
    };
    setFacultyList((prev) => [newFac, ...prev]);
    showToast(`Faculty member "${newFac.name}" added.`);
  };

  const updateFaculty = (id: string, updated: Partial<Faculty>) => {
    setFacultyList((prev) => prev.map((f) => (f.id === id ? { ...f, ...updated } : f)));
    showToast('Faculty details updated.');
  };

  const deleteFaculty = (id: string) => {
    setFacultyList((prev) => prev.filter((f) => f.id !== id));
    setAllocations((prev) => prev.filter((a) => a.facultyId !== id));
    showToast('Faculty member removed.');
  };

  // Admin Course Allocations
  const addAllocation = (allocData: Omit<CourseAllocation, 'id'>) => {
    const newAlloc: CourseAllocation = {
      ...allocData,
      id: `alloc-${Date.now()}`,
    };
    setAllocations((prev) => [newAlloc, ...prev]);
    showToast('Course allocation successfully recorded.');
  };

  const updateAllocation = (id: string, updated: Partial<CourseAllocation>) => {
    setAllocations((prev) => prev.map((a) => (a.id === id ? { ...a, ...updated } : a)));
    showToast('Course allocation updated.');
  };

  const deleteAllocation = (id: string) => {
    setAllocations((prev) => prev.filter((a) => a.id !== id));
    showToast('Course allocation removed.');
  };

  // Teacher Attendance
  const saveAttendanceSheet = (
    courseId: string,
    section: string,
    date: string,
    records: { studentId: string; status: 'present' | 'absent' | 'late' | 'excused'; remarks?: string }[]
  ) => {
    // Remove existing records for this course + section + date
    setAttendance((prev) => {
      const filtered = prev.filter(
        (att) => !(att.courseId === courseId && att.section === section && att.date === date)
      );
      const newEntries: AttendanceRecord[] = records.map((r) => ({
        id: `att-${Date.now()}-${r.studentId}`,
        courseId,
        section,
        date,
        studentId: r.studentId,
        status: r.status,
        remarks: r.remarks,
      }));
      return [...filtered, ...newEntries];
    });
    showToast(`Attendance marked for ${records.length} students on ${date}.`);
  };

  // Teacher Assignments
  const addAssignment = (data: Omit<Assignment, 'id' | 'createdAt'>) => {
    const newAsg: Assignment = {
      ...data,
      id: `asg-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setAssignments((prev) => [newAsg, ...prev]);
    showToast(`Assignment "${newAsg.title}" created successfully.`);
  };

  const updateAssignment = (id: string, updated: Partial<Assignment>) => {
    setAssignments((prev) => prev.map((a) => (a.id === id ? { ...a, ...updated } : a)));
    showToast('Assignment details updated.');
  };

  const deleteAssignment = (id: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
    setSubmissions((prev) => prev.filter((s) => s.assignmentId !== id));
    showToast('Assignment deleted.');
  };

  const gradeSubmission = (submissionId: string, marksObtained: number, feedback: string) => {
    setSubmissions((prev) =>
      prev.map((sub) =>
        sub.id === submissionId
          ? {
              ...sub,
              status: 'graded',
              marksObtained,
              feedback,
            }
          : sub
      )
    );
    showToast(`Submission graded: ${marksObtained} marks awarded.`);
  };

  // Teacher Quizzes
  const addQuiz = (data: Omit<Quiz, 'id' | 'createdAt'>) => {
    const newQuiz: Quiz = {
      ...data,
      id: `quiz-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setQuizzes((prev) => [newQuiz, ...prev]);
    showToast(`Quiz "${newQuiz.title}" created with ${newQuiz.questions.length} questions!`);
  };

  const updateQuiz = (id: string, updated: Partial<Quiz>) => {
    setQuizzes((prev) => prev.map((q) => (q.id === id ? { ...q, ...updated } : q)));
    showToast('Quiz updated.');
  };

  const deleteQuiz = (id: string) => {
    setQuizzes((prev) => prev.filter((q) => q.id !== id));
    setQuizAttempts((prev) => prev.filter((qa) => qa.quizId !== id));
    showToast('Quiz deleted.');
  };

  // Teacher Lecture Materials
  const addLectureMaterial = (data: Omit<LectureMaterial, 'id' | 'uploadedAt'>) => {
    const newMat: LectureMaterial = {
      ...data,
      id: `lec-${Date.now()}`,
      uploadedAt: new Date().toISOString().split('T')[0],
    };
    setLectureMaterials((prev) => [newMat, ...prev]);
    showToast(`Lecture material "${newMat.title}" uploaded!`);
  };

  const updateLectureMaterial = (id: string, updated: Partial<LectureMaterial>) => {
    setLectureMaterials((prev) => prev.map((m) => (m.id === id ? { ...m, ...updated } : m)));
    showToast('Lecture material updated.');
  };

  const deleteLectureMaterial = (id: string) => {
    setLectureMaterials((prev) => prev.filter((m) => m.id !== id));
    showToast('Lecture material removed.');
  };

  // Teacher Class Notes
  const addClassNote = (data: Omit<ClassNote, 'id' | 'createdAt' | 'facultyName'>) => {
    const currentFac = getCurrentFaculty();
    const newNote: ClassNote = {
      ...data,
      id: `cn-${Date.now()}`,
      facultyName: currentFac?.name || 'Instructor',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    setClassNotes((prev) => [newNote, ...prev]);
    showToast(`Class note "${newNote.title}" posted to students!`);
  };

  const updateClassNote = (id: string, updated: Partial<ClassNote>) => {
    setClassNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...updated } : n)));
    showToast('Class note updated.');
  };

  const deleteClassNote = (id: string) => {
    setClassNotes((prev) => prev.filter((n) => n.id !== id));
    showToast('Class note deleted.');
  };

  // Results calculation helper
  const updateStudentResult = (id: string, scores: Partial<StudentResult>) => {
    setResults((prev) =>
      prev.map((res) => {
        if (res.id !== id) return res;
        const updated = { ...res, ...scores };
        const total = (updated.assignmentsScore || 0) + (updated.quizzesScore || 0) + (updated.midtermScore || 0) + (updated.finalExamScore || 0);
        let grade = 'F';
        let gpa = 0.0;
        if (total >= 90) { grade = 'A'; gpa = 4.0; }
        else if (total >= 85) { grade = 'A-'; gpa = 3.7; }
        else if (total >= 80) { grade = 'B+'; gpa = 3.3; }
        else if (total >= 75) { grade = 'B'; gpa = 3.0; }
        else if (total >= 70) { grade = 'B-'; gpa = 2.7; }
        else if (total >= 65) { grade = 'C+'; gpa = 2.3; }
        else if (total >= 60) { grade = 'C'; gpa = 2.0; }
        else if (total >= 50) { grade = 'D'; gpa = 1.0; }
        else { grade = 'F'; gpa = 0.0; }
        return {
          ...updated,
          totalScore: total,
          gradeLetter: grade,
          gpa,
        };
      })
    );
    showToast('Student result & grade points calculated and saved.');
  };

  // Student Actions
  const submitAssignment = (assignmentId: string, studentId: string, content: string, fileName?: string) => {
    const student = students.find((s) => s.id === studentId);
    const existingIndex = submissions.findIndex((s) => s.assignmentId === assignmentId && s.studentId === studentId);

    const newSub: AssignmentSubmission = {
      id: existingIndex >= 0 ? submissions[existingIndex].id : `sub-${Date.now()}`,
      assignmentId,
      studentId,
      studentName: student?.name || 'Student',
      submittedAt: new Date().toISOString(),
      content,
      fileName: fileName || 'Assignment_Submission.pdf',
      status: 'submitted',
    };

    if (existingIndex >= 0) {
      setSubmissions((prev) => prev.map((s, idx) => (idx === existingIndex ? newSub : s)));
    } else {
      setSubmissions((prev) => [newSub, ...prev]);
    }
    showToast('Assignment submitted successfully to instructor!');
  };

  const submitQuizAttempt = (quizId: string, studentId: string, selectedAnswers: Record<string, number>) => {
    const quiz = quizzes.find((q) => q.id === quizId);
    const student = students.find((s) => s.id === studentId);
    if (!quiz) return;

    let score = 0;
    quiz.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctOptionIndex) {
        score += q.points;
      }
    });

    const newAttempt: QuizAttempt = {
      id: `qa-${Date.now()}`,
      quizId,
      studentId,
      studentName: student?.name || 'Student',
      attemptedAt: new Date().toISOString(),
      score,
      totalMarks: quiz.totalMarks,
      selectedAnswers,
    };

    setQuizAttempts((prev) => [newAttempt, ...prev]);
    showToast(`Quiz completed! You scored ${score} / ${quiz.totalMarks}.`, 'info');
  };

  // Discussions & Messaging (Teacher or Admin)
  const createDiscussionThread = (data: {
    recipientType: 'teacher' | 'admin';
    recipientId: string;
    recipientName: string;
    courseId?: string;
    subject: string;
    message: string;
  }) => {
    const currentStudent = getCurrentStudent();
    const newThread: DiscussionThread = {
      id: `disc-${Date.now()}`,
      studentId: currentStudent?.id || 'stu-1',
      studentName: currentStudent?.name || 'Ali Ahmed',
      studentRollNo: currentStudent?.rollNo || 'CS-2022-041',
      recipientType: data.recipientType,
      recipientId: data.recipientId,
      recipientName: data.recipientName,
      courseId: data.courseId,
      subject: data.subject,
      message: data.message,
      status: 'open',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      replies: [],
    };

    setDiscussions((prev) => [newThread, ...prev]);
    showToast(
      `Message dispatched to ${data.recipientType === 'teacher' ? 'Teacher' : 'Administrator'} (${data.recipientName}).`
    );

    // Provide an automated realistic response after 2.5 seconds to simulate interactive portal!
    setTimeout(() => {
      const isTeacher = data.recipientType === 'teacher';
      const autoReplyText = isTeacher
        ? `Hello ${currentStudent?.name}, I have received your message regarding "${data.subject}". Let's discuss this during our office hours or in the upcoming lecture. Best regards, ${data.recipientName}.`
        : `Dear ${currentStudent?.name}, Your administrative ticket for "${data.subject}" has been registered by the Office of Administration. Our coordinator will follow up shortly.`;

      setDiscussions((currentList) =>
        currentList.map((thread) => {
          if (thread.id === newThread.id) {
            return {
              ...thread,
              replies: [
                ...thread.replies,
                {
                  id: `rep-auto-${Date.now()}`,
                  senderRole: isTeacher ? 'teacher' : 'admin',
                  senderName: data.recipientName,
                  message: autoReplyText,
                  timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
                },
              ],
            };
          }
          return thread;
        })
      );
      showToast(`New reply received from ${data.recipientName}!`, 'info');
    }, 2500);
  };

  const replyToDiscussion = (threadId: string, message: string) => {
    let senderRole: UserRole = activeRole;
    let senderName = 'Academic Staff';
    if (activeRole === 'student') {
      senderName = getCurrentStudent()?.name || 'Student';
    } else if (activeRole === 'teacher') {
      senderName = getCurrentFaculty()?.name || 'Instructor';
    } else {
      senderName = 'Administrator (Registrar Office)';
    }

    setDiscussions((prev) =>
      prev.map((thread) => {
        if (thread.id === threadId) {
          return {
            ...thread,
            replies: [
              ...thread.replies,
              {
                id: `rep-${Date.now()}`,
                senderRole,
                senderName,
                message,
                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
              },
            ],
          };
        }
        return thread;
      })
    );
    showToast('Reply posted to conversation thread.');
  };

  const toggleDiscussionStatus = (threadId: string) => {
    setDiscussions((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, status: t.status === 'open' ? 'resolved' : 'open' } : t))
    );
    showToast('Conversation status updated.');
  };

  const resetToDefaultData = () => {
    setDepartments(initialDepartments);
    setSessions(initialSessions);
    setCourses(initialCourses);
    setFacultyList(initialFaculty);
    setStudents(initialStudents);
    setAllocations(initialAllocations);
    setTimetable(initialTimetable);
    setAttendance(initialAttendance);
    setAssignments(initialAssignments);
    setSubmissions(initialSubmissions);
    setQuizzes(initialQuizzes);
    setQuizAttempts(initialQuizAttempts);
    setLectureMaterials(initialLectureMaterials);
    setClassNotes(initialClassNotes);
    setResults(initialResults);
    setDiscussions(initialDiscussions);

    localStorage.removeItem(`${STORAGE_KEY}_departments`);
    localStorage.removeItem(`${STORAGE_KEY}_sessions`);
    localStorage.removeItem(`${STORAGE_KEY}_courses`);
    localStorage.removeItem(`${STORAGE_KEY}_faculty`);
    localStorage.removeItem(`${STORAGE_KEY}_students`);
    localStorage.removeItem(`${STORAGE_KEY}_allocations`);
    localStorage.removeItem(`${STORAGE_KEY}_timetable`);
    localStorage.removeItem(`${STORAGE_KEY}_attendance`);
    localStorage.removeItem(`${STORAGE_KEY}_assignments`);
    localStorage.removeItem(`${STORAGE_KEY}_submissions`);
    localStorage.removeItem(`${STORAGE_KEY}_quizzes`);
    localStorage.removeItem(`${STORAGE_KEY}_quizAttempts`);
    localStorage.removeItem(`${STORAGE_KEY}_lectureMaterials`);
    localStorage.removeItem(`${STORAGE_KEY}_classNotes`);
    localStorage.removeItem(`${STORAGE_KEY}_results`);
    localStorage.removeItem(`${STORAGE_KEY}_discussions`);

    showToast('System data reset to default demo dataset.', 'info');
  };

  return (
    <LmsContext.Provider
      value={{
        activeRole,
        setActiveRole,
        activeFacultyId,
        setActiveFacultyId,
        activeStudentId,
        setActiveStudentId,
        activeSessionId,
        setActiveSessionId,

        departments,
        sessions,
        courses,
        facultyList,
        students,
        allocations,
        timetable,
        attendance,
        assignments,
        submissions,
        quizzes,
        quizAttempts,
        lectureMaterials,
        classNotes,
        results,
        discussions,

        toasts,
        showToast,
        removeToast,

        addCourse,
        updateCourse,
        deleteCourse,

        addSession,
        updateSession,
        deleteSession,

        addDepartment,
        updateDepartment,
        deleteDepartment,

        addTimetableSlot,
        updateTimetableSlot,
        deleteTimetableSlot,

        addFaculty,
        updateFaculty,
        deleteFaculty,

        addAllocation,
        updateAllocation,
        deleteAllocation,

        saveAttendanceSheet,
        addAssignment,
        updateAssignment,
        deleteAssignment,
        gradeSubmission,

        addQuiz,
        updateQuiz,
        deleteQuiz,

        addLectureMaterial,
        updateLectureMaterial,
        deleteLectureMaterial,

        addClassNote,
        updateClassNote,
        deleteClassNote,

        updateStudentResult,

        submitAssignment,
        submitQuizAttempt,
        createDiscussionThread,
        replyToDiscussion,
        toggleDiscussionStatus,

        resetToDefaultData,
        getCurrentFaculty,
        getCurrentStudent,
        getCurrentSession,
      }}
    >
      {children}
    </LmsContext.Provider>
  );
};

export const useLms = () => {
  const context = useContext(LmsContext);
  if (!context) {
    throw new Error('useLms must be used within an LmsProvider');
  }
  return context;
};
