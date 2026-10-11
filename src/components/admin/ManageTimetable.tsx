import React, { useState } from 'react';
import { useLms } from '../../context/LmsContext';
import { TimetableSlot } from '../../types/lms';
import {
  Clock,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Building,
  MapPin,
  Filter,
  X,
  AlertCircle,
} from 'lucide-react';
import { ConfirmModal } from '../common/ConfirmModal';

export const ManageTimetable: React.FC = () => {
  const { timetable, courses, facultyList, addTimetableSlot, updateTimetableSlot, deleteTimetableSlot } = useLms();

  const daysList: TimetableSlot['day'][] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);
  const [deletingSlotId, setDeletingSlotId] = useState<string | null>(null);

  // Form State
  const [day, setDay] = useState<TimetableSlot['day']>('Monday');
  const [startTime, setStartTime] = useState('09:00 AM');
  const [endTime, setEndTime] = useState('10:30 AM');
  const [courseId, setCourseId] = useState(courses[0]?.id || '');
  const [facultyId, setFacultyId] = useState(facultyList[0]?.id || '');
  const [section, setSection] = useState('A');
  const [room, setRoom] = useState('Lecture Hall 101');
  const [type, setType] = useState<TimetableSlot['type']>('Lecture');

  const openAddModal = () => {
    setEditingSlot(null);
    setDay('Monday');
    setStartTime('09:00 AM');
    setEndTime('10:30 AM');
    setCourseId(courses[0]?.id || '');
    setFacultyId(facultyList[0]?.id || '');
    setSection('A');
    setRoom('Lecture Hall 102');
    setType('Lecture');
    setIsModalOpen(true);
  };

  const openEditModal = (slot: TimetableSlot) => {
    setEditingSlot(slot);
    setDay(slot.day);
    setStartTime(slot.startTime);
    setEndTime(slot.endTime);
    setCourseId(slot.courseId);
    setFacultyId(slot.facultyId);
    setSection(slot.section);
    setRoom(slot.room);
    setType(slot.type);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId || !facultyId) return;

    if (editingSlot) {
      updateTimetableSlot(editingSlot.id, {
        day,
        startTime,
        endTime,
        courseId,
        facultyId,
        section,
        room,
        type,
      });
    } else {
      addTimetableSlot({
        day,
        startTime,
        endTime,
        courseId,
        facultyId,
        section,
        room,
        type,
      });
    }

    setIsModalOpen(false);
  };

  const filteredSlots = timetable.filter((slot) => {
    if (selectedDayFilter === 'all') return true;
    return slot.day === selectedDayFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Clock className="w-6 h-6 text-sky-400" />
            Manage Institutional Timetable
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Configure weekly schedules, lecture periods, lab allocations, and classroom locations.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-md shadow-sky-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Schedule Slot
        </button>
      </div>

      {/* Filter Tabs by Day */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center gap-2 overflow-x-auto scrollbar-thin">
        <button
          onClick={() => setSelectedDayFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
            selectedDayFilter === 'all'
              ? 'bg-sky-600 text-white font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          All Days ({timetable.length})
        </button>
        {daysList.map((d) => {
          const count = timetable.filter((t) => t.day === d).length;
          return (
            <button
              key={d}
              onClick={() => setSelectedDayFilter(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                selectedDayFilter === d
                  ? 'bg-sky-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {d} ({count})
            </button>
          );
        })}
      </div>

      {/* Timetable Schedule Cards / Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSlots.map((slot) => {
          const course = courses.find((c) => c.id === slot.courseId);
          const faculty = facultyList.find((f) => f.id === slot.facultyId);

          return (
            <div
              key={slot.id}
              className="bg-slate-900 border border-slate-800 hover:border-sky-500/50 rounded-xl p-5 flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-sky-950/50 text-sky-300 border border-sky-800/60">
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

                <div className="mt-3 flex items-center gap-1.5 text-xs text-sky-400 font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{slot.startTime} – {slot.endTime}</span>
                </div>

                <h3 className="text-base font-bold text-white mt-2 leading-tight">
                  {course?.code}: {course?.title}
                </h3>

                <div className="mt-3 p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Instructor:</span>
                    <span className="text-slate-200 font-medium truncate max-w-[170px]">
                      {faculty?.name || 'Unassigned'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Venue / Room:</span>
                    <span className="text-slate-200 font-medium">{slot.room}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Batch Section:</span>
                    <span className="text-slate-200 font-medium">Section {slot.section}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditModal(slot)}
                  className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded transition"
                  title="Edit Slot"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeletingSlotId(slot.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition"
                  title="Delete Slot"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredSlots.length === 0 && (
          <div className="col-span-full py-12 text-center bg-slate-900 border border-slate-800 rounded-xl">
            <Clock className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="text-sm text-slate-300 font-medium">No schedule entries found for this day</p>
            <p className="text-xs text-slate-500 mt-1">Add slots to schedule lectures and lab practicals.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-400" />
                {editingSlot ? 'Edit Timetable Schedule' : 'Schedule New Class Period'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Day of Week <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={day}
                    onChange={(e) => setDay(e.target.value as TimetableSlot['day'])}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    {daysList.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Period Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as TimetableSlot['type'])}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    <option value="Lecture">Lecture</option>
                    <option value="Lab">Lab Practical</option>
                    <option value="Tutorial">Tutorial</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Start Time <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    placeholder="e.g. 09:00 AM"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    End Time <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    placeholder="e.g. 10:30 AM"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Course <span className="text-rose-400">*</span>
                </label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Instructor / Faculty <span className="text-rose-400">*</span>
                </label>
                <select
                  value={facultyId}
                  onChange={(e) => setFacultyId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  {facultyList.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Room / Lab Location <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    placeholder="e.g. Lab 4 or Room 204"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Section <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={section}
                    onChange={(e) => setSection(e.target.value.toUpperCase())}
                    placeholder="e.g. A"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs sm:text-sm text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-md shadow-sky-600/20 transition"
                >
                  {editingSlot ? 'Save Changes' : 'Schedule Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={Boolean(deletingSlotId)}
        title="Delete Schedule Slot"
        message="Are you sure you want to remove this timetable slot from the schedule?"
        confirmLabel="Remove Slot"
        onConfirm={() => {
          if (deletingSlotId) {
            deleteTimetableSlot(deletingSlotId);
            setDeletingSlotId(null);
          }
        }}
        onCancel={() => setDeletingSlotId(null)}
      />
    </div>
  );
};
