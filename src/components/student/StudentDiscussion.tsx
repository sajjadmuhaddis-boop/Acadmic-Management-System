import React, { useState } from 'react';
import { useLms } from '../../context/LmsContext';
import { DiscussionThread } from '../../types/lms';
import {
  MessagesSquare,
  Send,
  UserCheck,
  ShieldCheck,
  BookOpen,
  Plus,
  Clock,
  CheckCircle2,
  X,
  MessageCircle,
} from 'lucide-react';

export const StudentDiscussion: React.FC = () => {
  const {
    getCurrentStudent,
    discussions,
    facultyList,
    courses,
    allocations,
    createDiscussionThread,
    replyToDiscussion,
    toggleDiscussionStatus,
  } = useLms();

  const currentStudent = getCurrentStudent();

  // Active recipient filter / mode: 'all' | 'teacher' | 'admin'
  const [recipientTab, setRecipientTab] = useState<'all' | 'teacher' | 'admin'>('all');
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(discussions[0]?.id || null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  // New message form state
  const [composeType, setComposeType] = useState<'teacher' | 'admin'>('teacher');
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>(facultyList[0]?.id || '');
  const [subject, setSubject] = useState('');
  const [messageText, setMessageText] = useState('');

  // Reply state
  const [replyText, setReplyText] = useState('');

  // Filtered threads for this student
  const studentThreads = discussions.filter((t) => {
    const isMine = t.studentId === currentStudent?.id;
    if (!isMine) return false;
    if (recipientTab === 'all') return true;
    return t.recipientType === recipientTab;
  });

  const activeThread = discussions.find((t) => t.id === selectedThreadId) || studentThreads[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !messageText.trim()) return;

    if (composeType === 'teacher') {
      const faculty = facultyList.find((f) => f.id === selectedFacultyId);
      const alloc = allocations.find((a) => a.facultyId === selectedFacultyId);

      createDiscussionThread({
        recipientType: 'teacher',
        recipientId: selectedFacultyId,
        recipientName: faculty?.name || 'Course Instructor',
        courseId: alloc?.courseId,
        subject,
        message: messageText,
      });
    } else {
      createDiscussionThread({
        recipientType: 'admin',
        recipientId: 'admin-office',
        recipientName: 'Institutional Administration Office',
        subject,
        message: messageText,
      });
    }

    setSubject('');
    setMessageText('');
    setIsComposeOpen(false);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeThread) return;

    replyToDiscussion(activeThread.id, replyText);
    setReplyText('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <MessagesSquare className="w-6 h-6 text-indigo-400" />
            Discussion & Support Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Two direct messaging channels: Message your <span className="text-indigo-400 font-semibold">Teacher</span> for academic queries or contact the <span className="text-blue-400 font-semibold">Administrator</span> for official office requests.
          </p>
        </div>

        <button
          onClick={() => {
            setComposeType('teacher');
            setIsComposeOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Start New Conversation
        </button>
      </div>

      {/* Recipient Channel Selector Pills (Teacher vs Admin vs All) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 mr-1 hidden sm:inline">Channel:</span>

          <button
            onClick={() => setRecipientTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              recipientTab === 'all'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            All Threads ({discussions.filter((t) => t.studentId === currentStudent?.id).length})
          </button>

          <button
            onClick={() => setRecipientTab('teacher')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              recipientTab === 'teacher'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-indigo-300 hover:text-white hover:bg-indigo-950/40'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Option 1: Teacher Messages
          </button>

          <button
            onClick={() => setRecipientTab('admin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              recipientTab === 'admin'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-blue-300 hover:text-white hover:bg-blue-950/40'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Option 2: Admin Messages
          </button>
        </div>

        <span className="text-[11px] text-slate-500 hidden md:block">
          Select either channel to start direct two-way inquiry
        </span>
      </div>

      {/* Main Two-Pane Chat / Thread Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
        {/* Left Pane: Conversation Threads List (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden max-h-[600px]">
          <div className="p-3.5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Conversations ({studentThreads.length})
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
            {studentThreads.map((thread) => {
              const isSelected = activeThread?.id === thread.id;
              const isTeacher = thread.recipientType === 'teacher';

              return (
                <div
                  key={thread.id}
                  onClick={() => setSelectedThreadId(thread.id)}
                  className={`p-3.5 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-950/40 border-l-4 border-indigo-500'
                      : 'hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isTeacher
                          ? 'bg-indigo-950 text-indigo-300 border border-indigo-800/60'
                          : 'bg-blue-950 text-blue-300 border border-blue-800/60'
                      }`}
                    >
                      {isTeacher ? 'Teacher Query' : 'Admin Query'}
                    </span>

                    <span
                      className={`text-[10px] font-semibold ${
                        thread.status === 'resolved' ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {thread.status === 'resolved' ? 'Resolved' : 'Active Thread'}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white mt-2 line-clamp-1 leading-snug">
                    {thread.subject}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    {thread.message}
                  </p>

                  <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-500">
                    <span className="truncate max-w-[130px] font-medium text-slate-300">
                      To: {thread.recipientName}
                    </span>
                    <span>{thread.replies.length} Replies</span>
                  </div>
                </div>
              );
            })}

            {studentThreads.length === 0 && (
              <div className="py-12 text-center text-slate-500 text-xs p-4">
                No discussion threads found in this channel. Click 'Start New Conversation' to send a message.
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Active Thread Chat View (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl flex flex-col justify-between overflow-hidden max-h-[600px]">
          {activeThread ? (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        activeThread.recipientType === 'teacher'
                          ? 'bg-indigo-950 text-indigo-300 border border-indigo-800/60'
                          : 'bg-blue-950 text-blue-300 border border-blue-800/60'
                      }`}
                    >
                      {activeThread.recipientType === 'teacher' ? 'Course Instructor' : 'Administrator'}
                    </span>
                    <span className="text-xs text-slate-400 truncate font-medium">
                      Recipient: {activeThread.recipientName}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1 truncate">{activeThread.subject}</h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleDiscussionStatus(activeThread.id)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold border transition ${
                      activeThread.status === 'resolved'
                        ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-300'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                    }`}
                  >
                    {activeThread.status === 'resolved' ? 'Mark as Open' : 'Mark Resolved'}
                  </button>
                </div>
              </div>

              {/* Chat Messages Stream */}
              <div className="p-4 overflow-y-auto flex-1 space-y-4">
                {/* Initial Student Message */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {activeThread.studentName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{activeThread.studentName}</span>
                      <span className="text-[10px] text-slate-400">{activeThread.createdAt}</span>
                    </div>
                    <div className="mt-1 p-3 rounded-xl rounded-tl-none bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed">
                      {activeThread.message}
                    </div>
                  </div>
                </div>

                {/* Follow-up Replies Stream */}
                {activeThread.replies.map((reply) => {
                  const isStudentReply = reply.senderRole === 'student';
                  const isTeacherReply = reply.senderRole === 'teacher';

                  return (
                    <div
                      key={reply.id}
                      className={`flex items-start gap-3 ${isStudentReply ? '' : 'flex-row-reverse'}`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center shrink-0 text-white ${
                          isStudentReply
                            ? 'bg-emerald-600'
                            : isTeacherReply
                            ? 'bg-indigo-600'
                            : 'bg-blue-600'
                        }`}
                      >
                        {reply.senderName.charAt(0)}
                      </div>

                      <div className={`flex-1 ${isStudentReply ? '' : 'text-right'}`}>
                        <div
                          className={`flex items-center gap-2 ${
                            isStudentReply ? '' : 'justify-end'
                          }`}
                        >
                          <span className="text-xs font-bold text-white">{reply.senderName}</span>
                          <span className="text-[10px] text-slate-400">{reply.timestamp}</span>
                        </div>
                        <div
                          className={`mt-1 p-3 rounded-xl text-xs leading-relaxed text-left inline-block max-w-xl ${
                            isStudentReply
                              ? 'rounded-tl-none bg-slate-950 border border-slate-800 text-slate-200'
                              : isTeacherReply
                              ? 'rounded-tr-none bg-indigo-950/70 border border-indigo-800/70 text-indigo-100'
                              : 'rounded-tr-none bg-blue-950/70 border border-blue-800/70 text-blue-100'
                          }`}
                        >
                          {reply.message}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat Input Box */}
              <form
                onSubmit={handleSendReply}
                className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Write your response to ${activeThread.recipientName}...`}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
              <MessagesSquare className="w-12 h-12 text-slate-700 mb-2" />
              <p className="text-sm text-slate-300 font-medium">No conversation selected</p>
              <p className="text-xs text-slate-500 mt-1">
                Select a thread from the list or start a new message to a teacher or administrator.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Compose New Message Modal (With Explicit 2 Options: Teacher vs Admin) */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-semibold text-indigo-400">Direct Message</span>
                <h2 className="text-base font-bold text-white mt-0.5">Contact Faculty or Administration</h2>
              </div>
              <button
                onClick={() => setIsComposeOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendMessage} className="mt-4 space-y-4 overflow-y-auto flex-1">
              {/* The 2 options required by the user */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Select Whom You Wish to Message (2 Options):
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setComposeType('teacher')}
                    className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                      composeType === 'teacher'
                        ? 'bg-indigo-950/80 border-indigo-500 text-white ring-1 ring-indigo-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <BookOpen className="w-5 h-5 text-indigo-400 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-white">Option 1: Teacher</p>
                      <span className="text-[10px] text-slate-400">Course & subject doubts</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setComposeType('admin')}
                    className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                      composeType === 'admin'
                        ? 'bg-blue-950/80 border-blue-500 text-white ring-1 ring-blue-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-white">Option 2: Administrator</p>
                      <span className="text-[10px] text-slate-400">Dean & Registrar Office</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* If Teacher, select faculty member */}
              {composeType === 'teacher' ? (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Select Course Instructor <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={selectedFacultyId}
                    onChange={(e) => setSelectedFacultyId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    {facultyList.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.designation})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-800/40 text-xs text-blue-200">
                  <p className="font-semibold text-blue-300">Office of Registrar & Academic Dean</p>
                  <p className="text-[11px] text-blue-200/80 mt-0.5">
                    Handles timetable clash resolutions, attendance adjustments, enrollment, and campus admin tickets.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Query Subject <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={
                    composeType === 'teacher'
                      ? 'e.g. Query regarding AVL Tree rotation code in Assignment 1'
                      : 'e.g. Request to resolve schedule conflict on Thursday'
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Detailed Message <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Explain your inquiry clearly with relevant details..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  className="px-4 py-2 text-xs sm:text-sm text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md shadow-indigo-600/20 transition flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Dispatch Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
