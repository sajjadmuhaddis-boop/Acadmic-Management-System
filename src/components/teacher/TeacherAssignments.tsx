import React, { useState } from 'react';
import { useLms } from '../../context/LmsContext';
import { Assignment, AssignmentSubmission } from '../../types/lms';
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  CheckCircle2,
  Clock,
  Award,
  Users,
  Download,
  X,
  MessageSquare,
} from 'lucide-react';
import { ConfirmModal } from '../common/ConfirmModal';

export const TeacherAssignments: React.FC = () => {
  const {
    getCurrentFaculty,
    assignments,
    submissions,
    allocations,
    courses,
    students,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    gradeSubmission,
  } = useLms();

  const currentFaculty = getCurrentFaculty();
  const myAllocations = allocations.filter((a) => a.facultyId === currentFaculty?.id);
  const myAssignments = assignments.filter((a) => a.facultyId === currentFaculty?.id);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [deletingAssignmentId, setDeletingAssignmentId] = useState<string | null>(null);

  // Viewing / Grading submissions state
  const [gradingAssignment, setGradingAssignment] = useState<Assignment | null>(null);
  const [gradingSubmission, setGradingSubmission] = useState<AssignmentSubmission | null>(null);
  const [marksInput, setMarksInput] = useState<number>(18);
  const [feedbackInput, setFeedbackInput] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState(myAllocations[0]?.courseId || courses[0]?.id || '');
  const [section, setSection] = useState(myAllocations[0]?.section || 'A');
  const [totalMarks, setTotalMarks] = useState(20);
  const [dueDate, setDueDate] = useState('2025-11-15T23:59');
  const [description, setDescription] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');

  const openAddModal = () => {
    setEditingAssignment(null);
    setTitle('');
    setCourseId(myAllocations[0]?.courseId || courses[0]?.id || '');
    setSection(myAllocations[0]?.section || 'A');
    setTotalMarks(20);
    setDueDate('2025-11-15T23:59');
    setDescription('');
    setAttachmentUrl('');
    setIsModalOpen(true);
  };

  const openEditModal = (asg: Assignment) => {
    setEditingAssignment(asg);
    setTitle(asg.title);
    setCourseId(asg.courseId);
    setSection(asg.section);
    setTotalMarks(asg.totalMarks);
    setDueDate(asg.dueDate);
    setDescription(asg.description);
    setAttachmentUrl(asg.attachmentUrl || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !courseId) return;

    if (editingAssignment) {
      updateAssignment(editingAssignment.id, {
        title,
        courseId,
        section,
        totalMarks: Number(totalMarks),
        dueDate,
        description,
        attachmentUrl: attachmentUrl || undefined,
      });
    } else {
      addAssignment({
        title,
        courseId,
        section,
        facultyId: currentFaculty?.id || 'fac-1',
        totalMarks: Number(totalMarks),
        dueDate,
        description,
        attachmentUrl: attachmentUrl || undefined,
      });
    }

    setIsModalOpen(false);
  };

  const openGradeModal = (sub: AssignmentSubmission, asg: Assignment) => {
    setGradingSubmission(sub);
    setGradingAssignment(asg);
    setMarksInput(sub.marksObtained ?? Math.floor(asg.totalMarks * 0.85));
    setFeedbackInput(sub.feedback || 'Well done on completing the assignment.');
  };

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission) return;
    gradeSubmission(gradingSubmission.id, Number(marksInput), feedbackInput);
    setGradingSubmission(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-amber-400" />
            Assignments & Submissions Grading
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Create coursework tasks, monitor student upload submissions, and award numerical grades with feedback.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-md shadow-amber-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Create New Assignment
        </button>
      </div>

      {/* Assignments List */}
      <div className="grid grid-cols-1 gap-5">
        {myAssignments.map((asg) => {
          const course = courses.find((c) => c.id === asg.courseId);
          const asgSubmissions = submissions.filter((s) => s.assignmentId === asg.id);
          const gradedCount = asgSubmissions.filter((s) => s.status === 'graded').length;

          return (
            <div
              key={asg.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700/80 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-950/50 text-amber-300 border border-amber-800/60">
                      {course?.code}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      Sec {asg.section}
                    </span>
                    <span className="text-xs text-amber-400 font-semibold">
                      {asg.totalMarks} Total Marks
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      Due: {asg.dueDate.replace('T', ' ')}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mt-2.5">{asg.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed whitespace-pre-line">
                    {asg.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-start">
                  <button
                    onClick={() => setGradingAssignment(asg)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                  >
                    <Users className="w-3.5 h-3.5" />
                    Review Submissions ({asgSubmissions.length})
                  </button>
                  <button
                    onClick={() => openEditModal(asg)}
                    className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded transition"
                    title="Edit Assignment"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingAssignmentId(asg.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition"
                    title="Delete Assignment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress strip */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-3">
                  <span>Submissions: <strong className="text-slate-200">{asgSubmissions.length}</strong> / {students.length}</span>
                  <span>Graded: <strong className="text-emerald-400">{gradedCount}</strong></span>
                </div>
                <span className="text-slate-400">Created: {asg.createdAt}</span>
              </div>
            </div>
          );
        })}

        {myAssignments.length === 0 && (
          <div className="py-12 text-center bg-slate-900 border border-slate-800 rounded-xl">
            <FileText className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="text-sm text-slate-300 font-medium">No assignments published yet</p>
            <p className="text-xs text-slate-500 mt-1">Create assignments to collect student submissions.</p>
          </div>
        )}
      </div>

      {/* Submissions Review Drawer / Modal */}
      {gradingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
              <div>
                <span className="text-xs font-semibold text-amber-400">Submissions Roster</span>
                <h2 className="text-base font-bold text-white mt-0.5">{gradingAssignment.title}</h2>
              </div>
              <button
                onClick={() => setGradingAssignment(null)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {(() => {
                const asgSubmissions = submissions.filter(
                  (s) => s.assignmentId === gradingAssignment.id
                );

                if (asgSubmissions.length === 0) {
                  return (
                    <div className="py-12 text-center text-slate-400 text-xs">
                      No students have submitted this assignment yet.
                    </div>
                  );
                }

                return asgSubmissions.map((sub) => {
                  const student = students.find((s) => s.id === sub.studentId);

                  return (
                    <div
                      key={sub.id}
                      className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{sub.studentName}</span>
                            <span className="text-xs text-slate-400 font-mono">({student?.rollNo})</span>
                          </div>
                          <span className="text-[11px] text-slate-400">
                            Submitted on: {new Date(sub.submittedAt).toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {sub.status === 'graded' ? (
                            <span className="px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs font-bold">
                              Score: {sub.marksObtained} / {gradingAssignment.totalMarks}
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded bg-amber-950/60 border border-amber-800/60 text-amber-300 text-xs font-semibold">
                              Pending Evaluation
                            </span>
                          )}

                          <button
                            onClick={() => openGradeModal(sub, gradingAssignment)}
                            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold transition"
                          >
                            {sub.status === 'graded' ? 'Edit Grade' : 'Grade Now'}
                          </button>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/60 text-xs text-slate-300">
                        <p className="font-semibold text-slate-400 text-[10px] uppercase mb-1">
                          Student Submission Notes / Solution:
                        </p>
                        <p className="whitespace-pre-line leading-relaxed">{sub.content}</p>
                        {sub.fileName && (
                          <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-indigo-300">
                            <span>Attached File: {sub.fileName}</span>
                            <span className="text-slate-400">Verified Attachment</span>
                          </div>
                        )}
                      </div>

                      {sub.feedback && (
                        <div className="p-2.5 rounded bg-emerald-950/30 border border-emerald-900/40 text-xs text-emerald-200">
                          <strong className="text-emerald-300">Teacher Feedback: </strong>
                          {sub.feedback}
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Grade Input Modal */}
      {gradingSubmission && gradingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                Grade Student Submission
              </h2>
              <button
                onClick={() => setGradingSubmission(null)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGrade} className="mt-4 space-y-4">
              <div>
                <span className="text-xs text-slate-400">Student:</span>
                <p className="text-sm font-bold text-white">{gradingSubmission.studentName}</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Marks Awarded (out of {gradingAssignment.totalMarks}) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max={gradingAssignment.totalMarks}
                  required
                  value={marksInput}
                  onChange={(e) => setMarksInput(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Instructor Feedback & Comments
                </label>
                <textarea
                  rows={3}
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  placeholder="Provide constructive assessment..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setGradingSubmission(null)}
                  className="px-4 py-2 text-xs sm:text-sm text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-md transition"
                >
                  Save & Publish Grade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Assignment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                {editingAssignment ? 'Edit Assignment' : 'Create Course Assignment'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4 overflow-y-auto flex-1 pr-1">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Assignment Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Assignment 2: Graph Shortest Path"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Course <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 cursor-pointer"
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
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Section
                  </label>
                  <input
                    type="text"
                    value={section}
                    onChange={(e) => setSection(e.target.value.toUpperCase())}
                    placeholder="A"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Total Marks <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Due Date & Time <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Problem Description & Instructions
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide detailed submission requirements and specifications..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Reference File / Specification Link
                </label>
                <input
                  type="text"
                  value={attachmentUrl}
                  onChange={(e) => setAttachmentUrl(e.target.value)}
                  placeholder="https://university.edu/docs/assignment_specs.pdf"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
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
                  className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-lg shadow-md shadow-amber-600/20 transition"
                >
                  {editingAssignment ? 'Save Changes' : 'Publish Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={Boolean(deletingAssignmentId)}
        title="Delete Assignment"
        message="Are you sure you want to delete this assignment? Existing submissions will also be deleted."
        confirmLabel="Delete Assignment"
        onConfirm={() => {
          if (deletingAssignmentId) {
            deleteAssignment(deletingAssignmentId);
            setDeletingAssignmentId(null);
          }
        }}
        onCancel={() => setDeletingAssignmentId(null)}
      />
    </div>
  );
};
