import React, { useState, useEffect } from 'react';
import { LmsProvider, useLms } from './context/LmsContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { ToastContainer } from './components/common/Toast';

// Admin Components
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ManageCourses } from './components/admin/ManageCourses';
import { ManageSessions } from './components/admin/ManageSessions';
import { ManageDepartments } from './components/admin/ManageDepartments';
import { ManageTimetable } from './components/admin/ManageTimetable';
import { ManageFaculty } from './components/admin/ManageFaculty';
import { ManageCourseAllocation } from './components/admin/ManageCourseAllocation';

// Teacher Components
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { TeacherTimetable } from './components/teacher/TeacherTimetable';
import { TeacherAttendance } from './components/teacher/TeacherAttendance';
import { TeacherAssignments } from './components/teacher/TeacherAssignments';
import { TeacherQuizzes } from './components/teacher/TeacherQuizzes';
import { TeacherLectureMaterial } from './components/teacher/TeacherLectureMaterial';
import { TeacherClassNotes } from './components/teacher/TeacherClassNotes';
import { TeacherResults } from './components/teacher/TeacherResults';

// Student Components
import { StudentDashboard } from './components/student/StudentDashboard';
import { StudentTimetable } from './components/student/StudentTimetable';
import { StudentAttendance } from './components/student/StudentAttendance';
import { StudentAssignments } from './components/student/StudentAssignments';
import { StudentQuizzes } from './components/student/StudentQuizzes';
import { StudentLectureMaterial } from './components/student/StudentLectureMaterial';
import { StudentClassNotes } from './components/student/StudentClassNotes';
import { StudentDiscussion } from './components/student/StudentDiscussion';

const MainShell: React.FC = () => {
  const { activeRole } = useLms();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // When role changes, default back to 'dashboard'
  useEffect(() => {
    setCurrentTab('dashboard');
  }, [activeRole]);

  const renderActiveView = () => {
    // 1. Administrator Interface
    if (activeRole === 'admin') {
      switch (currentTab) {
        case 'dashboard':
          return <AdminDashboard onNavigateTab={setCurrentTab} />;
        case 'courses':
          return <ManageCourses />;
        case 'sessions':
          return <ManageSessions />;
        case 'departments':
          return <ManageDepartments />;
        case 'timetable':
          return <ManageTimetable />;
        case 'faculty':
          return <ManageFaculty />;
        case 'allocations':
          return <ManageCourseAllocation />;
        default:
          return <AdminDashboard onNavigateTab={setCurrentTab} />;
      }
    }

    // 2. Teacher Interface
    if (activeRole === 'teacher') {
      switch (currentTab) {
        case 'dashboard':
          return <TeacherDashboard onNavigateTab={setCurrentTab} />;
        case 'timetable':
          return <TeacherTimetable />;
        case 'attendance':
          return <TeacherAttendance />;
        case 'assignments':
          return <TeacherAssignments />;
        case 'quizzes':
          return <TeacherQuizzes />;
        case 'lectures':
          return <TeacherLectureMaterial />;
        case 'notes':
          return <TeacherClassNotes />;
        case 'results':
          return <TeacherResults />;
        default:
          return <TeacherDashboard onNavigateTab={setCurrentTab} />;
      }
    }

    // 3. Student Interface
    if (activeRole === 'student') {
      switch (currentTab) {
        case 'dashboard':
          return <StudentDashboard onNavigateTab={setCurrentTab} />;
        case 'timetable':
          return <StudentTimetable />;
        case 'attendance':
          return <StudentAttendance />;
        case 'assignments':
          return <StudentAssignments />;
        case 'quizzes':
          return <StudentQuizzes />;
        case 'lectures':
          return <StudentLectureMaterial />;
        case 'notes':
          return <StudentClassNotes />;
        case 'discussion':
          return <StudentDiscussion />;
        default:
          return <StudentDashboard onNavigateTab={setCurrentTab} />;
      }
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30">
      {/* Top Navigation */}
      <Navbar onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)} />

      {/* Main Workspace */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Role-Specific Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Central Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <LmsProvider>
      <MainShell />
    </LmsProvider>
  );
}
