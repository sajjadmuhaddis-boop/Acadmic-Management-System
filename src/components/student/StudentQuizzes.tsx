import React, { useState, useEffect } from 'react';
import { useLms } from '../../context/LmsContext';
import { Quiz, QuizAttempt } from '../../types/lms';
import {
  HelpCircle,
  Clock,
  Award,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  X,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

export const StudentQuizzes: React.FC = () => {
  const {
    getCurrentStudent,
    quizzes,
    quizAttempts,
    courses,
    allocations,
    submitQuizAttempt,
  } = useLms();

  const currentStudent = getCurrentStudent();
  const myAllocations = allocations.filter((a) => a.section === currentStudent?.section);
  const myCourseIds = new Set(myAllocations.map((a) => a.courseId));
  const myQuizzes = quizzes.filter((q) => myCourseIds.has(q.courseId));

  // Active quiz session state
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [reviewingAttempt, setReviewingAttempt] = useState<{ quiz: Quiz; attempt: QuizAttempt } | null>(null);

  // Timer countdown
  useEffect(() => {
    if (!activeQuiz || secondsRemaining <= 0) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeQuiz, secondsRemaining]);

  const startQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setCurrentQuestionIdx(0);
    setAnswers({});
    setSecondsRemaining(quiz.durationMinutes * 60);
  };

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx,
    }));
  };

  const handleAutoSubmit = () => {
    if (!activeQuiz) return;
    submitQuizAttempt(activeQuiz.id, currentStudent?.id || 'stu-1', answers);
    setActiveQuiz(null);
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
            Take timed multiple-choice assessments and receive instant scores.
          </p>
        </div>

        <div className="text-xs px-3 py-1.5 rounded-lg bg-purple-950/60 border border-purple-800/60 text-purple-300 font-semibold">
          {myQuizzes.length} Quizzes Available
        </div>
      </div>

      {/* Quizzes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {myQuizzes.map((quiz) => {
          const course = courses.find((c) => c.id === quiz.courseId);
          const myAttempt = quizAttempts.find(
            (qa) => qa.quizId === quiz.id && qa.studentId === currentStudent?.id
          );

          const isCompleted = Boolean(myAttempt);

          return (
            <div
              key={quiz.id}
              className={`bg-slate-900 border rounded-xl p-5 flex flex-col justify-between transition-all ${
                isCompleted
                  ? 'border-purple-500/40 bg-gradient-to-br from-slate-900 to-purple-950/20'
                  : 'border-slate-800 hover:border-purple-500/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/60">
                    {course?.code}
                  </span>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-purple-400" />
                    <span>{quiz.durationMinutes} Mins</span>
                    <span>·</span>
                    <span className="text-purple-300 font-bold">{quiz.totalMarks} Marks</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white mt-3 leading-snug">{quiz.title}</h3>
                <p className="text-xs text-slate-300 mt-1.5 line-clamp-2 leading-relaxed">
                  {quiz.description || 'Evaluation on core theoretical concepts.'}
                </p>

                <div className="mt-4 p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1.5 text-xs text-slate-400">
                  <div className="flex items-center justify-between">
                    <span>Number of Questions:</span>
                    <span className="text-slate-200 font-semibold">{quiz.questions.length} Items</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Deadline:</span>
                    <span className="text-slate-300">{quiz.dueDate.replace('T', ' ')}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                {isCompleted ? (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs font-bold">
                      <Award className="w-4 h-4 text-emerald-400" />
                      Score: {myAttempt?.score} / {quiz.totalMarks}
                    </span>
                    <button
                      onClick={() => setReviewingAttempt({ quiz, attempt: myAttempt! })}
                      className="text-xs text-purple-400 hover:text-purple-300 font-medium"
                    >
                      Review Answers
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-amber-400 font-medium">Ready to Take</span>
                )}

                {!isCompleted ? (
                  <button
                    onClick={() => startQuiz(quiz)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold shadow-md shadow-purple-600/20 transition"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Start Online Quiz
                  </button>
                ) : (
                  <button
                    onClick={() => startQuiz(quiz)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Retake Quiz
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {myQuizzes.length === 0 && (
          <div className="col-span-full py-12 text-center bg-slate-900 border border-slate-800 rounded-xl">
            <HelpCircle className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="text-sm text-slate-300 font-medium">No quizzes currently scheduled</p>
            <p className="text-xs text-slate-500 mt-1">Teachers will post quizzes before midterm and final exams.</p>
          </div>
        )}
      </div>

      {/* Interactive Quiz Taker Modal */}
      {activeQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Quiz Header Bar */}
            <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-purple-400">{activeQuiz.title}</span>
                <p className="text-xs text-slate-400 mt-0.5">
                  Question {currentQuestionIdx + 1} of {activeQuiz.questions.length}
                </p>
              </div>

              {/* Timer Pill */}
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono text-xs font-bold ${
                  secondsRemaining < 60
                    ? 'bg-rose-950/80 border-rose-700 text-rose-300 animate-pulse'
                    : 'bg-purple-950/80 border-purple-700 text-purple-300'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Time Remaining: {formatTimer(secondsRemaining)}</span>
              </div>
            </div>

            {/* Question Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              {(() => {
                const q = activeQuiz.questions[currentQuestionIdx];
                if (!q) return null;

                return (
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                        {currentQuestionIdx + 1}. {q.question}
                      </h3>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 shrink-0 font-medium">
                        {q.points} Points
                      </span>
                    </div>

                    <div className="space-y-3 mt-4">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = answers[q.id] === optIdx;

                        return (
                          <div
                            key={optIdx}
                            onClick={() => handleSelectOption(q.id, optIdx)}
                            className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                              isSelected
                                ? 'bg-purple-950/60 border-purple-500 text-white shadow-md shadow-purple-500/10'
                                : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                            }`}
                          >
                            <div
                              className={`w-6 h-6 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 ${
                                isSelected
                                  ? 'border-purple-400 bg-purple-600 text-white'
                                  : 'border-slate-700 text-slate-400'
                              }`}
                            >
                              {String.fromCharCode(65 + optIdx)}
                            </div>
                            <span className="text-xs sm:text-sm">{opt}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Quiz Navigation & Submit Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setCurrentQuestionIdx((prev) => Math.max(0, prev - 1))}
                disabled={currentQuestionIdx === 0}
                className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition inline-flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <div className="flex items-center gap-1.5">
                {activeQuiz.questions.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentQuestionIdx(idx)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition ${
                      currentQuestionIdx === idx
                        ? 'bg-purple-600 text-white'
                        : answers[activeQuiz.questions[idx].id] !== undefined
                        ? 'bg-purple-950/60 border border-purple-700 text-purple-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              {currentQuestionIdx < activeQuiz.questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentQuestionIdx((prev) => prev + 1)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-lg transition inline-flex items-center gap-1"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleAutoSubmit}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-md transition"
                >
                  Submit Quiz
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Review Answers Modal */}
      {reviewingAttempt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
              <div>
                <span className="text-xs font-semibold text-purple-400">Score Assessment</span>
                <h2 className="text-base font-bold text-white mt-0.5">{reviewingAttempt.quiz.title}</h2>
                <p className="text-xs text-emerald-400 font-bold mt-1">
                  You Scored: {reviewingAttempt.attempt.score} / {reviewingAttempt.quiz.totalMarks} Points
                </p>
              </div>
              <button
                onClick={() => setReviewingAttempt(null)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {reviewingAttempt.quiz.questions.map((q, idx) => {
                const userChoice = reviewingAttempt.attempt.selectedAnswers[q.id];
                const isCorrect = userChoice === q.correctOptionIndex;

                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-xl border space-y-2.5 ${
                      isCorrect
                        ? 'bg-emerald-950/30 border-emerald-800/40'
                        : 'bg-rose-950/30 border-rose-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300">Question {idx + 1}</span>
                      <span
                        className={`text-xs font-bold ${
                          isCorrect ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isCorrect ? `+${q.points} Points (Correct)` : '0 Points (Incorrect)'}
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-white">{q.question}</p>

                    <div className="space-y-1.5 pt-1 text-xs">
                      {q.options.map((opt, optIdx) => {
                        const isCorrectOpt = optIdx === q.correctOptionIndex;
                        const isUserOpt = optIdx === userChoice;

                        return (
                          <div
                            key={optIdx}
                            className={`p-2 rounded-lg flex items-center justify-between ${
                              isCorrectOpt
                                ? 'bg-emerald-900/40 text-emerald-200 border border-emerald-700/50'
                                : isUserOpt
                                ? 'bg-rose-900/40 text-rose-200 border border-rose-700/50'
                                : 'text-slate-400'
                            }`}
                          >
                            <span>
                              {String.fromCharCode(65 + optIdx)}. {opt}
                            </span>
                            {isCorrectOpt && (
                              <span className="text-[10px] font-bold text-emerald-400">
                                Correct Answer
                              </span>
                            )}
                            {!isCorrectOpt && isUserOpt && (
                              <span className="text-[10px] font-bold text-rose-400">
                                Your Answer
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
