import React, { useState } from 'react';
import { useLms } from '../../context/LmsContext';
import { Quiz, QuizQuestion } from '../../types/lms';
import {
  HelpCircle,
  Plus,
  Edit2,
  Trash2,
  Clock,
  Award,
  CheckCircle2,
  Users,
  X,
  ListPlus,
} from 'lucide-react';
import { ConfirmModal } from '../common/ConfirmModal';

export const TeacherQuizzes: React.FC = () => {
  const {
    getCurrentFaculty,
    quizzes,
    quizAttempts,
    allocations,
    courses,
    addQuiz,
    updateQuiz,
    deleteQuiz,
  } = useLms();

  const currentFaculty = getCurrentFaculty();
  const myAllocations = allocations.filter((a) => a.facultyId === currentFaculty?.id);
  const myQuizzes = quizzes.filter((q) => q.facultyId === currentFaculty?.id);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [deletingQuizId, setDeletingQuizId] = useState<string | null>(null);
  const [viewingAttemptsQuiz, setViewingAttemptsQuiz] = useState<Quiz | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState(myAllocations[0]?.courseId || courses[0]?.id || '');
  const [section, setSection] = useState(myAllocations[0]?.section || 'A');
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [totalMarks, setTotalMarks] = useState(15);
  const [dueDate, setDueDate] = useState('2025-11-20T23:59');
  const [description, setDescription] = useState('');

  // Questions array for the quiz
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    {
      id: 'q-1',
      question: 'Which data structure follows the LIFO (Last In First Out) principle?',
      options: ['Queue', 'Stack', 'Linked List', 'Binary Tree'],
      correctOptionIndex: 1,
      points: 5,
    },
    {
      id: 'q-2',
      question: 'What is the average time complexity of quicksort?',
      options: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(log n)'],
      correctOptionIndex: 1,
      points: 5,
    },
    {
      id: 'q-3',
      question: 'In a complete binary tree, every level except possibly the last is completely filled. True or False?',
      options: ['True', 'False'],
      correctOptionIndex: 0,
      points: 5,
    },
  ]);

  const openAddModal = () => {
    setEditingQuiz(null);
    setTitle('');
    setCourseId(myAllocations[0]?.courseId || courses[0]?.id || '');
    setSection(myAllocations[0]?.section || 'A');
    setDurationMinutes(15);
    setTotalMarks(15);
    setDueDate('2025-11-20T23:59');
    setDescription('');
    setQuestions([
      {
        id: `q-${Date.now()}-1`,
        question: 'Sample Question 1?',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctOptionIndex: 0,
        points: 5,
      },
    ]);
    setIsModalOpen(true);
  };

  const openEditModal = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setTitle(quiz.title);
    setCourseId(quiz.courseId);
    setSection(quiz.section);
    setDurationMinutes(quiz.durationMinutes);
    setTotalMarks(quiz.totalMarks);
    setDueDate(quiz.dueDate);
    setDescription(quiz.description);
    setQuestions(quiz.questions);
    setIsModalOpen(true);
  };

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: `q-${Date.now()}-${prev.length + 1}`,
        question: `Question ${prev.length + 1}?`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctOptionIndex: 0,
        points: 5,
      },
    ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleQuestionChange = (idx: number, field: keyof QuizQuestion, val: any) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, [field]: val } : q))
    );
  };

  const handleOptionChange = (qIdx: number, optIdx: number, val: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        const newOpts = [...q.options];
        newOpts[optIdx] = val;
        return { ...q, options: newOpts };
      })
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !courseId) return;

    const calculatedTotalMarks = questions.reduce((sum, q) => sum + Number(q.points), 0);

    if (editingQuiz) {
      updateQuiz(editingQuiz.id, {
        title,
        courseId,
        section,
        durationMinutes: Number(durationMinutes),
        totalMarks: calculatedTotalMarks || Number(totalMarks),
        dueDate,
        description,
        questions,
      });
    } else {
      addQuiz({
        title,
        courseId,
        section,
        facultyId: currentFaculty?.id || 'fac-1',
        durationMinutes: Number(durationMinutes),
        totalMarks: calculatedTotalMarks || Number(totalMarks),
        dueDate,
        description,
        questions,
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
            <HelpCircle className="w-6 h-6 text-purple-400" />
            Online Quizzes & Assessments
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Design timed multiple-choice assessments and review auto-graded student attempt results.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-md shadow-purple-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Create New Quiz
        </button>
      </div>

      {/* Quizzes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {myQuizzes.map((quiz) => {
          const course = courses.find((c) => c.id === quiz.courseId);
          const attempts = quizAttempts.filter((qa) => qa.quizId === quiz.id);

          return (
            <div
              key={quiz.id}
              className="bg-slate-900 border border-slate-800 hover:border-purple-500/50 rounded-xl p-5 flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/60">
                    {course?.code} (Sec {quiz.section})
                  </span>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-purple-400" />
                    <span>{quiz.durationMinutes} Mins</span>
                    <span>·</span>
                    <span className="text-purple-300 font-bold">{quiz.totalMarks} Marks</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white mt-3 leading-snug">{quiz.title}</h3>
                <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                  {quiz.description || 'Comprehensive evaluation covering current syllabus modules.'}
                </p>

                <div className="mt-4 p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1.5 text-xs text-slate-400">
                  <div className="flex items-center justify-between">
                    <span>Questions Count:</span>
                    <span className="text-slate-200 font-semibold">{quiz.questions.length} Items</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Student Attempts:</span>
                    <span className="text-emerald-400 font-semibold">{attempts.length} Attempted</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Due Deadline:</span>
                    <span className="text-slate-300">{quiz.dueDate.replace('T', ' ')}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => setViewingAttemptsQuiz(quiz)}
                  className="text-xs text-purple-300 hover:text-white inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-950/50 hover:bg-purple-900/50 border border-purple-800/50 transition font-medium"
                >
                  <Users className="w-3.5 h-3.5" />
                  View Results ({attempts.length})
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(quiz)}
                    className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded transition"
                    title="Edit Quiz"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingQuizId(quiz.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition"
                    title="Delete Quiz"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {myQuizzes.length === 0 && (
          <div className="col-span-full py-12 text-center bg-slate-900 border border-slate-800 rounded-xl">
            <HelpCircle className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="text-sm text-slate-300 font-medium">No quizzes created yet</p>
            <p className="text-xs text-slate-500 mt-1">
              Create an online quiz with custom multiple-choice questions for your students.
            </p>
          </div>
        )}
      </div>

      {/* Attempts Modal */}
      {viewingAttemptsQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div>
                <span className="text-xs font-semibold text-purple-400">Quiz Scores</span>
                <h2 className="text-base font-bold text-white mt-0.5">{viewingAttemptsQuiz.title}</h2>
              </div>
              <button
                onClick={() => setViewingAttemptsQuiz(null)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-3">
              {(() => {
                const attempts = quizAttempts.filter((qa) => qa.quizId === viewingAttemptsQuiz.id);

                if (attempts.length === 0) {
                  return (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      No students have attempted this quiz yet.
                    </div>
                  );
                }

                return attempts.map((att) => {
                  const percentage = Math.round((att.score / att.totalMarks) * 100);

                  return (
                    <div
                      key={att.id}
                      className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-bold text-white">{att.studentName}</p>
                        <p className="text-xs text-slate-400">
                          Attempted: {new Date(att.attemptedAt).toLocaleString()}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-bold text-emerald-400">
                          {att.score} / {att.totalMarks}
                        </span>
                        <p className="text-xs text-slate-400">{percentage}% Score</p>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Quiz Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-purple-400" />
                {editingQuiz ? 'Edit Quiz & Questions' : 'Create New Quiz Assessment'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Quiz Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Quiz 2: Trees & Graph Traversal"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Course <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    {myAllocations.map((alloc) => {
                      const c = courses.find((item) => item.id === alloc.courseId);
                      return (
                        <option key={alloc.id} value={alloc.courseId}>
                          {c?.code}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    required
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Due Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Questions Section */}
              <div className="pt-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                    Questions ({questions.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="text-xs text-purple-400 hover:text-purple-300 inline-flex items-center gap-1 font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Question
                  </button>
                </div>

                <div className="mt-3 space-y-4">
                  {questions.map((q, qIdx) => (
                    <div
                      key={q.id || qIdx}
                      className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-300">
                          Question {qIdx + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">Points:</span>
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={q.points}
                            onChange={(e) => handleQuestionChange(qIdx, 'points', Number(e.target.value))}
                            className="w-14 bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-xs text-white text-center"
                          />
                          {questions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveQuestion(qIdx)}
                              className="text-slate-400 hover:text-rose-400 p-1 rounded"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <input
                        type="text"
                        required
                        value={q.question}
                        onChange={(e) => handleQuestionChange(qIdx, 'question', e.target.value)}
                        placeholder="Enter question statement..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-white focus:outline-none focus:border-purple-500"
                      />

                      <div className="space-y-2">
                        <p className="text-[11px] text-slate-400">Options (Select correct radio button):</p>
                        {q.options.map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct-${qIdx}`}
                              checked={q.correctOptionIndex === optIdx}
                              onChange={() => handleQuestionChange(qIdx, 'correctOptionIndex', optIdx)}
                              className="w-3.5 h-3.5 text-purple-600 focus:ring-0 cursor-pointer"
                            />
                            <input
                              type="text"
                              required
                              value={opt}
                              onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                              placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                              className="flex-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-purple-500"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
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
                  {editingQuiz ? 'Save Changes' : 'Publish Quiz'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={Boolean(deletingQuizId)}
        title="Delete Quiz"
        message="Are you sure you want to delete this quiz? Any student attempt logs for this quiz will also be removed."
        confirmLabel="Delete Quiz"
        onConfirm={() => {
          if (deletingQuizId) {
            deleteQuiz(deletingQuizId);
            setDeletingQuizId(null);
          }
        }}
        onCancel={() => setDeletingQuizId(null)}
      />
    </div>
  );
};
