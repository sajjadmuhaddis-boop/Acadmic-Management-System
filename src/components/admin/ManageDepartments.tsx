import React, { useState } from 'react';
import { useLms } from '../../context/LmsContext';
import { Department } from '../../types/lms';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Users,
  BookOpen,
  X,
} from 'lucide-react';
import { ConfirmModal } from '../common/ConfirmModal';

export const ManageDepartments: React.FC = () => {
  const { departments, courses, facultyList, addDepartment, updateDepartment, deleteDepartment } = useLms();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deletingDeptId, setDeletingDeptId] = useState<string | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [hod, setHod] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [building, setBuilding] = useState('');
  const [description, setDescription] = useState('');

  const openAddModal = () => {
    setEditingDept(null);
    setCode('');
    setName('');
    setHod('');
    setEmail('');
    setPhone('');
    setBuilding('');
    setDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (dept: Department) => {
    setEditingDept(dept);
    setCode(dept.code);
    setName(dept.name);
    setHod(dept.hod);
    setEmail(dept.email);
    setPhone(dept.phone);
    setBuilding(dept.building);
    setDescription(dept.description);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;

    if (editingDept) {
      updateDepartment(editingDept.id, {
        code,
        name,
        hod,
        email,
        phone,
        building,
        description,
      });
    } else {
      addDepartment({
        code,
        name,
        hod,
        email,
        phone,
        building,
        description,
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
            <Building2 className="w-6 h-6 text-amber-400" />
            Manage Academic Departments
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Oversee faculties, department heads, campus locations, and programs.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-md shadow-amber-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Department
        </button>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {departments.map((dept) => {
          const deptCourses = courses.filter((c) => c.departmentId === dept.id);
          const deptFaculty = facultyList.filter((f) => f.departmentId === dept.id);

          return (
            <div
              key={dept.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-xl p-5 flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-amber-950/40 text-amber-300 border border-amber-800/50">
                      {dept.code}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{deptCourses.length} Courses</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(dept)}
                      className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded transition"
                      title="Edit Department"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingDeptId(dept.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition"
                      title="Delete Department"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mt-3">{dept.name}</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{dept.description}</p>

                <div className="mt-4 p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Head of Department (HOD):</span>
                    <span className="text-slate-200 font-semibold">{dept.hod || 'Vacant'}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      Building / Wing:
                    </span>
                    <span className="text-slate-300">{dept.building || 'Campus Central'}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      Contact Email:
                    </span>
                    <span className="text-slate-300 truncate max-w-[200px]">{dept.email}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      Department Phone:
                    </span>
                    <span className="text-slate-300">{dept.phone}</span>
                  </div>
                </div>
              </div>

              {/* Department Statistics Footer */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-4 text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-slate-200 font-medium">{deptFaculty.length}</span> Faculty Members
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-slate-200 font-medium">{deptCourses.length}</span> Subjects
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-400" />
                {editingDept ? 'Update Department' : 'Create New Department'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Code <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. CS"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Department Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Computer Science & IT"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Head of Department (HOD)
                </label>
                <input
                  type="text"
                  value={hod}
                  onChange={(e) => setHod(e.target.value)}
                  placeholder="e.g. Prof. Dr. Rehman Metha"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Department Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="dept@university.edu"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Office Phone
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+92 300 0000000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Building Location / Wing
                </label>
                <input
                  type="text"
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                  placeholder="e.g. Turing Block, 3rd Floor"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Department focus and research domains..."
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
                  {editingDept ? 'Save Changes' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={Boolean(deletingDeptId)}
        title="Delete Department"
        message="Are you sure you want to delete this department? Courses and faculty under this department should be reassigned."
        confirmLabel="Delete Department"
        onConfirm={() => {
          if (deletingDeptId) {
            deleteDepartment(deletingDeptId);
            setDeletingDeptId(null);
          }
        }}
        onCancel={() => setDeletingDeptId(null)}
      />
    </div>
  );
};
