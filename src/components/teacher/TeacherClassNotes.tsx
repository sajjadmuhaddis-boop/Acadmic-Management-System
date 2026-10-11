import React, { useState } from 'react';
import { useLms } from '../../context/LmsContext';
import { ClassNote } from '../../types/lms';
import {
  BellRing,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  Info,
  Clock,
  X,
} from 'lucide-react';
import { ConfirmModal } from '../common/ConfirmModal';

export const TeacherClassNotes: React.FC = () => {
  const {
    getCurrentFaculty,
    classNotes,
    allocations,
    courses,
    addClassNote,
    updateClassNote,
    deleteClassNote,
  } = useLms();

  const currentFaculty = getCurrentFaculty();
  const myAllocations = allocations.filter((a) => a.facultyId === currentFaculty?.id);
  const myNotes = classNotes.filter((n) => n.facultyId === currentFaculty?.id);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<ClassNote | null>(null);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState(myAllocations[0]?.courseId || courses[0]?.id || '');
  const [section, setSection] = useState(myAllocations[0]?.section || 'A');
  const [priority, setPriority] = useState<ClassNote['priority']>('normal');
  const [content, setContent] = useState('');

  const openAddModal = () => {
    setEditingNote(null);
    setTitle('');
    setCourseId(myAllocations[0]?.courseId || courses[0]?.id || '');
    setSection(myAllocations[0]?.section || 'A');
    setPriority('normal');
    setContent('');
    setIsModalOpen(true);
  };

  const openEditModal = (note: ClassNote) => {
    setEditingNote(note);
    setTitle(note.title);
    setCourseId(note.courseId);
    setSection(note.section);
    setPriority(note.priority);
    setContent(note.content);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    if (editingNote) {
      updateClassNote(editingNote.id, {
        title,
        courseId,
        section,
        priority,
        content,
      });
    } else {
      addClassNote({
        title,
        courseId,
        section,
        facultyId: currentFaculty?.id || 'fac-1',
        priority,
        content,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <BellRing className="w-6 h-6 text-sky-400" />
            Class Notes & Course Notices
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Post important reminders, lab guidelines, and exam announcements directly to your students.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-md shadow-sky-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Broadcast Class Notice
        </button>
      </div>

      {/* Notes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {myNotes.map((note) => {
          const course = courses.find((c) => c.id === note.courseId);

          const priorityBadge = {
            urgent: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
            important: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
            normal: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
          }[note.priority];

          return (
            <div
              key={note.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 flex flex-col justify-between transition-all"
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

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(note)}
                      className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded transition"
                      title="Edit Note"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingNoteId(note.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition"
                      title="Delete Note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white mt-3 leading-snug">{note.title}</h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed whitespace-pre-line">
                  {note.content}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>Section {note.section}</span>
                <span>Posted: {note.createdAt}</span>
              </div>
            </div>
          );
        })}

        {myNotes.length === 0 && (
          <div className="col-span-full py-12 text-center bg-slate-900 border border-slate-800 rounded-xl">
            <BellRing className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="text-sm text-slate-300 font-medium">No class notices posted</p>
            <p className="text-xs text-slate-500 mt-1">
              Broadcast announcements to keep students updated on tests and deadlines.
            </p>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <BellRing className="w-4 h-4 text-sky-400" />
                {editingNote ? 'Edit Class Notice' : 'Post New Class Notice'}
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
                  Notice Headline <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Midterm Preparation & Formula Sheet"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Course <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    {myAllocations.map((alloc) => {
                      const c = courses.find((item) => item.id === alloc.courseId);
                      return (
                        <option key={alloc.id} value={alloc.courseId}>
                          {c?.code} - {c?.title}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as ClassNote['priority'])}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    <option value="normal">Normal</option>
                    <option value="important">Important</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Notice Content & Instructions <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write message details for the class roster..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-500"
                />
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
                  {editingNote ? 'Save Changes' : 'Broadcast Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={Boolean(deletingNoteId)}
        title="Delete Class Note"
        message="Are you sure you want to delete this notice? Students will no longer see it on their portal."
        confirmLabel="Delete Notice"
        onConfirm={() => {
          if (deletingNoteId) {
            deleteClassNote(deletingNoteId);
            setDeletingNoteId(null);
          }
        }}
        onCancel={() => setDeletingNoteId(null)}
      />
    </div>
  );
};
