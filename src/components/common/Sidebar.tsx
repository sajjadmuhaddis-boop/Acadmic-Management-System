import React from 'react';
import { useLms } from '../../context/LmsContext';
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  Building2,
  Clock,
  Users,
  Layers,
  CheckSquare,
  FileText,
  HelpCircle,
  FolderDown,
  BellRing,
  Award,
  MessagesSquare,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tabId: string) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  mobileOpen,
  onCloseMobile,
}) => {
  const { activeRole } = useLms();

  // Navigation Items per Portal
  const adminNav: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'courses', label: 'Manage Courses', icon: BookOpen },
    { id: 'sessions', label: 'Manage Sessions', icon: Calendar },
    { id: 'departments', label: 'Manage Departments', icon: Building2 },
    { id: 'timetable', label: 'Manage Timetable', icon: Clock },
    { id: 'faculty', label: 'Manage Faculty', icon: Users },
    { id: 'allocations', label: 'Course Allocation', icon: Layers },
  ];

  const teacherNav: NavItem[] = [
    { id: 'dashboard', label: 'Classes & Overview', icon: LayoutDashboard },
    { id: 'timetable', label: 'Assigned Timetable', icon: Clock },
    { id: 'attendance', label: 'Student Attendance', icon: CheckSquare },
    { id: 'assignments', label: 'Assignments & Submissions', icon: FileText },
    { id: 'quizzes', label: 'Quizzes & Questions', icon: HelpCircle },
    { id: 'lectures', label: 'Lecturing Material', icon: FolderDown },
    { id: 'notes', label: 'Class Notes & Notices', icon: BellRing },
    { id: 'results', label: 'Results & Gradebook', icon: Award },
  ];

  const studentNav: NavItem[] = [
    { id: 'dashboard', label: 'Student Dashboard', icon: LayoutDashboard },
    { id: 'timetable', label: 'My Timetable', icon: Clock },
    { id: 'attendance', label: 'My Attendance', icon: CheckSquare },
    { id: 'assignments', label: 'Assignments', icon: FileText },
    { id: 'quizzes', label: 'Quizzes & Online Tests', icon: HelpCircle },
    { id: 'lectures', label: 'Lecture Material', icon: FolderDown },
    { id: 'notes', label: 'Class Notes', icon: BellRing },
    { id: 'discussion', label: 'Discussion & Support', icon: MessagesSquare, badge: 'Teacher & Admin' },
  ];

  const activeNavItems =
    activeRole === 'admin' ? adminNav : activeRole === 'teacher' ? teacherNav : studentNav;

  const roleTheme = {
    admin: {
      accent: 'border-blue-500 text-blue-400 bg-blue-500/10',
      badge: 'Admin Panel',
      subtext: 'Central Institutional Control',
    },
    teacher: {
      accent: 'border-indigo-500 text-indigo-400 bg-indigo-500/10',
      badge: 'Faculty Portal',
      subtext: 'Classroom & Academic Delivery',
    },
    student: {
      accent: 'border-emerald-500 text-emerald-400 bg-emerald-500/10',
      badge: 'Student Portal',
      subtext: 'Academic Learning & Tasks',
    },
  }[activeRole];

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:sticky top-16 z-40 h-[calc(100vh-4rem)] w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Role Header Banner */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Active Interface
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                activeRole === 'admin'
                  ? 'bg-blue-900/40 border-blue-700/50 text-blue-300'
                  : activeRole === 'teacher'
                  ? 'bg-indigo-900/40 border-indigo-700/50 text-indigo-300'
                  : 'bg-emerald-900/40 border-emerald-700/50 text-emerald-300'
              }`}
            >
              {roleTheme.badge}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 truncate">{roleTheme.subtext}</p>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin">
          {activeNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? `${roleTheme.accent} font-semibold border-l-2`
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-current' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-nowrap">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer info badge */}
        <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400">
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/70">
            <div className="flex items-center justify-between text-slate-300 font-medium">
              <span>System Status</span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Operational
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Multi-Portal Academic Sync</p>
          </div>
        </div>
      </aside>
    </>
  );
};
