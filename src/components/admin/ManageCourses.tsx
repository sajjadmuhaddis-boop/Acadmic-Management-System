import React, { useState } from 'react';
import { useLms } from '../../context/LmsContext';
import { Course } from '../../types/lms';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  X,
  Layers,
  GraduationCap,
  Building,
} from 'lucide-react';
import { ConfirmModal } from '../common/ConfirmModal';

export const ManageCourses: React.FC = () => {
  const { courses, departments, facultyList, allocations, addCourse, updateCourse, deleteCourse } = useLms();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [viewingCourse, setViewingCourse] = useState<Course | null>(null);
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || '');
  const [credits, setCredits] = useState(3);
  const [semester, setSemester] = useState(1);
  const [description, setDescription] = useState('');
  const [prerequisites, setPrerequisites] = useState('');
  const [syllabusInput, setSyllabusInput] = useState('');

  const openAddModal = () => {
    setEditingCourse(null);
    setCode('');
    setTitle('');
    setDepartmentId(departments[0]?.id || '');
    setCredits(3);
    setSemester(1);
    setDescription('');
    setPrerequisites('None');
    setSyllabusInput('');
    setIsModalOpen(true);
  };

  const openEditModal = (course: Course) => {
    setEditingCourse(course);
    setCode(course.code);
    setTitle(course.title);
    setDepartmentId(course.departmentId);
    setCredits(course.credits);
    setSemester(course.semester);
    setDescription(course.description);
    setPrerequisites(course.prerequisites);
    setSyllabusInput(course.syllabusTopics.join('\n'));
    setIsModalOpen(true);
  };

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !title.trim()) return;

    const syllabusTopics = syllabusInput
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingCourse) {
      updateCourse(editingCourse.id, {
        code,
        title,
        departmentId,
        credits: Number(credits),
        semester: Number(semester),
        description,
        prerequisites,
        syllabusTopics: syllabusTopics.length ? syllabusTopics : ['Foundational Core Concepts'],
      });
    } else {
      addCourse({
        code,
        title,
        departmentId,
        credits: Number(credits),
        semester: Number(semester),
        description,
        prerequisites,
        syllabusTopics: syllabusTopics.length ? syllabusTopics : ['Foundational Core Concepts'],
      });
    }

    setIsModalOpen(false);
  };

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDeptId === 'all' || c.departmentId === selectedDeptId;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-400" />
            Manage Courses
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Create, update, view, and organize institutional degree courses and curricula.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-md shadow-blue-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add New Course
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by course code (e.g. CS-301) or title..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedDeptId}
            onChange={(e) => setSelectedDeptId(e.target.value)}
            className="bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="all">All Departments ({courses.length})</option>
            {departments.map((dept) => {
              const count = courses.filter((c) => c.departmentId === dept.id).length;
              return (
                <option key={dept.id} value={dept.id}>
                  {dept.code} - {dept.name} ({count})
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Courses Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCourses.map((course) => {
          const dept = departments.find((d) => d.id === course.departmentId);
          const allocatedList = allocations.filter((a) => a.courseId === course.id);

          return (
            <div
              key={course.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-xl p-5 flex flex-col justify-between transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-900/40 border border-blue-700/50 text-blue-300">
                      {course.code}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">
                      {course.credits} Credits
                    </span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60">
                    Semester {course.semester}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-white mt-3 leading-snug group-hover:text-blue-300 transition-colors">
                  {course.title}
                </h3>

                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {course.description}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{dept?.name || 'Department'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      Allocations:{' '}
                      <span className="text-slate-200 font-medium">
                        {allocatedList.length > 0 ? `${allocatedList.length} Section(s)` : 'Unallocated'}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => setViewingCourse(course)}
                  className="text-xs text-slate-300 hover:text-white inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 transition"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Details
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(course)}
                    className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded transition"
                    title="Edit Course"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingCourseId(course.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition"
                    title="Delete Course"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredCourses.length === 0 && (
          <div className="col-span-full py-12 text-center bg-slate-900 border border-slate-800 rounded-xl">
            <BookOpen className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="text-sm text-slate-300 font-medium">No courses found</p>
            <p className="text-xs text-slate-500 mt-1">Try searching with a different keyword or create a course.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-400" />
                {editingCourse ? 'Update Course Details' : 'Add New Academic Course'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Course Code <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. CS-301"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Credit Hours <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    required
                    value={credits}
                    onChange={(e) => setCredits(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Course Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Data Structures & Algorithms"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Department <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.code} - {d.name}
                      </option>
                    ))}
                  </select>
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Prerequisites
                </label>
                <input
                  type="text"
                  value={prerequisites}
                  onChange={(e) => setPrerequisites(e.target.value)}
                  placeholder="e.g. CS-201 (Object Oriented Programming) or None"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Course Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide an overview of the curriculum goals..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Key Syllabus Topics (One per line)
                </label>
                <textarea
                  rows={3}
                  value={syllabusInput}
                  onChange={(e) => setSyllabusInput(e.target.value)}
                  placeholder="Asymptotic Analysis & Big-O&#10;Binary Search Trees&#10;Graph Algorithms"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs sm:text-sm text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-md shadow-blue-500/20 transition"
                >
                  {editingCourse ? 'Save Changes' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Course Details Modal */}
      {viewingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6">
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-900/40 border border-blue-700/50 text-blue-300">
                  {viewingCourse.code}
                </span>
                <h2 className="text-lg font-bold text-white mt-2">{viewingCourse.title}</h2>
              </div>
              <button
                onClick={() => setViewingCourse(null)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div>
                  <span className="text-slate-400 text-xs">Credit Hours:</span>
                  <p className="font-semibold text-white">{viewingCourse.credits} Cr. Hrs</p>
                </div>
                <div>
                  <span className="text-slate-400 text-xs">Semester:</span>
                  <p className="font-semibold text-white">Semester {viewingCourse.semester}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-xs">Prerequisites:</span>
                  <p className="font-semibold text-white">{viewingCourse.prerequisites || 'None'}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-xs">Department:</span>
                  <p className="font-semibold text-white truncate">
                    {departments.find((d) => d.id === viewingCourse.departmentId)?.name}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Description
                </h4>
                <p className="text-slate-300 mt-1 leading-relaxed text-xs">
                  {viewingCourse.description}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Syllabus Modules & Topics
                </h4>
                <ul className="mt-2 space-y-1.5 list-disc list-inside text-xs text-slate-300">
                  {viewingCourse.syllabusTopics.map((topic, i) => (
                    <li key={i}>{topic}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setViewingCourse(null)}
                className="px-4 py-2 text-xs sm:text-sm text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={Boolean(deletingCourseId)}
        title="Delete Course"
        message="Are you sure you want to permanently delete this course? All associated allocations and timetable slots will also be removed."
        confirmLabel="Delete Course"
        onConfirm={() => {
          if (deletingCourseId) {
            deleteCourse(deletingCourseId);
            setDeletingCourseId(null);
          }
        }}
        onCancel={() => setDeletingCourseId(null)}
      />
    </div>
  );
};
