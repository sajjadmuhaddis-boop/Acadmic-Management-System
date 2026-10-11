import React, { useState } from 'react';
import { useLms } from '../../context/LmsContext';
import { AcademicSession } from '../../types/lms';
import {
  Calendar,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Layers,
  X,
  AlertCircle,
} from 'lucide-react';
import { ConfirmModal } from '../common/ConfirmModal';

export const ManageSessions: React.FC = () => {
  const { sessions, allocations, addSession, updateSession, deleteSession, activeSessionId, setActiveSessionId } = useLms();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<AcademicSession | null>(null);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<AcademicSession['status']>('active');
  const [isCurrent, setIsCurrent] = useState(false);

  const openAddModal = () => {
    setEditingSession(null);
    setName('');
    setCode('');
    setStartDate('2026-02-01');
    setEndDate('2026-06-30');
    setStatus('upcoming');
    setIsCurrent(false);
    setIsModalOpen(true);
  };

  const openEditModal = (sess: AcademicSession) => {
    setEditingSession(sess);
    setName(sess.name);
    setCode(sess.code);
    setStartDate(sess.startDate);
    setEndDate(sess.endDate);
    setStatus(sess.status);
    setIsCurrent(sess.isCurrent);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    if (editingSession) {
      updateSession(editingSession.id, {
        name,
        code,
        startDate,
        endDate,
        status,
        isCurrent,
      });
    } else {
      addSession({
        name,
        code,
        startDate,
        endDate,
        status,
        isCurrent,
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
            <Calendar className="w-6 h-6 text-emerald-400" />
            Manage Academic Sessions
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Configure academic semesters, active intake terms, enrollment schedules, and session statuses.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-md shadow-emerald-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Academic Session
        </button>
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sessions.map((sess) => {
          const sessionAllocations = allocations.filter((a) => a.sessionId === sess.id);
          const isSelected = activeSessionId === sess.id;

          const statusBadge = {
            active: {
              label: 'Active Term',
              badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
            },
            upcoming: {
              label: 'Upcoming',
              badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
            },
            completed: {
              label: 'Completed',
              badge: 'bg-slate-700/50 text-slate-300 border-slate-600/50',
            },
            archived: {
              label: 'Archived',
              badge: 'bg-zinc-800 text-zinc-400 border-zinc-700',
            },
          }[sess.status];

          return (
            <div
              key={sess.id}
              className={`bg-slate-900 border rounded-xl p-5 flex flex-col justify-between transition-all ${
                isSelected
                  ? 'border-emerald-500/60 shadow-lg shadow-emerald-500/5 ring-1 ring-emerald-500/30'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                      {sess.code}
                    </span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${statusBadge.badge}`}>
                      {statusBadge.label}
                    </span>
                  </div>

                  {sess.isCurrent && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Current
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-white mt-3">{sess.name}</h3>

                <div className="mt-4 p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Start Date:</span>
                    <span className="text-slate-200 font-medium">{sess.startDate}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>End Date:</span>
                    <span className="text-slate-200 font-medium">{sess.endDate}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 pt-1.5 border-t border-slate-800/60">
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      Course Allocations:
                    </span>
                    <span className="text-emerald-400 font-bold">{sessionAllocations.length} Active</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => {
                    updateSession(sess.id, { isCurrent: true, status: 'active' });
                    setActiveSessionId(sess.id);
                  }}
                  disabled={sess.isCurrent}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                    sess.isCurrent
                      ? 'bg-slate-800/40 text-slate-500 cursor-default'
                      : 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30'
                  }`}
                >
                  {sess.isCurrent ? 'Current Global Session' : 'Set as Current'}
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(sess)}
                    className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded transition"
                    title="Edit Session"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingSessionId(sess.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition"
                    title="Delete Session"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                {editingSession ? 'Edit Academic Session' : 'Add New Academic Session'}
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
                  Session Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Fall 2025 or Spring 2026"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Session Code <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. FA25 or SP26"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Start Date <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    End Date <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as AcademicSession['status'])}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="active">Active</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isCurrentSess"
                  checked={isCurrent}
                  onChange={(e) => setIsCurrent(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-emerald-600 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="isCurrentSess" className="text-xs text-slate-300 cursor-pointer">
                  Designate as Current Active Academic Term
                </label>
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
                  className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-md shadow-emerald-600/20 transition"
                >
                  {editingSession ? 'Save Changes' : 'Create Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={Boolean(deletingSessionId)}
        title="Delete Academic Session"
        message="Are you sure you want to delete this session? Existing allocations tied to this session will also be updated."
        confirmLabel="Delete Session"
        onConfirm={() => {
          if (deletingSessionId) {
            deleteSession(deletingSessionId);
            setDeletingSessionId(null);
          }
        }}
        onCancel={() => setDeletingSessionId(null)}
      />
    </div>
  );
};
