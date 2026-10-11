import React, { useState } from 'react';
import { useLms } from '../../context/LmsContext';
import { CourseAllocation } from '../../types/lms';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  Users,
  Calendar,
  AlertTriangle,
  X,
  Filter,
} from 'lucide-react';
import { ConfirmModal } from '../common/ConfirmModal';

export const ManageCourseAllocation: React.FC = () => {
  const {
    allocations,
    courses,
    facultyList,
    sessions,
    departments,
    activeSessionId,
    addAllocation,
    updateAllocation,
    deleteAllocation,
  } = useLms();

  const [selectedSessionFilter, setSelectedSessionFilter] = useState<string>(activeSessionId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAlloc, setEditingAlloc] = useState<CourseAllocation | null>(null);
  const [deletingAllocId, setDeletingAllocId] = useState<string | null>(null);

  // Form State
  const [courseId, setCourseId] = useState(courses[0]?.id || '');
  const [facultyId, setFacultyId] = useState(facultyList[0]?.id || '');
  const [sessionId, setSessionId] = useState(activeSessionId);
  const [section, setSection] = useState('A');
  const [semester, setSemester] = useState(5);

  const openAddModal = () => {
    setEditingAlloc(null);
    setCourseId(courses[0]?.id || '');
    setFacultyId(facultyList[0]?.id || '');
    setSessionId(activeSessionId);
    setSection('A');
    setSemester(5);
    setIsModalOpen(true);
  };

  const openEditModal = (alloc: CourseAllocation) => {
    setEditingAlloc(alloc);
    setCourseId(alloc.courseId);
    setFacultyId(alloc.facultyId);
    setSessionId(alloc.sessionId);
    setSection(alloc.section);
    setSemester(alloc.semester);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId || !facultyId || !sessionId) return;

    if (editingAlloc) {
      updateAllocation(editingAlloc.id, {
        courseId,
        facultyId,
        sessionId,
        section,
        semester: Number(semester),
      });
    } else {
      addAllocation({
        courseId,
        facultyId,
        sessionId,
        section,
        semester: Number(semester),
      });
    }

    setIsModalOpen(false);
  };

  const filteredAllocations = allocations.filter((a) => {
    if (selectedSessionFilter === 'all') return true;
    return a.sessionId === selectedSessionFilter;
  });

  // Check unallocated courses for selected session
  const allocatedCourseIds = new Set(filteredAllocations.map((a) => a.courseId));
  const unallocatedCourses = courses.filter((c) => !allocatedCourseIds.has(c.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-purple-400" />
            Manage Course Allocation
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Assign academic courses to faculty instructors by semester, section, and term session.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-md shadow-purple-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Assign Course to Faculty
        </button>
      </div>

      {/* Session Filter */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs text-slate-400">Academic Session:</span>
          <select
            value={selectedSessionFilter}
            onChange={(e) => setSelectedSessionFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            <option value="all">All Sessions</option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.status})
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-400">
          Showing <span className="font-semibold text-slate-200">{filteredAllocations.length}</span> allocations
        </div>
      </div>

      {/* Unallocated Courses Alert if any */}
      {unallocatedCourses.length > 0 && selectedSessionFilter !== 'all' && (
        <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/40 text-amber-200 text-xs flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-300">
              {unallocatedCourses.length} Course(s) without faculty allocation in this session:
            </p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {unallocatedCourses.map((c) => (
                <span
                  key={c.id}
                  className="px-2 py-0.5 rounded bg-amber-900/40 border border-amber-800/50 text-amber-200 text-[11px]"
                >
                  {c.code} · {c.title}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Allocations Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-950/80 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Course Code & Title</th>
                <th className="py-3.5 px-4 font-semibold">Assigned Faculty</th>
                <th className="py-3.5 px-4 font-semibold">Department</th>
                <th className="py-3.5 px-4 font-semibold">Section</th>
                <th className="py-3.5 px-4 font-semibold">Semester</th>
                <th className="py-3.5 px-4 font-semibold">Session</th>
                <th className="py-3.5 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredAllocations.map((alloc) => {
                const course = courses.find((c) => c.id === alloc.courseId);
                const faculty = facultyList.find((f) => f.id === alloc.facultyId);
                const session = sessions.find((s) => s.id === alloc.sessionId);
                const dept = departments.find((d) => d.id === course?.departmentId);

                return (
                  <tr key={alloc.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/60">
                          {course?.code}
                        </span>
                        <div>
                          <p className="font-semibold text-white leading-tight">{course?.title}</p>
                          <span className="text-[11px] text-slate-400">{course?.credits} Credit Hours</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-900/60 text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0">
                          {faculty?.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-200">{faculty?.name || 'Unassigned'}</p>
                          <p className="text-[10px] text-slate-400">{faculty?.designation || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-slate-300 font-medium">{dept?.code}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-mono font-bold text-xs">
                        Section {alloc.section}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-slate-300 font-medium">Semester {alloc.semester}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-slate-300 text-xs font-medium">{session?.name}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => openEditModal(alloc)}
                          className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded transition"
                          title="Edit Allocation"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingAllocId(alloc.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition"
                          title="Remove Allocation"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredAllocations.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No course allocations recorded for this session.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                {editingAlloc ? 'Edit Course Allocation' : 'Allocate Course to Faculty'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Select Course <span className="text-rose-400">*</span>
                </label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.title} ({c.credits} Cr)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Assign to Faculty Member <span className="text-rose-400">*</span>
                </label>
                <select
                  value={facultyId}
                  onChange={(e) => setFacultyId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  {facultyList.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Academic Session <span className="text-rose-400">*</span>
                </label>
                <select
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  {sessions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Section Code <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={section}
                    onChange={(e) => setSection(e.target.value.toUpperCase())}
                    placeholder="e.g. A or B"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Semester
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={semester}
                    onChange={(e) => setSemester(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-purple-500"
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
                  className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-lg shadow-md shadow-purple-600/20 transition"
                >
                  {editingAlloc ? 'Save Changes' : 'Record Allocation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={Boolean(deletingAllocId)}
        title="Remove Course Allocation"
        message="Are you sure you want to remove this faculty course allocation?"
        confirmLabel="Remove Allocation"
        onConfirm={() => {
          if (deletingAllocId) {
            deleteAllocation(deletingAllocId);
            setDeletingAllocId(null);
          }
        }}
        onCancel={() => setDeletingAllocId(null)}
      />
    </div>
  );
};
