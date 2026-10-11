import React, { useState } from 'react';
import { useLms } from '../../context/LmsContext';
import { Faculty } from '../../types/lms';
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Mail,
  Phone,
  Building,
  GraduationCap,
  Layers,
  X,
  MapPin,
} from 'lucide-react';
import { ConfirmModal } from '../common/ConfirmModal';

export const ManageFaculty: React.FC = () => {
  const { facultyList, departments, allocations, courses, addFaculty, updateFaculty, deleteFaculty } = useLms();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [deletingFacultyId, setDeletingFacultyId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || '');
  const [designation, setDesignation] = useState<Faculty['designation']>('Assistant Professor');
  const [qualification, setQualification] = useState('');
  const [officeRoom, setOfficeRoom] = useState('');
  const [specialization, setSpecialization] = useState('');

  const designations: Faculty['designation'][] = [
    'Professor',
    'Associate Professor',
    'Assistant Professor',
    'Lecturer',
    'Dean',
  ];

  const openAddModal = () => {
    setEditingFaculty(null);
    setName('');
    setEmployeeId(`EMP-${Math.floor(1000 + Math.random() * 9000)}`);
    setEmail('');
    setPhone('');
    setDepartmentId(departments[0]?.id || '');
    setDesignation('Assistant Professor');
    setQualification('Ph.D. / M.S.');
    setOfficeRoom('Turing Block Room 201');
    setSpecialization('');
    setIsModalOpen(true);
  };

  const openEditModal = (fac: Faculty) => {
    setEditingFaculty(fac);
    setName(fac.name);
    setEmployeeId(fac.employeeId);
    setEmail(fac.email);
    setPhone(fac.phone);
    setDepartmentId(fac.departmentId);
    setDesignation(fac.designation);
    setQualification(fac.qualification);
    setOfficeRoom(fac.officeRoom);
    setSpecialization(fac.specialization);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !employeeId.trim()) return;

    if (editingFaculty) {
      updateFaculty(editingFaculty.id, {
        name,
        employeeId,
        email,
        phone,
        departmentId,
        designation,
        qualification,
        officeRoom,
        specialization,
      });
    } else {
      addFaculty({
        name,
        employeeId,
        email,
        phone,
        departmentId,
        designation,
        qualification,
        officeRoom,
        specialization,
        avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 1000000)}?w=150&auto=format&fit=crop&q=80`,
      });
    }

    setIsModalOpen(false);
  };

  const filteredFaculty = facultyList.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.specialization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDeptId === 'all' || f.departmentId === selectedDeptId;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-400" />
            Manage Faculty Members
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Maintain professorial appointments, qualifications, academic departments, and course assignments.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Faculty Member
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
            placeholder="Search by instructor name, employee ID, or specialization..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedDeptId}
            onChange={(e) => setSelectedDeptId(e.target.value)}
            className="bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">All Departments ({facultyList.length})</option>
            {departments.map((dept) => {
              const count = facultyList.filter((f) => f.departmentId === dept.id).length;
              return (
                <option key={dept.id} value={dept.id}>
                  {dept.code} - {dept.name} ({count})
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Faculty Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredFaculty.map((fac) => {
          const dept = departments.find((d) => d.id === fac.departmentId);
          const facAllocations = allocations.filter((a) => a.facultyId === fac.id);

          return (
            <div
              key={fac.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-xl p-5 flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-indigo-900/50 border border-indigo-700/40 shrink-0 flex items-center justify-center">
                      {fac.avatar ? (
                        <img src={fac.avatar} alt={fac.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-bold text-white text-base">{fac.name.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white leading-snug">{fac.name}</h3>
                      <p className="text-xs text-indigo-400 font-medium">{fac.designation}</p>
                      <span className="text-[10px] text-slate-400 font-mono">{fac.employeeId}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(fac)}
                      className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded transition"
                      title="Edit Faculty"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingFacultyId(fac.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition"
                      title="Delete Faculty"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-500" />
                      Department:
                    </span>
                    <span className="text-slate-200 font-medium">{dept?.code}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                      Qualification:
                    </span>
                    <span className="text-slate-200 truncate max-w-[170px]">{fac.qualification}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      Office:
                    </span>
                    <span className="text-slate-200">{fac.officeRoom}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      Email:
                    </span>
                    <span className="text-slate-200 truncate max-w-[170px]">{fac.email}</span>
                  </div>
                </div>

                {/* Assigned Courses List */}
                <div className="mt-3">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Assigned Courses ({facAllocations.length})
                  </span>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {facAllocations.map((alloc) => {
                      const c = courses.find((item) => item.id === alloc.courseId);
                      return (
                        <span
                          key={alloc.id}
                          className="text-[11px] px-2 py-0.5 rounded bg-indigo-950/40 border border-indigo-800/40 text-indigo-300"
                        >
                          {c?.code} (Sec {alloc.section})
                        </span>
                      );
                    })}
                    {facAllocations.length === 0 && (
                      <span className="text-xs text-slate-400 italic">No courses currently allocated</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                {editingFaculty ? 'Update Faculty Member' : 'Register New Faculty Member'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4 overflow-y-auto flex-1 pr-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Rehman Metha"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Employee ID <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="EMP-1001"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Department <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
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
                    Designation <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value as Faculty['designation'])}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    {designations.map((des) => (
                      <option key={des} value={des}>{des}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="faculty@university.edu"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Highest Qualification
                </label>
                <input
                  type="text"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  placeholder="e.g. Ph.D. in Computer Science"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Office Room
                  </label>
                  <input
                    type="text"
                    value={officeRoom}
                    onChange={(e) => setOfficeRoom(e.target.value)}
                    placeholder="e.g. Turing Block Room 301"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Specialization
                  </label>
                  <input
                    type="text"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    placeholder="e.g. Distributed Systems, AI"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
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
                  {editingFaculty ? 'Save Changes' : 'Register Faculty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={Boolean(deletingFacultyId)}
        title="Remove Faculty Member"
        message="Are you sure you want to remove this faculty member? Existing course allocations will be cleared."
        confirmLabel="Remove Faculty"
        onConfirm={() => {
          if (deletingFacultyId) {
            deleteFaculty(deletingFacultyId);
            setDeletingFacultyId(null);
          }
        }}
        onCancel={() => setDeletingFacultyId(null)}
      />
    </div>
  );
};
