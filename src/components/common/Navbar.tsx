import React from 'react';
import { useLms } from '../../context/LmsContext';
import {
  ShieldCheck,
  GraduationCap,
  BookOpen,
  RotateCcw,
  Sparkles,
  School,
  ChevronDown,
} from 'lucide-react';
import { UserRole } from '../../types/lms';

interface NavbarProps {
  onToggleMobileSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileSidebar }) => {
  const {
    activeRole,
    setActiveRole,
    activeFacultyId,
    setActiveFacultyId,
    activeStudentId,
    setActiveStudentId,
    facultyList,
    students,
    sessions,
    activeSessionId,
    setActiveSessionId,
    resetToDefaultData,
    getCurrentFaculty,
    getCurrentStudent,
  } = useLms();

  const currentFaculty = getCurrentFaculty();
  const currentStudent = getCurrentStudent();
  const currentSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            {onToggleMobileSidebar && (
              <button
                onClick={onToggleMobileSidebar}
                className="lg:hidden p-2 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition"
                aria-label="Toggle Navigation"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <School className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-base tracking-tight text-white">EduPulse</span>
                  <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    LMS
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">Academic Management System</p>
              </div>
            </div>
          </div>

          {/* Center: 3 Role Selector Tabs */}
          <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800/80 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveRole('admin')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeRole === 'admin'
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span className="hidden md:inline">Administrator</span>
              <span className="md:hidden">Admin</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveRole('teacher')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeRole === 'teacher'
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden md:inline">Teacher</span>
              <span className="md:hidden">Faculty</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveRole('student')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeRole === 'student'
                  ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student</span>
            </button>
          </div>

          {/* Right: Active Profile Persona & Quick Session / Reset */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Academic Session Selector */}
            <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-300 bg-slate-800/60 border border-slate-700/60 px-2.5 py-1.5 rounded-lg">
              <span className="text-slate-400">Session:</span>
              <select
                value={activeSessionId}
                onChange={(e) => setActiveSessionId(e.target.value)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
              >
                {sessions.map((s) => (
                  <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                    {s.name} {s.isCurrent ? '(Active)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Persona switcher if teacher */}
            {activeRole === 'teacher' && (
              <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/70 rounded-lg px-2.5 py-1 text-xs">
                <div className="w-6 h-6 rounded-full overflow-hidden bg-indigo-500 shrink-0">
                  {currentFaculty?.avatar ? (
                    <img src={currentFaculty.avatar} alt={currentFaculty.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-white text-[10px]">
                      {currentFaculty?.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <select
                    value={activeFacultyId}
                    onChange={(e) => setActiveFacultyId(e.target.value)}
                    className="bg-transparent font-medium text-slate-200 focus:outline-none cursor-pointer text-xs pr-1"
                  >
                    {facultyList.map((f) => (
                      <option key={f.id} value={f.id} className="bg-slate-900 text-white">
                        {f.name} ({f.designation})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Persona switcher if student */}
            {activeRole === 'student' && (
              <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/70 rounded-lg px-2.5 py-1 text-xs">
                <div className="w-6 h-6 rounded-full overflow-hidden bg-emerald-500 shrink-0">
                  {currentStudent?.avatar ? (
                    <img src={currentStudent.avatar} alt={currentStudent.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-white text-[10px]">
                      {currentStudent?.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <select
                    value={activeStudentId}
                    onChange={(e) => setActiveStudentId(e.target.value)}
                    className="bg-transparent font-medium text-slate-200 focus:outline-none cursor-pointer text-xs pr-1"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                        {s.name} ({s.rollNo})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Admin Profile */}
            {activeRole === 'admin' && (
              <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-blue-950/40 border border-blue-800/40 text-blue-200 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-medium">Office of Registrar & Dean</span>
              </div>
            )}

            {/* Reset data helper button */}
            <button
              onClick={resetToDefaultData}
              title="Reset Demo Data"
              className="p-2 text-slate-400 hover:text-amber-300 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
