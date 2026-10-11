import React, { useState } from 'react';
import { useLms } from '../../context/LmsContext';
import { Assignment, AssignmentSubmission } from '../../types/lms';
import {
  FileText,
  Clock,
  CheckCircle2,
  Upload,
  Award,
  AlertCircle,
  ExternalLink,
  X,
  FileCheck,
} from 'lucide-react';

export const StudentAssignments: React.FC = () => {
  const {
    getCurrentStudent,
    assignments,
    submissions,
    courses,
    allocations,
    submitAssignment,
  } = useLms();

  const currentStudent = getCurrentStudent();
  const myAllocations = allocations.filter((a) => a.section === currentStudent?.section);
  const myCourseIds = new Set(myAllocations.map((a) => a.courseId));
  const myAssignments = assignments.filter((a) => myCourseIds.has(a.courseId));

  const [submittingAssignment, setSubmittingAssignment] = useState<Assignment | null>(null);
  const [solutionText, setSolutionText] = useState('');
  const [fileName, setFileName] = useState('');

  const openSubmitModal = (asg: Assignment) => {
    setSubmittingAssignment(asg);
    const existing = submissions.find(
      (s) => s.assignmentId === asg.id && s.studentId === currentStudent?.id
    );
    setSolutionText(existing?.content || '');
    setFileName(existing?.fileName || `${currentStudent?.name.replace(/\s+/g, '')}_${asg.title.substring(0, 15)}.zip`);
  };

  const handleConfirmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingAssignment || !solutionText.trim()) return;

    submitAssignment(
      submittingAssignment.id,
      currentStudent?.id || 'stu-1',
      solutionText,
      fileName || 'Assignment_Solution.pdf'
    );

    setSubmittingAssignment(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-amber-400" />
            Course Assignments
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            View assigned course tasks, upload your solutions, and review teacher feedback & marks.
          </p>
        </div>

        <div className="text-xs px-3 py-1.5 rounded-lg bg-amber-950/60 border border-amber-800/60 text-amber-300 font-semibold">
          {myAssignments.length} Assignments Assigned
        </div>
      </div>

      {/* Assignments List */}
      <div className="grid grid-cols-1 gap-5">
        {myAssignments.map((asg) => {
          const course = courses.find((c) => c.id === asg.courseId);
          const mySubmission = submissions.find(
            (s) => s.assignmentId === asg.id && s.studentId === currentStudent?.id
          );

          const isSubmitted = Boolean(mySubmission);
          const isGraded = mySubmission?.status === 'graded';

          return (
            <div
              key={asg.id}
              className={`bg-slate-900 border rounded-xl p-5 transition-all ${
                isGraded
                  ? 'border-emerald-500/40 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/20'
                  : isSubmitted
                  ? 'border-blue-500/40'
                  : 'border-slate-800 hover:border-amber-500/40'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/60">
                      {course?.code}
                    </span>
                    <span className="text-xs text-amber-400 font-semibold">
                      {asg.totalMarks} Total Marks
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      Due: {asg.dueDate.replace('T', ' ')}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mt-2.5 leading-snug">
                    {asg.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed whitespace-pre-line">
                    {asg.description}
                  </p>

                  {asg.attachmentUrl && (
                    <div className="mt-3">
                      <a
                        href={asg.attachmentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 font-medium"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Download Assignment Specification PDF
                      </a>
                    </div>
                  )}
                </div>

                {/* Submission status & button */}
                <div className="flex flex-col sm:items-end justify-between gap-3 shrink-0">
                  <div>
                    {isGraded ? (
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs font-bold">
                          <Award className="w-4 h-4 text-emerald-400" />
                          Graded: {mySubmission?.marksObtained} / {asg.totalMarks}
                        </span>
                      </div>
                    ) : isSubmitted ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-950/80 border border-blue-700 text-blue-300 text-xs font-semibold">
                        <FileCheck className="w-4 h-4 text-blue-400" />
                        Submitted (Pending Review)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-950/80 border border-amber-700 text-amber-300 text-xs font-semibold">
                        <Clock className="w-4 h-4 text-amber-400" />
                        Submission Open
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => openSubmitModal(asg)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition ${
                      isSubmitted
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                        : 'bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/20'
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    {isSubmitted ? 'Resubmit / Edit Submission' : 'Submit Assignment'}
                  </button>
                </div>
              </div>

              {/* Show graded feedback or submitted details */}
              {mySubmission && (
                <div className="mt-4 pt-3.5 border-t border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Your Submitted Solution:</span>
                    <span>Submitted on: {new Date(mySubmission.submittedAt).toLocaleString()}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-slate-300">
                    <p className="whitespace-pre-line">{mySubmission.content}</p>
                    {mySubmission.fileName && (
                      <span className="mt-2 block text-indigo-300 font-mono text-[11px]">
                        Attachment: {mySubmission.fileName}
                      </span>
                    )}
                  </div>

                  {mySubmission.feedback && (
                    <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-emerald-200">
                      <strong className="text-emerald-300 font-semibold">Instructor Remarks: </strong>
                      {mySubmission.feedback}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {myAssignments.length === 0 && (
          <div className="py-12 text-center bg-slate-900 border border-slate-800 rounded-xl">
            <FileText className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="text-sm text-slate-300 font-medium">No active assignments</p>
            <p className="text-xs text-slate-500 mt-1">Check back later when teachers post coursework.</p>
          </div>
        )}
      </div>

      {/* Submit Assignment Modal */}
      {submittingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-semibold text-amber-400">Submission Form</span>
                <h2 className="text-base font-bold text-white mt-0.5">{submittingAssignment.title}</h2>
              </div>
              <button
                onClick={() => setSubmittingAssignment(null)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmSubmit} className="mt-4 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Solution Notes & Code Summary <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={solutionText}
                  onChange={(e) => setSolutionText(e.target.value)}
                  placeholder="Paste your solution write-up, algorithm explanation, or repository URL..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Attached File / Archive Name
                </label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="e.g. AliAhmed_CS301_Assignment2.zip"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Mock file packaging simulates verified campus upload.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Maximum Points:</span>
                <span className="font-bold text-amber-400">{submittingAssignment.totalMarks} Marks</span>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSubmittingAssignment(null)}
                  className="px-4 py-2 text-xs sm:text-sm text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-lg shadow-md shadow-amber-600/20 transition"
                >
                  Confirm & Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
