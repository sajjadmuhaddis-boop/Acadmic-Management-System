import React, { useState } from 'react';
import { useLms } from '../../context/LmsContext';
import { AttendanceRecord } from '../../types/lms';
import {
  CheckSquare,
  Calendar,
  Save,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  ShieldAlert,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';

export const TeacherAttendance: React.FC = () => {
  const {
    getCurrentFaculty,
    allocations,
    courses,
    students,
    attendance,
    saveAttendanceSheet,
  } = useLms();

  const currentFaculty = getCurrentFaculty();
  const myAllocations = allocations.filter((a) => a.facultyId === currentFaculty?.id);

  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    myAllocations[0]?.courseId || courses[0]?.id || ''
  );
  const [selectedSection, setSelectedSection] = useState<string>(
    myAllocations[0]?.section || 'A'
  );
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Student roster status map: { [studentId]: 'present' | 'absent' | 'late' | 'excused' }
  const [statusMap, setStatusMap] = useState<Record<string, 'present' | 'absent' | 'late' | 'excused'>>(() => {
    const existing = attendance.filter(
      (a) => a.courseId === selectedCourseId && a.section === selectedSection && a.date === selectedDate
    );
    const initial: Record<string, 'present' | 'absent' | 'late' | 'excused'> = {};
    students.forEach((s) => {
      const match = existing.find((e) => e.studentId === s.id);
      initial[s.id] = match ? match.status : 'present';
    });
    return initial;
  });

  const [remarksMap, setRemarksMap] = useState<Record<string, string>>(() => {
    const existing = attendance.filter(
      (a) => a.courseId === selectedCourseId && a.section === selectedSection && a.date === selectedDate
    );
    const initial: Record<string, string> = {};
    existing.forEach((e) => {
      if (e.remarks) initial[e.studentId] = e.remarks;
    });
    return initial;
  });

  // Load existing records when date or course changes
  const handleContextChange = (newCourseId: string, newSec: string, newDate: string) => {
    setSelectedCourseId(newCourseId);
    setSelectedSection(newSec);
    setSelectedDate(newDate);

    const existing = attendance.filter(
      (a) => a.courseId === newCourseId && a.section === newSec && a.date === newDate
    );
    const updatedStatus: Record<string, 'present' | 'absent' | 'late' | 'excused'> = {};
    const updatedRemarks: Record<string, string> = {};

    students.forEach((s) => {
      const match = existing.find((e) => e.studentId === s.id);
      updatedStatus[s.id] = match ? match.status : 'present';
      if (match?.remarks) updatedRemarks[s.id] = match.remarks;
    });

    setStatusMap(updatedStatus);
    setRemarksMap(updatedRemarks);
  };

  const setAllPresent = () => {
    const allP: Record<string, 'present' | 'absent' | 'late' | 'excused'> = {};
    students.forEach((s) => {
      allP[s.id] = 'present';
    });
    setStatusMap(allP);
  };

  const handleSave = () => {
    const records = students.map((s) => ({
      studentId: s.id,
      status: statusMap[s.id] || 'present',
      remarks: remarksMap[s.id] || '',
    }));
    saveAttendanceSheet(selectedCourseId, selectedSection, selectedDate, records);
  };

  // Metrics
  const totalCount = students.length;
  const presentCount = Object.values(statusMap).filter((s) => s === 'present').length;
  const absentCount = Object.values(statusMap).filter((s) => s === 'absent').length;
  const lateCount = Object.values(statusMap).filter((s) => s === 'late').length;
  const excusedCount = Object.values(statusMap).filter((s) => s === 'excused').length;
  const attendanceRate = totalCount > 0 ? Math.round(((presentCount + lateCount) / totalCount) * 100) : 0;

  // Past dates with marked records for this course & section
  const previousDates = Array.from(
    new Set(
      attendance
        .filter((a) => a.courseId === selectedCourseId && a.section === selectedSection)
        .map((a) => a.date)
    )
  ).sort().reverse();

  const activeCourse = courses.find((c) => c.id === selectedCourseId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-emerald-400" />
            Class Attendance Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Mark daily student attendance, log late arrivals, and record excused absences.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={setAllPresent}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
            Mark All Present
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-md shadow-emerald-600/20 transition-all"
          >
            <Save className="w-4 h-4" />
            Save Attendance
          </button>
        </div>
      </div>

      {/* Course & Date Selector Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Select Course</label>
          <select
            value={selectedCourseId}
            onChange={(e) => handleContextChange(e.target.value, selectedSection, selectedDate)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            {myAllocations.map((alloc) => {
              const c = courses.find((item) => item.id === alloc.courseId);
              return (
                <option key={alloc.id} value={alloc.courseId}>
                  {c?.code} - {c?.title} (Sec {alloc.section})
                </option>
              );
            })}
            {myAllocations.length === 0 &&
              courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.title}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Section</label>
          <select
            value={selectedSection}
            onChange={(e) => handleContextChange(selectedCourseId, e.target.value, selectedDate)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Lecture Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => handleContextChange(selectedCourseId, selectedSection, e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Attendance Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">Total Enrolled</span>
          <p className="text-xl font-bold text-white mt-1">{totalCount}</p>
        </div>
        <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/40">
          <span className="text-xs text-emerald-300">Present</span>
          <p className="text-xl font-bold text-emerald-400 mt-1">{presentCount}</p>
        </div>
        <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/40">
          <span className="text-xs text-rose-300">Absent</span>
          <p className="text-xl font-bold text-rose-400 mt-1">{absentCount}</p>
        </div>
        <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800/40">
          <span className="text-xs text-amber-300">Late</span>
          <p className="text-xl font-bold text-amber-400 mt-1">{lateCount}</p>
        </div>
        <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-800/40">
          <span className="text-xs text-blue-300">Turnout Rate</span>
          <p className="text-xl font-bold text-blue-400 mt-1">{attendanceRate}%</p>
        </div>
      </div>

      {/* Student Attendance Roster Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <h3 className="text-sm font-bold text-white">
              Student Roster · {activeCourse?.code} (Section {selectedSection})
            </h3>
            <p className="text-xs text-slate-400">Date: {selectedDate}</p>
          </div>
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-full">
            {presentCount} / {totalCount} Students Present
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-950/80 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Student Info</th>
                <th className="py-3 px-4 font-semibold">Roll Number</th>
                <th className="py-3 px-4 font-semibold text-center">Attendance Status</th>
                <th className="py-3 px-4 font-semibold">Remarks / Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {students.map((student) => {
                const currentStatus = statusMap[student.id] || 'present';
                const currentRemark = remarksMap[student.id] || '';

                return (
                  <tr key={student.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-800 shrink-0">
                          {student.avatar ? (
                            <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-white text-xs">
                              {student.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-white leading-tight">{student.name}</p>
                          <span className="text-[11px] text-slate-400">{student.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono text-xs font-medium text-slate-300">{student.rollNo}</span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setStatusMap((prev) => ({ ...prev, [student.id]: 'present' }))}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                            currentStatus === 'present'
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          P
                          <span className="hidden sm:inline text-[10px] font-normal">Present</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setStatusMap((prev) => ({ ...prev, [student.id]: 'absent' }))}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                            currentStatus === 'absent'
                              ? 'bg-rose-600 text-white shadow-sm'
                              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          A
                          <span className="hidden sm:inline text-[10px] font-normal">Absent</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setStatusMap((prev) => ({ ...prev, [student.id]: 'late' }))}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                            currentStatus === 'late'
                              ? 'bg-amber-600 text-white shadow-sm'
                              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          L
                          <span className="hidden sm:inline text-[10px] font-normal">Late</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setStatusMap((prev) => ({ ...prev, [student.id]: 'excused' }))}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                            currentStatus === 'excused'
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          E
                          <span className="hidden sm:inline text-[10px] font-normal">Excused</span>
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <input
                        type="text"
                        value={currentRemark}
                        onChange={(e) => setRemarksMap((prev) => ({ ...prev, [student.id]: e.target.value }))}
                        placeholder="Optional remarks..."
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/40">
          <p className="text-xs text-slate-400">
            Click 'Save Attendance' to record today's sheet into the persistent database.
          </p>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all"
          >
            <Save className="w-4 h-4" />
            Save Attendance Sheet
          </button>
        </div>
      </div>

      {/* Historical Record Logs */}
      {previousDates.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white mb-3">Previous Attendance Dates Recorded</h3>
          <div className="flex flex-wrap gap-2">
            {previousDates.map((d) => (
              <button
                key={d}
                onClick={() => handleContextChange(selectedCourseId, selectedSection, d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                  d === selectedDate
                    ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
