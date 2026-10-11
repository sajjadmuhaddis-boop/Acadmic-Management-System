import React, { useState } from 'react';
import { useLms } from '../../context/LmsContext';
import { BellRing, Filter, AlertTriangle, Info, Calendar } from 'lucide-react';

export const StudentClassNotes: React.FC = () => {
  const { getCurrentStudent, classNotes, courses, allocations } = useLms();
  const currentStudent = getCurrentStudent();

  const myAllocations = allocations.filter((a) => a.section === currentStudent?.section);
  const myCourseIds = new Set(myAllocations.map((a) => a.courseId));
  const myCourses = courses.filter((c) => myCourseIds.has(c.id));

  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');

  const filteredNotes = classNotes.filter((note) => {
    const isEnrolled = myCourseIds.has(note.courseId);
    if (!isEnrolled) return false;
    if (selectedCourseFilter === 'all') return true;
    return note.courseId === selectedCourseFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <BellRing className="w-6 h-6 text-sky-400" />
            Class Notes & Instructor Notices
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Important announcements, exam guidelines, and schedule changes broadcasted by faculty.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-sky-500 cursor-pointer"
          >
            <option value="all">All Enrolled Courses</option>
            {myCourses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} - {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNotes.map((note) => {
          const course = courses.find((c) => c.id === note.courseId);

          const priorityBadge = {
            urgent: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
            important: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
            normal: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
          }[note.priority];

          return (
            <div
              key={note.id}
              className={`bg-slate-900 border rounded-xl p-5 flex flex-col justify-between transition-all ${
                note.priority === 'urgent'
                  ? 'border-rose-700/50 bg-gradient-to-br from-slate-900 to-rose-950/20'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-sky-950/60 text-sky-300 border border-sky-800/60">
                      {course?.code}
                    </span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border capitalize ${priorityBadge}`}>
                      {note.priority}
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    {note.createdAt}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mt-3 leading-snug">{note.title}</h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed whitespace-pre-line">
                  {note.content}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="font-medium text-slate-300">Instructor: {note.facultyName}</span>
                <span>Section {note.section}</span>
              </div>
            </div>
          );
        })}

        {filteredNotes.length === 0 && (
          <div className="col-span-full py-12 text-center bg-slate-900 border border-slate-800 rounded-xl">
            <BellRing className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="text-sm text-slate-300 font-medium">No class notices</p>
            <p className="text-xs text-slate-500 mt-1">There are no new notices for your classes.</p>
          </div>
        )}
      </div>
    </div>
  );
};
