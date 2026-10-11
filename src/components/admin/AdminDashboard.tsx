import React from 'react';
import { useLms } from '../../context/LmsContext';
import {
  BookOpen,
  Users,
  Building2,
  Calendar,
  Clock,
  Layers,
  Plus,
  ArrowRight,
  Sparkles,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigateTab: (tabId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab }) => {
  const {
    courses,
    facultyList,
    students,
    departments,
    sessions,
    timetable,
    allocations,
    getCurrentSession,
  } = useLms();

  const currentSession = getCurrentSession();
  const activeSessionCoursesCount = allocations.filter((a) => a.sessionId === currentSession?.id).length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border border-blue-800/40 rounded-2xl p-6 sm:p-8">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            Institutional Administration Command Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Academic Operations & Governance
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Manage degree curricula, academic terms, institutional departments, weekly timetables,
            faculty appointments, and semester course allocations across all departments.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab('courses')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add New Course
            </button>
            <button
              onClick={() => onNavigateTab('allocations')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-all"
            >
              <Layers className="w-4 h-4" />
              Manage Course Allocation
            </button>
            <button
              onClick={() => onNavigateTab('timetable')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-all"
            >
              <Clock className="w-4 h-4" />
              View Timetable Schedule
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div
          onClick={() => onNavigateTab('courses')}
          className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 p-4 rounded-xl cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Courses</span>
            <BookOpen className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{courses.length}</div>
          <span className="text-[11px] text-blue-400/90 font-medium">Curricula catalog</span>
        </div>

        <div
          onClick={() => onNavigateTab('faculty')}
          className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 p-4 rounded-xl cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Faculty Members</span>
            <Users className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{facultyList.length}</div>
          <span className="text-[11px] text-indigo-400/90 font-medium">Professors & Staff</span>
        </div>

        <div
          onClick={() => onNavigateTab('departments')}
          className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 p-4 rounded-xl cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Departments</span>
            <Building2 className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{departments.length}</div>
          <span className="text-[11px] text-amber-400/90 font-medium">Academic divisions</span>
        </div>

        <div
          onClick={() => onNavigateTab('sessions')}
          className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 p-4 rounded-xl cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Active Session</span>
            <Calendar className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 text-lg font-bold text-white truncate">{currentSession?.name || 'Fall 2025'}</div>
          <span className="text-[11px] text-emerald-400/90 font-medium">Status: Active</span>
        </div>

        <div
          onClick={() => onNavigateTab('allocations')}
          className="bg-slate-900 border border-slate-800 hover:border-purple-500/50 p-4 rounded-xl cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Course Allocations</span>
            <Layers className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{allocations.length}</div>
          <span className="text-[11px] text-purple-400/90 font-medium">Faculty assignments</span>
        </div>

        <div
          onClick={() => onNavigateTab('timetable')}
          className="bg-slate-900 border border-slate-800 hover:border-sky-500/50 p-4 rounded-xl cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Timetable Slots</span>
            <Clock className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{timetable.length}</div>
          <span className="text-[11px] text-sky-400/90 font-medium">Scheduled periods</span>
        </div>
      </div>

      {/* Main Administrative Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Course Allocations Overview & Quick Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-base font-semibold text-white">Active Course Allocations</h2>
                <p className="text-xs text-slate-400">Courses currently assigned to faculty for {currentSession?.name}</p>
              </div>
              <button
                onClick={() => onNavigateTab('allocations')}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1"
              >
                Manage All
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 divide-y divide-slate-800/60">
              {allocations.map((alloc) => {
                const course = courses.find((c) => c.id === alloc.courseId);
                const faculty = facultyList.find((f) => f.id === alloc.facultyId);
                const dept = departments.find((d) => d.id === course?.departmentId);

                return (
                  <div key={alloc.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-blue-400">{course?.code}</span>
                        <span className="text-sm font-medium text-slate-200 truncate">{course?.title}</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>Sec {alloc.section}</span>
                        <span>·</span>
                        <span>Sem {alloc.semester}</span>
                        <span>·</span>
                        <span className="text-slate-300">{dept?.code} Dept</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-medium text-slate-200">{faculty?.name || 'Unassigned'}</p>
                      <p className="text-[11px] text-slate-400">{faculty?.designation || '-'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Departments Summary */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-base font-semibold text-white">Academic Departments</h2>
                <p className="text-xs text-slate-400">Heads of department & office faculties</p>
              </div>
              <button
                onClick={() => onNavigateTab('departments')}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1"
              >
                View Details
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {departments.map((dept) => {
                const deptCourses = courses.filter((c) => c.departmentId === dept.id).length;
                const deptFaculty = facultyList.filter((f) => f.departmentId === dept.id).length;

                return (
                  <div key={dept.id} className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-900/40 text-blue-300 border border-blue-800/50">
                        {dept.code}
                      </span>
                      <span className="text-xs text-slate-400">{deptFaculty} Faculty</span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-200 mt-2 truncate">{dept.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">HOD: <span className="text-slate-300">{dept.hod}</span></p>
                    <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{deptCourses} Active Courses</span>
                      <span className="truncate max-w-[150px]">{dept.building}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Timetable Snapshot & Registered Students */}
        <div className="space-y-6">
          {/* Today's Timetable Snapshot */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-semibold text-white">Weekly Schedule Highlights</h2>
              <button
                onClick={() => onNavigateTab('timetable')}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium"
              >
                Full Grid
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {timetable.slice(0, 5).map((slot) => {
                const course = courses.find((c) => c.id === slot.courseId);
                const faculty = facultyList.find((f) => f.id === slot.facultyId);

                return (
                  <div key={slot.id} className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/70">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-sky-400">{slot.day}</span>
                      <span className="text-slate-400">{slot.startTime} - {slot.endTime}</span>
                    </div>
                    <p className="text-xs font-medium text-slate-200 mt-1">{course?.code} · {course?.title}</p>
                    <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{slot.room} (Sec {slot.section})</span>
                      <span className="text-slate-300 truncate max-w-[120px]">{faculty?.name}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Student Body Roster Snapshot */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-base font-semibold text-white">Student Enrollment</h2>
                <p className="text-xs text-slate-400">{students.length} students enrolled in batch</p>
              </div>
              <GraduationCap className="w-4 h-4 text-emerald-400" />
            </div>

            <div className="mt-3 divide-y divide-slate-800/50">
              {students.map((stu) => (
                <div key={stu.id} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {stu.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-200">{stu.name}</p>
                      <p className="text-[10px] text-slate-400">{stu.rollNo} · Sec {stu.section}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-emerald-400">CGPA {stu.cgpa.toFixed(2)}</span>
                    <p className="text-[10px] text-slate-400">Sem {stu.semester}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
