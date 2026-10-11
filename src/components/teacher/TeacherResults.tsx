import React, { useState } from 'react';
import { useLms } from '../../context/LmsContext';
import { StudentResult } from '../../types/lms';
import {
  Award,
  Edit2,
  Save,
  Download,
  Users,
  CheckCircle2,
  X,
  Plus,
} from 'lucide-react';

export const TeacherResults: React.FC = () => {
  const {
    getCurrentFaculty,
    results,
    allocations,
    courses,
    students,
    updateStudentResult,
    showToast,
  } = useLms();

  const currentFaculty = getCurrentFaculty();
  const myAllocations = allocations.filter((a) => a.facultyId === currentFaculty?.id);

  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    myAllocations[0]?.courseId || courses[0]?.id || ''
  );
  const [selectedSection, setSelectedSection] = useState<string>(
    myAllocations[0]?.section || 'A'
  );

  const [editingResult, setEditingResult] = useState<StudentResult | null>(null);

  // Form State for editing marks
  const [asgScore, setAsgScore] = useState<number>(18);
  const [quizScore, setQuizScore] = useState<number>(18);
  const [midScore, setMidScore] = useState<number>(22);
  const [finalScore, setFinalScore] = useState<number>(30);
  const [remarks, setRemarks] = useState('');

  const activeCourse = courses.find((c) => c.id === selectedCourseId);

  // Results for current course & section
  const currentResults = results.filter(
    (r) => r.courseId === selectedCourseId && r.section === selectedSection
  );

  // Prepare full roster: if a student doesn't have a result record yet, synthesize one
  const completeRoster = students.map((stu) => {
    const existing = currentResults.find((r) => r.studentId === stu.id);
    if (existing) return existing;

    return {
      id: `res-synth-${stu.id}-${selectedCourseId}`,
      studentId: stu.id,
      courseId: selectedCourseId,
      section: selectedSection,
      sessionId: 'sess-1',
      assignmentsScore: 16,
      quizzesScore: 15,
      midtermScore: 20,
      finalExamScore: 28,
      totalScore: 79,
      gradeLetter: 'B',
      gpa: 3.0,
      remarks: 'Satisfactory academic performance.',
    } as StudentResult;
  });

  const openEditModal = (res: StudentResult) => {
    setEditingResult(res);
    setAsgScore(res.assignmentsScore);
    setQuizScore(res.quizzesScore);
    setMidScore(res.midtermScore);
    setFinalScore(res.finalExamScore);
    setRemarks(res.remarks || '');
  };

  const handleSaveMarks = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResult) return;

    updateStudentResult(editingResult.id, {
      assignmentsScore: Number(asgScore),
      quizzesScore: Number(quizScore),
      midtermScore: Number(midScore),
      finalExamScore: Number(finalScore),
      remarks,
    });

    setEditingResult(null);
  };

  const exportGradesCsv = () => {
    const headers = ['Roll No', 'Student Name', 'Assignments (/20)', 'Quizzes (/20)', 'Midterm (/25)', 'Final Exam (/35)', 'Total Score', 'Grade Letter', 'GPA'];
    const rows = completeRoster.map((r) => {
      const stu = students.find((s) => s.id === r.studentId);
      return [
        stu?.rollNo,
        stu?.name,
        r.assignmentsScore,
        r.quizzesScore,
        r.midtermScore,
        r.finalExamScore,
        r.totalScore,
        r.gradeLetter,
        r.gpa.toFixed(2),
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${activeCourse?.code}_Section_${selectedSection}_Results.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Grade sheet exported as CSV successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-400" />
            Class Results & Gradebook
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Manage evaluations across assignments (20%), quizzes (20%), midterm (25%), and final examination (35%).
          </p>
        </div>

        <button
          onClick={exportGradesCsv}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs sm:text-sm font-medium transition"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          Export Grade Sheet (CSV)
        </button>
      </div>

      {/* Select Course & Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4">
        <div className="w-full sm:w-80">
          <label className="block text-xs font-medium text-slate-400 mb-1">Select Course</label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            {myAllocations.map((alloc) => {
              const c = courses.find((item) => item.id === alloc.courseId);
              return (
                <option key={alloc.id} value={alloc.courseId}>
                  {c?.code} - {c?.title} (Sec {alloc.section})
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Section</label>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="A">Section A</option>
            <option value="B">Section B</option>
          </select>
        </div>
      </div>

      {/* Results Gradebook Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <h3 className="text-sm font-bold text-white">
            Grade Sheet · {activeCourse?.code}: {activeCourse?.title} (Sec {selectedSection})
          </h3>
          <span className="text-xs text-slate-400">{completeRoster.length} Enrolled Students</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-950/80 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Student Name & Roll No</th>
                <th className="py-3 px-4 font-semibold text-center">Assignments (20)</th>
                <th className="py-3 px-4 font-semibold text-center">Quizzes (20)</th>
                <th className="py-3 px-4 font-semibold text-center">Midterm (25)</th>
                <th className="py-3 px-4 font-semibold text-center">Final (35)</th>
                <th className="py-3 px-4 font-semibold text-center">Total (100)</th>
                <th className="py-3 px-4 font-semibold text-center">Grade</th>
                <th className="py-3 px-4 font-semibold text-center">GPA</th>
                <th className="py-3 px-4 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {completeRoster.map((res) => {
                const stu = students.find((s) => s.id === res.studentId);

                return (
                  <tr key={res.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-bold text-white">{stu?.name || 'Student'}</p>
                        <span className="font-mono text-xs text-slate-400">{stu?.rollNo}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center font-medium">
                      {res.assignmentsScore}
                    </td>

                    <td className="py-3.5 px-4 text-center font-medium">
                      {res.quizzesScore}
                    </td>

                    <td className="py-3.5 px-4 text-center font-medium">
                      {res.midtermScore}
                    </td>

                    <td className="py-3.5 px-4 text-center font-medium">
                      {res.finalExamScore}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="font-bold text-white text-sm">{res.totalScore}</span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`font-bold px-2.5 py-0.5 rounded text-xs ${
                          res.gradeLetter.startsWith('A')
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                            : res.gradeLetter.startsWith('B')
                            ? 'bg-blue-950/80 text-blue-300 border border-blue-800/60'
                            : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                        }`}
                      >
                        {res.gradeLetter}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-slate-200">
                      {res.gpa.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openEditModal(res)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-amber-400 hover:text-white bg-amber-500/10 hover:bg-amber-500/20 rounded transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit Marks
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Marks Modal */}
      {editingResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                Update Student Marks & Evaluation
              </h2>
              <button
                onClick={() => setEditingResult(null)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMarks} className="mt-4 space-y-4">
              <div>
                <span className="text-xs text-slate-400">Student:</span>
                <p className="text-sm font-bold text-white">
                  {students.find((s) => s.id === editingResult.studentId)?.name} (
                  {students.find((s) => s.id === editingResult.studentId)?.rollNo})
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Assignments (Max 20)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    required
                    value={asgScore}
                    onChange={(e) => setAsgScore(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Quizzes (Max 20)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    required
                    value={quizScore}
                    onChange={(e) => setQuizScore(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Midterm Exam (Max 25)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="25"
                    required
                    value={midScore}
                    onChange={(e) => setMidScore(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Final Exam (Max 35)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="35"
                    required
                    value={finalScore}
                    onChange={(e) => setFinalScore(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Instructor Remarks
                </label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Excellent grasp of algorithms."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Calculated Total:</span>
                <span className="text-base font-bold text-amber-400">
                  {Number(asgScore) + Number(quizScore) + Number(midScore) + Number(finalScore)} / 100
                </span>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingResult(null)}
                  className="px-4 py-2 text-xs sm:text-sm text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-lg shadow-md transition"
                >
                  Save & Compute GPA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
