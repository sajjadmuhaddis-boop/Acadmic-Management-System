import React from 'react';
import { useLms } from '../../context/LmsContext';
import {
  GraduationCap,
  Clock,
  CheckSquare,
  FileText,
  HelpCircle,
  FolderDown,
  MessagesSquare,
  ArrowRight,
  Calendar,
  AlertCircle,
  BookOpen,
} from 'lucide-react';

interface StudentDashboardProps {
  onNavigateTab: (tabId: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigateTab }) => {
  const {
    getCurrentStudent,
    courses,
    allocations,
    timetable,
    attendance,
    assignments,
    submissions,
    quizzes,
    quizAttempts,
    lectureMaterials,
    classNotes,
  } = useLms();

  const currentStudent = getCurrentStudent();

  // Enrolled courses for this student
  const myAllocations = allocations.filter((a) => a.section === currentStudent?.section);
  const myCourseIds = new Set(myAllocations.map((a) => a.courseId));
  const myCourses = courses.filter((c) => myCourseIds.has(c.id));

  // Attendance calculation
  const myAttendance = attendance.filter((a) => a.studentId === currentStudent?.id);
  const totalClasses = myAttendance.length;
  const presentClasses = myAttendance.filter((a) => a.status === 'present' || a.status === 'late').length;
  const attendanceRate = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 100;

  // Assignments
  const myAssignments = assignments.filter((a) => myCourseIds.has(a.courseId));
  const submittedAssignmentIds = new Set(
    submissions.filter((s) => s.studentId === currentStudent?.id).map((s) => s.assignmentId)
  );
  const pendingAssignments = myAssignments.filter((a) => !submittedAssignmentIds.has(a.id));

  // Quizzes
  const myQuizzes = quizzes.filter((q) => myCourseIds.has(q.courseId));
  const attemptedQuizIds = new Set(
    quizAttempts.filter((qa) => qa.studentId === currentStudent?.id).map((qa) => qa.quizId)
  );
  const pendingQuizzes = myQuizzes.filter((q) => !attemptedQuizIds.has(q.id));

  // Timetable for student's section
  const myTimetable = timetable.filter((t) => t.section === currentStudent?.section);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-950/60 via-teal-950/40 to-slate-900 border border-emerald-800/40 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 text-xs font-semibold mb-3">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
              Student Academic Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Welcome, {currentStudent?.name}
            </h1>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              Roll No: <span className="text-white font-mono font-bold">{currentStudent?.rollNo}</span> · Semester {currentStudent?.semester} (Sec {currentStudent?.section}) · Current CGPA: <span className="text-emerald-400 font-bold">{currentStudent?.cgpa.toFixed(2)}</span>.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigateTab('attendance')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all"
              >
                <CheckSquare className="w-4 h-4" />
                View Attendance Record ({attendanceRate}%)
              </button>
              <button
                onClick={() => onNavigateTab('assignments')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-all"
              >
                <FileText className="w-4 h-4" />
                Submit Assignments ({pendingAssignments.length} pending)
              </button>
              <button
                onClick={() => onNavigateTab('discussion')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-all"
              >
                <MessagesSquare className="w-4 h-4" />
                Contact Teacher or Admin
              </button>
            </div>
          </div>

          <div className="hidden lg:block shrink-0">
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-emerald-500/40 shadow-xl">
              {currentStudent?.avatar ? (
                <img
                  src={currentStudent.avatar}
                  alt={currentStudent.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-emerald-800 flex items-center justify-center text-white text-2xl font-bold">
                  {currentStudent?.name.charAt(0)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigateTab('attendance')}
          className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 p-4 rounded-xl cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Attendance Rate</span>
            <CheckSquare className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-400">{attendanceRate}%</div>
          <span className="text-[11px] text-slate-400">
            {presentClasses} / {totalClasses} classes attended
          </span>
        </div>

        <div
          onClick={() => onNavigateTab('assignments')}
          className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 p-4 rounded-xl cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Due Assignments</span>
            <FileText className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{pendingAssignments.length}</div>
          <span className="text-[11px] text-amber-400/90 font-medium">Pending submission</span>
        </div>

        <div
          onClick={() => onNavigateTab('quizzes')}
          className="bg-slate-900 border border-slate-800 hover:border-purple-500/50 p-4 rounded-xl cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Pending Quizzes</span>
            <HelpCircle className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{pendingQuizzes.length}</div>
          <span className="text-[11px] text-purple-400/90 font-medium">Take online test</span>
        </div>

        <div
          onClick={() => onNavigateTab('timetable')}
          className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 p-4 rounded-xl cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Enrolled Courses</span>
            <BookOpen className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{myCourses.length}</div>
          <span className="text-[11px] text-blue-400/90 font-medium">Semester 5 subjects</span>
        </div>
      </div>

      {/* Main Grid: Enrolled Courses & Weekly Timetable */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enrolled Courses */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-base font-semibold text-white">Enrolled Subjects & Faculty</h2>
                <p className="text-xs text-slate-400">Current semester courses and lecture materials</p>
              </div>
              <button
                onClick={() => onNavigateTab('lectures')}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1"
              >
                Course Material
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myCourses.map((c) => {
                const alloc = myAllocations.find((a) => a.courseId === c.id);
                const materialsCount = lectureMaterials.filter((m) => m.courseId === c.id).length;

                return (
                  <div
                    key={c.id}
                    className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-950/50 text-emerald-300 border border-emerald-800/50">
                          {c.code}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">{c.credits} Credits</span>
                      </div>

                      <h3 className="text-sm font-bold text-white mt-2.5 leading-snug">{c.title}</h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{c.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/70 flex items-center justify-between text-xs">
                      <span className="text-slate-400">{materialsCount} Lecture Slides</span>
                      <button
                        onClick={() => onNavigateTab('lectures')}
                        className="text-emerald-400 hover:text-emerald-300 font-semibold"
                      >
                        Open Notes →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Notices */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-semibold text-white">Recent Notices & Announcements</h2>
              <button
                onClick={() => onNavigateTab('notes')}
                className="text-xs text-sky-400 hover:text-sky-300 font-medium"
              >
                View All
              </button>
            </div>

            <div className="mt-3 divide-y divide-slate-800/60">
              {classNotes.slice(0, 3).map((note) => {
                const course = courses.find((c) => c.id === note.courseId);

                return (
                  <div key={note.id} className="py-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-sky-400">{course?.code}: {note.title}</span>
                      <span className="text-[10px] text-slate-500">{note.createdAt}</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">{note.content}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">By {note.facultyName}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Today's Schedule & 2-Way Message Prompt */}
        <div className="space-y-6">
          {/* Timetable highlights */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-semibold text-white">Weekly Class Schedule</h2>
              <button
                onClick={() => onNavigateTab('timetable')}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
              >
                Full Grid
              </button>
            </div>

            <div className="mt-3 space-y-2.5">
              {myTimetable.slice(0, 5).map((slot) => {
                const course = courses.find((c) => c.id === slot.courseId);

                return (
                  <div key={slot.id} className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/70">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-emerald-400">{slot.day}</span>
                      <span className="text-slate-400">{slot.startTime} - {slot.endTime}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-200 mt-1">{course?.code}: {course?.title}</p>
                    <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Room: {slot.room}</span>
                      <span className="text-slate-300">{slot.type}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Direct Support Card: Teacher & Admin */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-800/50">
            <MessagesSquare className="w-6 h-6 text-indigo-400 mb-2" />
            <h3 className="text-sm font-bold text-white">Direct Communication Desk</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Have doubts regarding lectures or administrative requests? You can directly chat with either your
              <strong className="text-indigo-300"> Course Teacher</strong> or the <strong className="text-blue-300">Administrator</strong>.
            </p>
            <button
              onClick={() => onNavigateTab('discussion')}
              className="mt-4 w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-600/20 transition text-center"
            >
              Open Messaging (Teacher / Admin) →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
