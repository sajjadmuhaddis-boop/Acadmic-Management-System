import React, { useState } from 'react';
import { useLms } from '../../context/LmsContext';
import { LectureMaterial } from '../../types/lms';
import {
  FolderDown,
  Plus,
  Edit2,
  Trash2,
  FileText,
  FileCode,
  Video,
  Presentation,
  ExternalLink,
  X,
  Layers,
} from 'lucide-react';
import { ConfirmModal } from '../common/ConfirmModal';

export const TeacherLectureMaterial: React.FC = () => {
  const {
    getCurrentFaculty,
    lectureMaterials,
    allocations,
    courses,
    addLectureMaterial,
    updateLectureMaterial,
    deleteLectureMaterial,
  } = useLms();

  const currentFaculty = getCurrentFaculty();
  const myAllocations = allocations.filter((a) => a.facultyId === currentFaculty?.id);
  const myMaterials = lectureMaterials.filter((m) => m.facultyId === currentFaculty?.id);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMat, setEditingMat] = useState<LectureMaterial | null>(null);
  const [deletingMatId, setDeletingMatId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState(myAllocations[0]?.courseId || courses[0]?.id || '');
  const [section, setSection] = useState(myAllocations[0]?.section || 'A');
  const [week, setWeek] = useState(1);
  const [moduleName, setModuleName] = useState('Module 1: Foundations');
  const [description, setDescription] = useState('');
  const [resourceType, setResourceType] = useState<LectureMaterial['resourceType']>('slides');
  const [fileSize, setFileSize] = useState('3.5 MB PDF');
  const [downloadUrl, setDownloadUrl] = useState('#');

  const openAddModal = () => {
    setEditingMat(null);
    setTitle('');
    setCourseId(myAllocations[0]?.courseId || courses[0]?.id || '');
    setSection(myAllocations[0]?.section || 'A');
    setWeek(1);
    setModuleName('Module 1: Foundations');
    setDescription('');
    setResourceType('slides');
    setFileSize('4.2 MB PDF');
    setDownloadUrl('#');
    setIsModalOpen(true);
  };

  const openEditModal = (mat: LectureMaterial) => {
    setEditingMat(mat);
    setTitle(mat.title);
    setCourseId(mat.courseId);
    setSection(mat.section);
    setWeek(mat.week);
    setModuleName(mat.moduleName);
    setDescription(mat.description);
    setResourceType(mat.resourceType);
    setFileSize(mat.fileSize || '3.0 MB');
    setDownloadUrl(mat.downloadUrl || '#');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !courseId) return;

    if (editingMat) {
      updateLectureMaterial(editingMat.id, {
        title,
        courseId,
        section,
        week: Number(week),
        moduleName,
        description,
        resourceType,
        fileSize,
        downloadUrl,
      });
    } else {
      addLectureMaterial({
        title,
        courseId,
        section,
        facultyId: currentFaculty?.id || 'fac-1',
        week: Number(week),
        moduleName,
        description,
        resourceType,
        fileSize,
        downloadUrl,
      });
    }

    setIsModalOpen(false);
  };

  const getResourceIcon = (type: LectureMaterial['resourceType']) => {
    switch (type) {
      case 'slides':
        return <Presentation className="w-5 h-5 text-indigo-400" />;
      case 'video':
        return <Video className="w-5 h-5 text-rose-400" />;
      case 'pdf':
        return <FileText className="w-5 h-5 text-emerald-400" />;
      default:
        return <FileCode className="w-5 h-5 text-sky-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FolderDown className="w-6 h-6 text-indigo-400" />
            Course Content & Lecturing Material
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Publish weekly syllabus handouts, lecture slides, code repositories, and recorded media.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Upload Lecture Resource
        </button>
      </div>

      {/* Materials List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {myMaterials.map((mat) => {
          const course = courses.find((c) => c.id === mat.courseId);

          return (
            <div
              key={mat.id}
              className="bg-slate-900 border border-slate-800 hover:border-indigo-500/40 rounded-xl p-5 flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      {getResourceIcon(mat.resourceType)}
                    </div>
                    <div>
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/60">
                        {course?.code}
                      </span>
                      <span className="text-xs text-slate-400 ml-2 font-medium">
                        Week {mat.week}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(mat)}
                      className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded transition"
                      title="Edit Material"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingMatId(mat.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition"
                      title="Delete Material"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-3">
                  <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">
                    {mat.moduleName}
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5 leading-snug">{mat.title}</h3>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {mat.description}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="capitalize">{mat.resourceType} · {mat.fileSize}</span>
                <span>Uploaded: {mat.uploadedAt}</span>
              </div>
            </div>
          );
        })}

        {myMaterials.length === 0 && (
          <div className="col-span-full py-12 text-center bg-slate-900 border border-slate-800 rounded-xl">
            <FolderDown className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="text-sm text-slate-300 font-medium">No lecture materials uploaded yet</p>
            <p className="text-xs text-slate-500 mt-1">Upload lecture slides and reading guides for your students.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <FolderDown className="w-4 h-4 text-indigo-400" />
                {editingMat ? 'Edit Lecture Material' : 'Upload Lecture Resource'}
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
                  Lecture Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Lecture 04: AVL Trees & Rotations"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
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
                    Week Number
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="16"
                    value={week}
                    onChange={(e) => setWeek(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Module Name
                  </label>
                  <input
                    type="text"
                    value={moduleName}
                    onChange={(e) => setModuleName(e.target.value)}
                    placeholder="e.g. Module 2: Trees"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Resource Type
                  </label>
                  <select
                    value={resourceType}
                    onChange={(e) => setResourceType(e.target.value as LectureMaterial['resourceType'])}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="slides">Lecture Slides (PPT / PDF)</option>
                    <option value="notes">Reading Notes / Handouts</option>
                    <option value="pdf">Reference Paper / E-Book</option>
                    <option value="video">Recorded Video Lecture</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Topics Covered & Summary
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summary of algorithms and concepts discussed in this session..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
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
                  className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md shadow-indigo-600/20 transition"
                >
                  {editingMat ? 'Save Changes' : 'Publish Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={Boolean(deletingMatId)}
        title="Delete Lecture Material"
        message="Are you sure you want to delete this lecture material resource?"
        confirmLabel="Delete Material"
        onConfirm={() => {
          if (deletingMatId) {
            deleteLectureMaterial(deletingMatId);
            setDeletingMatId(null);
          }
        }}
        onCancel={() => setDeletingMatId(null)}
      />
    </div>
  );
};
