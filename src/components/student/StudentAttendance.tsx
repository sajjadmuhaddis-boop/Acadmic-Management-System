import React, { useState } from 'react';
import { useLms } from '../../context/LmsContext';
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ShieldCheck,
  Calendar,
  Filter,
} from 'lucide-react';

export const StudentAttendance: React.FC = () => {
  const { getCurrentStudent, attendance, courses, allocations } = useLms();
  const currentStudent = getCurrentStudent();

  // Get enrolled courses for student's section
  const myAllocations = allocations.filter((a) => a.section === currentStudent?.section);
  const myCourseIds = new Set(myAllocations.map((a) => a.courseId));
  const myCourses = courses.filter((c) => myCourseIds.has(c.id));

  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');

  // Student's individual attendance records
  const myRecords = attendance
    .filter((a) => a.studentId === currentStudent?.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  // Overall attendance statistics
  const totalClassesOverall = myRecords.length;
  const attendedOverall = myRecords.filter((r) => r.status === 'present' || r.status === 'late').length;
  const absentOverall = myRecords.filter((r) => r.status === 'absent').length;
  const lateOverall = myRecords.filter((r) => r.status === 'late').length;
  const overallPercentage = totalClassesOverall > 0 ? Math.round((attendedOverall / totalClassesOverall) * 100) : 100;

  // Course-by-course calculations
  const courseSummaries = myCourses.map((c) => {
    const courseRecords = myRecords.filter((r) => r.courseId === c.id);
    const total = courseRecords.length;
    const present = courseRecords.filter((r) => r.status === 'present').length;
    const late = courseRecords.filter((r) => r.status === 'late').length;
    const absent = courseRecords.filter((r) => r.status === 'absent').length;
    const excused = courseRecords.filter((r) => r.status === 'excused').length;
    const attended = present + late;
    const percentage = total > 0 ? Math.round((attended / total) * 100) : 100;

    return {
      course: c,
      total,
      present,
      late,
      absent,
      excused,
      attended,
      percentage,
      isShort: percentage < 75 && total > 0,
    };
  });

  const filteredRecords = myRecords.filter((r) => {
    if (selectedCourseFilter === 'all') return true;
    return r.courseId === selectedCourseFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-emerald-400" />
            Attendance Record & Eligibility
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Student: {currentStudent?.name} ({currentStudent?.rollNo}) · Section {currentStudent?.section}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 ${
              overallPercentage >= 75
                ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300'
                : 'bg-rose-950/60 border-rose-700/60 text-rose-300'
            }`}
          >
            {overallPercentage >= 75 ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            )}
            {overallPercentage >= 75 ? 'Exam Eligible (>= 75%)' : 'Attendance Short Warning (< 75%)'}
          </span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">Total Lectures Held</span>
          <p className="text-2xl font-bold text-white mt-1">{totalClassesOverall}</p>
          <span className="text-[11px] text-slate-500">Across enrolled subjects</span>
        </div>

        <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40">
          <span className="text-xs text-emerald-300">Classes Attended</span>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{attendedOverall}</p>
          <span className="text-[11px] text-emerald-500 font-medium">Present & Late</span>
        </div>

        <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/40">
          <span className="text-xs text-rose-300">Absences Logged</span>
          <p className="text-2xl font-bold text-rose-400 mt-1">{absentOverall}</p>
          <span className="text-[11px] text-rose-500">Unexcused</span>
        </div>

        <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-800/40">
          <span className="text-xs text-blue-300">Overall Percentage</span>
          <p className="text-2xl font-bold text-blue-400 mt-1">{overallPercentage}%</p>
          <span className="text-[11px] text-blue-500 font-medium">Cumulative standing</span>
        </div>
      </div>

      {/* Course-Wise Attendance Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-base font-bold text-white mb-4">Course-Wise Attendance Breakdown</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courseSummaries.map((summary) => (
            <div
              key={summary.course.id}
              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-200">
                    {summary.course.code}
                  </span>
                  <h4 className="text-sm font-bold text-white mt-1.5">{summary.course.title}</h4>
                </div>
                <div className="text-right">
                  <span
                    className={`text-lg font-bold ${
                      summary.percentage >= 75
                        ? 'text-emerald-400'
                        : summary.percentage >= 65
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {summary.percentage}%
                  </span>
                  <p className="text-[10px] text-slate-400">
                    {summary.attended} / {summary.total} Attended
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    summary.percentage >= 75
                      ? 'bg-emerald-500'
                      : summary.percentage >= 65
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(summary.percentage, 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span>Present: <strong className="text-slate-200">{summary.present}</strong></span>
                <span>Late: <strong className="text-amber-400">{summary.late}</strong></span>
                <span>Absent: <strong className="text-rose-400">{summary.absent}</strong></span>
                <span>Excused: <strong className="text-blue-400">{summary.excused}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Date-by-Date Attendance Timeline Log */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/60">
          <div>
            <h3 className="text-base font-bold text-white">Date-Wise Attendance History Log</h3>
            <p className="text-xs text-slate-400">Detailed register of all recorded lecture attendances</p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">All Subjects</option>
              {myCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-950/80 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Lecture Date</th>
                <th className="py-3 px-4 font-semibold">Course Code & Name</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold">Instructor Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredRecords.map((rec) => {
                const course = courses.find((c) => c.id === rec.courseId);

                const statusTag = {
                  present: {
                    label: 'Present',
                    icon: CheckCircle2,
                    style: 'bg-emerald-950/60 border-emerald-800/60 text-emerald-300',
                  },
                  absent: {
                    label: 'Absent',
                    icon: XCircle,
                    style: 'bg-rose-950/60 border-rose-800/60 text-rose-300',
                  },
                  late: {
                    label: 'Late Arrival',
                    icon: Clock,
                    style: 'bg-amber-950/60 border-amber-800/60 text-amber-300',
                  },
                  excused: {
                    label: 'Excused Leave',
                    icon: ShieldCheck,
                    style: 'bg-blue-950/60 border-blue-800/60 text-blue-300',
                  },
                }[rec.status];

                const Icon = statusTag.icon;

                return (
                  <tr key={rec.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-white">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{rec.date}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-200">{course?.code}:</span>{' '}
                      <span className="text-slate-400">{course?.title}</span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold border ${statusTag.style}`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {statusTag.label}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 text-xs">
                      {rec.remarks || <span className="text-slate-600 italic">None</span>}
                    </td>
                  </tr>
                );
              })}

              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-500">
                    No attendance records logged for the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
