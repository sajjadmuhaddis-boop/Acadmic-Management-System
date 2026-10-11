import React, { useState } from 'react';
import { useLms } from '../../context/LmsContext';
import { LectureMaterial } from '../../types/lms';
import {
  FolderDown,
  Presentation,
  FileText,
  FileCode,
  Video,
  Download,
  ExternalLink,
  Filter,
  Eye,
  X,
} from 'lucide-react';

export const StudentLectureMaterial: React.FC = () => {
  const { getCurrentStudent, lectureMaterials, courses, allocations, showToast } = useLms();
  const currentStudent = getCurrentStudent();

  const myAllocations = allocations.filter((a) => a.section === currentStudent?.section);
  const myCourseIds = new Set(myAllocations.map((a) => a.courseId));
  const myCourses = courses.filter((c) => myCourseIds.has(c.id));

  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');
  const [previewMaterial, setPreviewMaterial] = useState<LectureMaterial | null>(null);

  const filteredMaterials = lectureMaterials.filter((mat) => {
    const isEnrolled = myCourseIds.has(mat.courseId);
    if (!isEnrolled) return false;
    if (selectedCourseFilter === 'all') return true;
    return mat.courseId === selectedCourseFilter;
  });

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

  const handleDownload = (mat: LectureMaterial) => {
    showToast(`Downloading "${mat.title}" (${mat.fileSize || 'PDF Document'})...`, 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FolderDown className="w-6 h-6 text-indigo-400" />
            Lecture Materials & Course Slides
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Access slides, handouts, and revision resources uploaded by course instructors.
          </p>
        </div>

        {/* Course Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">All Enrolled Courses</option>
            {myCourses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} - {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredMaterials.map((mat) => {
          const course = courses.find((c) => c.id === mat.courseId);

          return (
            <div
              key={mat.id}
              className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-5 flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 shrink-0">
                      {getResourceIcon(mat.resourceType)}
                    </div>
                    <div>
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/60">
                        {course?.code}
                      </span>
                      <span className="text-xs text-slate-400 ml-2 font-medium">Week {mat.week}</span>
                    </div>
                  </div>

                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-2 py-0.5 rounded bg-slate-800">
                    {mat.resourceType}
                  </span>
                </div>

                <div className="mt-3">
                  <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">
                    {mat.moduleName}
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5 leading-snug">{mat.title}</h3>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">{mat.description}</p>
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {mat.fileSize} · Uploaded: {mat.uploadedAt}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewMaterial(mat)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
                    title="Quick Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDownload(mat)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredMaterials.length === 0 && (
          <div className="col-span-full py-12 text-center bg-slate-900 border border-slate-800 rounded-xl">
            <FolderDown className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="text-sm text-slate-300 font-medium">No lecture materials found for this subject</p>
            <p className="text-xs text-slate-500 mt-1">Instructor has not uploaded resources yet.</p>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Presentation className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-bold text-white truncate max-w-sm">
                  {previewMaterial.title}
                </h2>
              </div>
              <button
                onClick={() => setPreviewMaterial(null)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs sm:text-sm">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Curriculum Module:</span>
                  <span className="text-slate-200 font-semibold">{previewMaterial.moduleName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Week Scheduled:</span>
                  <span className="text-slate-200">Week {previewMaterial.week}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">File Type & Size:</span>
                  <span className="text-slate-200">{previewMaterial.fileSize}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Topic Description & Reading Guide
                </h4>
                <p className="text-slate-300 leading-relaxed text-xs">
                  {previewMaterial.description}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-center">
                <p className="text-xs text-indigo-200 font-medium">
                  Verified institutional courseware document ready for offline studying.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                onClick={() => setPreviewMaterial(null)}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  handleDownload(previewMaterial);
                  setPreviewMaterial(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition inline-flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download Resource
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
