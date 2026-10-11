import React, { useState } from 'react';
import { useLms } from '../../context/LmsContext';
import { Clock, Calendar, MapPin, Users, BookOpen } from 'lucide-react';
import { TimetableSlot } from '../../types/lms';

export const StudentTimetable: React.FC = () => {
  const { getCurrentStudent, timetable, courses, facultyList } = useLms();
  const currentStudent = getCurrentStudent();

  const days: TimetableSlot['day'][] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const [selectedDay, setSelectedDay] = useState<string>('all');

  const mySlots = timetable.filter((t) => t.section === currentStudent?.section);

  const displayedSlots = mySlots.filter((slot) => {
    if (selectedDay === 'all') return true;
    return slot.day === selectedDay;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Clock className="w-6 h-6 text-emerald-400" />
            My Weekly Class Timetable
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Class schedule for {currentStudent?.name} · Semester {currentStudent?.semester} (Section {currentStudent?.section}).
          </p>
        </div>

        <div className="text-xs px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 font-semibold">
          Section {currentStudent?.section} · {mySlots.length} Weekly Lectures
        </div>
      </div>

      {/* Day Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center gap-2 overflow-x-auto scrollbar-thin">
        <button
          onClick={() => setSelectedDay('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
            selectedDay === 'all'
              ? 'bg-emerald-600 text-white font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          All Days ({mySlots.length})
        </button>
        {days.map((d) => {
          const count = mySlots.filter((t) => t.day === d).length;
          return (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                selectedDay === d
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {d} ({count})
            </button>
          );
        })}
      </div>

      {/* Schedule Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedSlots.map((slot) => {
          const course = courses.find((c) => c.id === slot.courseId);
          const faculty = facultyList.find((f) => f.id === slot.facultyId);

          return (
            <div
              key={slot.id}
              className="bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-xl p-5 flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs px-2.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
                    {slot.day}
                  </span>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                      slot.type === 'Lab'
                        ? 'bg-purple-900/40 text-purple-300 border border-purple-800/40'
                        : slot.type === 'Tutorial'
                        ? 'bg-amber-900/40 text-amber-300 border border-amber-800/40'
                        : 'bg-blue-900/40 text-blue-300 border border-blue-800/40'
                    }`}
                  >
                    {slot.type}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{slot.startTime} – {slot.endTime}</span>
                </div>

                <h3 className="text-base font-bold text-white mt-2 leading-snug">
                  {course?.code}: {course?.title}
                </h3>

                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {course?.description}
                </p>

                <div className="mt-4 p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      Classroom / Venue:
                    </span>
                    <span className="text-slate-200 font-medium">{slot.room}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      Instructor:
                    </span>
                    <span className="text-slate-200 font-medium truncate max-w-[170px]">
                      {faculty?.name || 'Faculty Member'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>Credit Hours: {course?.credits} Cr</span>
                <span className="text-emerald-400 font-medium">Sec {slot.section}</span>
              </div>
            </div>
          );
        })}

        {displayedSlots.length === 0 && (
          <div className="col-span-full py-12 text-center bg-slate-900 border border-slate-800 rounded-xl">
            <Clock className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="text-sm text-slate-300 font-medium">No class periods scheduled</p>
            <p className="text-xs text-slate-500 mt-1">Enjoy your study break on this day!</p>
          </div>
        )}
      </div>
    </div>
  );
};
