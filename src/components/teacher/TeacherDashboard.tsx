import React from 'react';
import { useLms } from '../../context/LmsContext';
import {
  BookOpen,
  Clock,
  CheckSquare,
  FileText,
  HelpCircle,
  FolderDown,
  Award,
  Users,
  Calendar,
  ArrowRight,
  Plus,
} from 'lucide-react';

interface TeacherDashboardProps {
  onNavigateTab: (tabId: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onNavigateTab }) => {
  const {
    getCurrentFaculty,
    allocations,
    courses,
    timetable,
    assignments,
    submissions,
    quizzes,
    attendance,
    students,
  } = useLms();

  const currentFaculty = getCurrentFaculty();
  const myAllocations = allocations.filter((a) => a.facultyId === currentFaculty?.id);
  const myTimetable = timetable.filter((t) => t.facultyId === currentFaculty?.id);
  const myAssignments = assignments.filter((a) => a.facultyId === currentFaculty?.id);
  const myQuizzes = quizzes.filter((q) => q.facultyId === currentFaculty?.id);

  // Submissions for my assignments needing grading
  const myAssignmentIds = new Set(myAssignments.map((a) => a.id));
  const pendingSubmissions = submissions.filter(
    (s) => myAssignmentIds.has(s.assignmentId) && s.status === 'submitted'
  );

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900 border border-indigo-800/40 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs font-semibold mb-3">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              Faculty Academic Console
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Welcome back, {currentFaculty?.name}
            </h1>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              {currentFaculty?.designation} · {currentFaculty?.officeRoom}. You have{' '}
              <span className="text-indigo-300 font-semibold">{myAllocations.length} courses allocated</span> this
              semester with <span className="text-indigo-300 font-semibold">{myTimetable.length} scheduled lectures</span> per week.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigateTab('attendance')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
              >
                <CheckSquare className="w-4 h-4" />
                Mark Today's Attendance
              </button>
              <button
                onClick={() => onNavigateTab('assignments')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-all"
              >
                <FileText className="w-4 h-4" />
                Grade Submissions ({pendingSubmissions.length} pending)
              </button>
              <button
                onClick={() => onNavigateTab('quizzes')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-all"
              >
                <HelpCircle className="w-4 h-4" />
                Create Quiz
              </button>
            </div>
          </div>

          <div className="hidden lg:block shrink-0">
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-indigo-500/40 shadow-xl">
              {currentFaculty?.avatar ? (
                <img
                  src={currentFaculty.avatar}
                  alt={currentFaculty.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-indigo-800 flex items-center justify-center text-white text-2xl font-bold">
                  {currentFaculty?.name.charAt(0)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigateTab('timetable')}
          className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 p-4 rounded-xl cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Weekly Classes</span>
            <Clock className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{myTimetable.length}</div>
          <span className="text-[11px] text-indigo-400/90 font-medium">Scheduled periods</span>
        </div>

        <div
          onClick={() => onNavigateTab('attendance')}
          className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 p-4 rounded-xl cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Enrolled Students</span>
            <Users className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{students.length}</div>
          <span className="text-[11px] text-emerald-400/90 font-medium">Active roster</span>
        </div>

        <div
          onClick={() => onNavigateTab('assignments')}
          className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 p-4 rounded-xl cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Assignments</span>
            <FileText className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{myAssignments.length}</div>
          <span className="text-[11px] text-amber-400/90 font-medium">
            {pendingSubmissions.length} need grading
          </span>
        </div>

        <div
          onClick={() => onNavigateTab('quizzes')}
          className="bg-slate-900 border border-slate-800 hover:border-purple-500/50 p-4 rounded-xl cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Active Quizzes</span>
            <HelpCircle className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{myQuizzes.length}</div>
          <span className="text-[11px] text-purple-400/90 font-medium">Online evaluations</span>
        </div>
      </div>

      {/* Main Grid: My Allocated Classes & Upcoming Lectures */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Allocated Courses / Classes */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-base font-semibold text-white">My Assigned Classes & Courses</h2>
                <p className="text-xs text-slate-400">Courses currently allocated to you for teaching</p>
              </div>
              <button
                onClick={() => onNavigateTab('attendance')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1"
              >
                Mark Attendance
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myAllocations.map((alloc) => {
                const course = courses.find((c) => c.id === alloc.courseId);
                const classTimetable = myTimetable.filter(
                  (t) => t.courseId === alloc.courseId && t.section === alloc.section
                );

                return (
                  <div
                    key={alloc.id}
                    className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-indigo-500/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-950/50 text-indigo-300 border border-indigo-800/50">
                          {course?.code}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          Sec {alloc.section} · Sem {alloc.semester}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-white mt-2.5 leading-snug">
                        {course?.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {course?.description}
                      </p>

                      <div className="mt-3 pt-3 border-t border-slate-800/70 space-y-1 text-xs text-slate-400">
                        <div className="flex items-center justify-between">
                          <span>Weekly Slots:</span>
                          <span className="text-slate-200 font-medium">{classTimetable.length} Sessions</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Credits:</span>
                          <span className="text-slate-200 font-medium">{course?.credits} Cr. Hrs</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <button
                        onClick={() => onNavigateTab('attendance')}
                        className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                      >
                        Take Attendance →
                      </button>
                      <button
                        onClick={() => onNavigateTab('results')}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                      >
                        Gradebook
                      </button>
                    </div>
                  </div>
                );
              })}

              {myAllocations.length === 0 && (
                <div className="col-span-full py-8 text-center text-slate-500 text-xs">
                  No courses allocated to your profile in this session. Ask administrator to allocate courses.
                </div>
              )}
            </div>
          </div>

          {/* Quick Shortcuts to Teacher Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => onNavigateTab('lectures')}
              className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-left transition group"
            >
              <FolderDown className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform mb-2" />
              <p className="text-xs font-bold text-white">Lecture Material</p>
              <span className="text-[11px] text-slate-400">Upload slides & notes</span>
            </button>

            <button
              onClick={() => onNavigateTab('notes')}
              className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-left transition group"
            >
              <FileText className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform mb-2" />
              <p className="text-xs font-bold text-white">Class Notices</p>
              <span className="text-[11px] text-slate-400">Post announcements</span>
            </button>

            <button
              onClick={() => onNavigateTab('quizzes')}
              className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-left transition group"
            >
              <HelpCircle className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform mb-2" />
              <p className="text-xs font-bold text-white">Online Quizzes</p>
              <span className="text-[11px] text-slate-400">MCQ assessments</span>
            </button>

            <button
              onClick={() => onNavigateTab('results')}
              className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-left transition group"
            >
              <Award className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform mb-2" />
              <p className="text-xs font-bold text-white">Results Sheet</p>
              <span className="text-[11px] text-slate-400">GPA calculation</span>
            </button>
          </div>
        </div>

        {/* Right Column: Instructor Weekly Timetable Schedule */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-semibold text-white">My Weekly Schedule</h2>
              <button
                onClick={() => onNavigateTab('timetable')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Full Timetable
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {myTimetable.map((slot) => {
                const course = courses.find((c) => c.id === slot.courseId);

                return (
                  <div key={slot.id} className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-indigo-400">{slot.day}</span>
                      <span className="text-slate-400">{slot.startTime} - {slot.endTime}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-200 mt-1">
                      {course?.code}: {course?.title}
                    </p>
                    <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Venue: {slot.room}</span>
                      <span className="font-medium text-slate-300">Sec {slot.section} ({slot.type})</span>
                    </div>
                  </div>
                );
              })}

              {myTimetable.length === 0 && (
                <p className="py-6 text-center text-xs text-slate-500">
                  No timetable slots scheduled yet for your profile.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
