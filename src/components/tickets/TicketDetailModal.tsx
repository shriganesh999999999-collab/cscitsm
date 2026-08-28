import React, { useState } from 'react';
import {
  X,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  Shield,
  MessageSquare,
  Lock,
  ListTodo,
  Paperclip,
  HardDrive,
  History,
  CheckSquare,
  ArrowUpRight,
  Send,
  Plus,
  BookOpen,
  CornerDownRight,
  Flame,
  Layers,
  ChevronRight,
  Building,
  MapPin,
} from 'lucide-react';
import {
  Ticket,
  TicketStatus,
  Priority,
  User as UserType,
  AssignmentGroup,
  Asset,
} from '../../types/itsm';

interface TicketDetailModalProps {
  ticket: Ticket | null;
  onClose: () => void;
  currentUser: UserType;
  assignmentGroups: AssignmentGroup[];
  technicians: UserType[];
  assets: Asset[];
  onAssign: (ticketId: string, groupId?: string, techId?: string) => Promise<void>;
  onUpdateStatus: (ticketId: string, status: TicketStatus, comment?: string) => Promise<void>;
  onAddComment: (ticketId: string, content: string, isInternal: boolean) => Promise<void>;
  onAddTask: (ticketId: string, title: string) => Promise<void>;
  onToggleTask: (ticketId: string, taskId: string) => Promise<void>;
  onResolve: (ticketId: string, solution: string) => Promise<void>;
  onConvertToKB: (ticketId: string) => Promise<void>;
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  ticket,
  onClose,
  currentUser,
  assignmentGroups,
  technicians,
  assets,
  onAssign,
  onUpdateStatus,
  onAddComment,
  onAddTask,
  onToggleTask,
  onResolve,
  onConvertToKB,
}) => {
  if (!ticket) return null;

  const [activeTab, setActiveTab] = useState<'overview' | 'conversation' | 'tasks' | 'attachments' | 'asset' | 'timeline'>('overview');
  const [commentText, setCommentText] = useState('');
  const [isInternalWorkNote, setIsInternalWorkNote] = useState(currentUser.role !== 'EMPLOYEE');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Assign dialog states
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(ticket.assignmentGroupId || '');
  const [selectedTechId, setSelectedTechId] = useState(ticket.assignedToId || '');

  // Resolve dialog state
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [solutionText, setSolutionText] = useState('');

  const isStaff = currentUser.role !== 'EMPLOYEE';
  const isIncident = ticket.type === 'INCIDENT';

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setIsSubmitting(true);
    try {
      await onAddComment(ticket.id, commentText, isInternalWorkNote);
      setCommentText('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      await onAddTask(ticket.id, newTaskTitle);
      setNewTaskTitle('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveAssignment = async () => {
    setIsSubmitting(true);
    try {
      await onAssign(ticket.id, selectedGroupId || undefined, selectedTechId || undefined);
      setShowAssignModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePerformResolve = async () => {
    if (!solutionText.trim()) return;
    setIsSubmitting(true);
    try {
      await onResolve(ticket.id, solutionText);
      setShowResolveModal(false);
      setSolutionText('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' (' + d.toLocaleDateString() + ')';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="bg-[#0B2545] text-white p-4 sm:p-5 flex items-start justify-between border-b border-[#1C5494]">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded border border-amber-400/30 text-xs">
                {ticket.ticketNumber}
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                isIncident ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-blue-950 text-blue-300 border border-blue-800'
              }`}>
                {ticket.type}
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                ticket.priority === 'CRITICAL' ? 'bg-rose-600 text-white' :
                ticket.priority === 'HIGH' ? 'bg-orange-600 text-white' :
                ticket.priority === 'MEDIUM' ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'
              }`}>
                {ticket.priority} PRIORITY
              </span>
              <span className="text-[11px] font-semibold bg-white/10 text-slate-200 px-2 py-0.5 rounded border border-white/20">
                STATUS: {ticket.status.replace('_', ' ')}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight pt-1">
              {ticket.subject}
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            {/* SLA Clock Header Badge */}
            <div className="hidden md:flex flex-col items-end bg-[#06182C] px-3 py-1.5 rounded-lg border border-white/10 text-right">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Resolution SLA</span>
              <div className="flex items-center space-x-1 text-xs font-bold text-amber-300">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {ticket.slaState === 'MET' ? 'SLA Met' :
                   ticket.slaState === 'BREACHED' ? 'SLA Breached' :
                   ticket.slaRemainingSeconds ? `${Math.floor(ticket.slaRemainingSeconds / 3600)}h ${Math.floor((ticket.slaRemainingSeconds % 3600) / 60)}m left` : 'Within SLA'}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Command Bar for IT Staff & Requester */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            {isStaff && (
              <>
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="px-2.5 py-1.5 rounded bg-white hover:bg-slate-100 text-slate-800 font-semibold border border-slate-300 shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <span>Assign / Escalate</span>
                </button>

                {ticket.status !== 'IN_PROGRESS' && ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && (
                  <button
                    onClick={() => onUpdateStatus(ticket.id, 'IN_PROGRESS', 'Technician started active troubleshooting')}
                    className="px-2.5 py-1.5 rounded bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-xs transition-colors"
                  >
                    Start Working (In Progress)
                  </button>
                )}

                {ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && (
                  <button
                    onClick={() => setShowResolveModal(true)}
                    className="px-2.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Resolve Ticket</span>
                  </button>
                )}

                {ticket.status === 'RESOLVED' && (
                  <button
                    onClick={() => onConvertToKB(ticket.id)}
                    className="px-2.5 py-1.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold border border-indigo-200 transition-colors flex items-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Convert to KB Article</span>
                  </button>
                )}
              </>
            )}

            {ticket.status === 'RESOLVED' && (
              <button
                onClick={() => onUpdateStatus(ticket.id, 'CLOSED', 'Requester confirmed resolution.')}
                className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-900 text-white font-bold transition-colors"
              >
                Accept Solution & Close
              </button>
            )}
          </div>

          <div className="text-[11px] text-slate-500 font-medium">
            Assigned: <strong className="text-slate-800">{ticket.assignmentGroupName || 'Unassigned'}</strong> • Tech: <strong className="text-slate-800">{ticket.assignedToName || 'None'}</strong>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-4 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Overview & Details
          </button>
          <button
            onClick={() => setActiveTab('conversation')}
            className={`py-3 px-3 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'conversation'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Conversation & Work Notes</span>
            {ticket.comments && ticket.comments.length > 0 && (
              <span className="bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded-full text-[10px]">
                {ticket.comments.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`py-3 px-3 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'tasks'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ListTodo className="w-3.5 h-3.5" />
            <span>Task Checklist</span>
            {ticket.tasks && ticket.tasks.length > 0 && (
              <span className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded-full text-[10px]">
                {ticket.tasks.filter((t) => t.isCompleted).length}/{ticket.tasks.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('attachments')}
            className={`py-3 px-3 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'attachments'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Paperclip className="w-3.5 h-3.5" />
            <span>Attachments ({ticket.attachments?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab('asset')}
            className={`py-3 px-3 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'asset'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Linked Asset</span>
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-3 px-3 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'timeline'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit Timeline</span>
          </button>
        </div>

        {/* Tab Body Content */}
        <div className="p-5 overflow-y-auto flex-1 custom-scrollbar text-xs bg-slate-50/50">
          {/* 1. OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Solution Banner if Resolved */}
              {ticket.solution && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950">
                  <div className="flex items-center space-x-2 font-bold text-emerald-900 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Official Resolution Summary</span>
                  </div>
                  <p className="text-xs text-emerald-900 leading-relaxed whitespace-pre-wrap">{ticket.solution}</p>
                </div>
              )}

              {/* Description Block */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Incident / Request Description
                </h4>
                <p className="text-slate-800 text-xs leading-relaxed whitespace-pre-wrap">
                  {ticket.description}
                </p>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Requester Profile */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-600" /> Requester Information
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-500">Name:</span>
                      <span className="font-semibold text-slate-900">{ticket.requesterName}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-500">Email:</span>
                      <span className="font-mono text-slate-800">{ticket.requesterEmail}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-500">Department:</span>
                      <span className="font-medium text-slate-800">{ticket.departmentName || 'State Operations'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Location:</span>
                      <span className="font-medium text-slate-800">{ticket.locationName || 'National Data Centre (NDC)'}</span>
                    </div>
                  </div>
                </div>

                {/* Classification & SLA */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-blue-600" /> Classification & Priority Matrix
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-500">Category:</span>
                      <span className="font-semibold text-slate-900">{ticket.categoryName}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-500">Subcategory:</span>
                      <span className="font-medium text-slate-800">{ticket.subcategoryName || 'General'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-500">Impact + Urgency:</span>
                      <span className="font-medium text-slate-800">{ticket.impact} Impact • {ticket.urgency} Urgency</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">SLA Target Due:</span>
                      <span className="font-mono font-medium text-slate-800">
                        {ticket.resolutionDueDate ? formatTimeAgo(ticket.resolutionDueDate) : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. CONVERSATION & WORK NOTES TAB */}
          {activeTab === 'conversation' && (
            <div className="space-y-4">
              {/* Add Comment / Work Note Box */}
              <form onSubmit={handlePostComment} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs">Add Update / Response</span>
                  {isStaff && (
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setIsInternalWorkNote(!isInternalWorkNote)}
                        className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-semibold border transition-all ${
                          isInternalWorkNote
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-slate-100 text-slate-600 border-slate-300'
                        }`}
                      >
                        <Lock className="w-3 h-3 text-amber-600" />
                        <span>{isInternalWorkNote ? 'Internal Work Note (IT Staff Only)' : 'Public Reply to Requester'}</span>
                      </button>
                    </div>
                  )}
                </div>
                <textarea
                  rows={3}
                  placeholder={
                    isInternalWorkNote
                      ? 'Write technical work note for L1/L2/L3 engineers (hidden from employee)...'
                      : 'Write official response to the ticket requester...'
                  }
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className={`w-full p-2.5 rounded-lg border text-xs outline-none focus:ring-1 ${
                    isInternalWorkNote
                      ? 'bg-amber-50/30 border-amber-300 focus:border-amber-500 focus:ring-amber-500'
                      : 'bg-slate-50 border-slate-300 focus:bg-white focus:border-blue-600 focus:ring-blue-600'
                  }`}
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting || !commentText.trim()}
                    className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg text-xs shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Post {isInternalWorkNote ? 'Work Note' : 'Public Reply'}</span>
                  </button>
                </div>
              </form>

              {/* Feed */}
              <div className="space-y-3">
                {ticket.comments && ticket.comments.length > 0 ? (
                  ticket.comments.map((comm) => (
                    <div
                      key={comm.id}
                      className={`p-4 rounded-xl border ${
                        comm.isInternal
                          ? 'bg-amber-50/70 border-amber-200 text-slate-800'
                          : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900">{comm.authorName}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-mono">
                            {comm.authorRole}
                          </span>
                          {comm.isInternal && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 border border-amber-300 flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" /> INTERNAL WORK NOTE
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400">{formatTimeAgo(comm.createdAt)}</span>
                      </div>
                      <p className="text-xs leading-relaxed whitespace-pre-wrap">{comm.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-slate-400 py-6">No comments or work notes yet.</p>
                )}
              </div>
            </div>
          )}

          {/* 3. TASKS TAB */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <form onSubmit={handleCreateTask} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a troubleshooting step or sub-task..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-600"
                />
                <button
                  type="submit"
                  disabled={!newTaskTitle.trim()}
                  className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg text-xs transition-colors flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add Task
                </button>
              </form>

              <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                {ticket.tasks && ticket.tasks.length > 0 ? (
                  ticket.tasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => onToggleTask(ticket.id, task.id)}
                      className="p-3 hover:bg-slate-50 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={task.isCompleted}
                          onChange={() => {}}
                          className="rounded text-blue-600 focus:ring-0 cursor-pointer w-4 h-4"
                        />
                        <span className={`text-xs ${task.isCompleted ? 'line-through text-slate-400' : 'font-medium text-slate-800'}`}>
                          {task.title}
                        </span>
                      </div>
                      {task.assignedToName && (
                        <span className="text-[11px] text-slate-500 font-mono">Assigned: {task.assignedToName}</span>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center text-slate-400 py-6">No tasks added to this ticket.</p>
                )}
              </div>
            </div>
          )}

          {/* 4. ATTACHMENTS TAB */}
          {activeTab === 'attachments' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ticket.attachments && ticket.attachments.length > 0 ? (
                  ticket.attachments.map((att) => (
                    <div
                      key={att.id}
                      className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between shadow-xs"
                    >
                      <div className="flex items-center space-x-2.5 truncate">
                        <Paperclip className="w-4 h-4 text-blue-600 shrink-0" />
                        <div className="truncate">
                          <p className="font-semibold text-slate-800 truncate">{att.fileName}</p>
                          <p className="text-[10px] text-slate-400">
                            {(att.fileSize / 1024).toFixed(1)} KB • Uploaded by {att.uploadedByName}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => alert(`Simulated secure download of ${att.fileName} from CSC Object Storage.`)}
                        className="text-[11px] text-blue-600 hover:underline font-semibold shrink-0"
                      >
                        Download
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="col-span-2 text-center text-slate-400 py-8">No attachments uploaded for this ticket.</p>
                )}
              </div>
            </div>
          )}

          {/* 5. LINKED ASSET TAB */}
          {activeTab === 'asset' && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              {ticket.assetTag ? (
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                    <div>
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {ticket.assetTag}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">{ticket.assetName || ticket.assetTag}</h4>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      STATUS: ACTIVE IN CMDB
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500">Location / Data Centre:</span>
                      <p className="font-medium text-slate-800">{ticket.locationName || 'National Data Centre (NDC)'}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Managing Department:</span>
                      <p className="font-medium text-slate-800">{ticket.departmentName || 'Cloud Infrastructure & DC'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <HardDrive className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p>No specific asset linked to this ticket record.</p>
                </div>
              )}
            </div>
          )}

          {/* 6. TIMELINE TAB */}
          {activeTab === 'timeline' && (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {ticket.timeline && ticket.timeline.length > 0 ? (
                ticket.timeline.map((ev, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-blue-600 border-2 border-white shadow-xs" />
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{ev.userName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{formatTimeAgo(ev.createdAt)}</span>
                      </div>
                      <p className="text-xs font-semibold text-blue-700 mt-0.5">{ev.action.replace('_', ' ')}</p>
                      {ev.oldValue && ev.newValue && (
                        <p className="text-[11px] text-slate-600 mt-1 font-mono">
                          {ev.oldValue} &rarr; <strong className="text-slate-800">{ev.newValue}</strong>
                        </p>
                      )}
                      {ev.comment && <p className="text-xs text-slate-600 mt-1">{ev.comment}</p>}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400">No timeline history recorded.</p>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-white border-t border-slate-200 p-3.5 px-5 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            Created: <strong>{formatTimeAgo(ticket.createdAt)}</strong> • Last Active: <strong>{formatTimeAgo(ticket.updatedAt)}</strong>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>

      {/* Reassign Dialog */}
      {showAssignModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="bg-white w-full max-w-md rounded-xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95">
            <h3 className="text-sm font-bold text-slate-900">Reassign / Escalate Ticket</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Assignment Group</label>
                <select
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                >
                  <option value="">Select Group</option>
                  {(assignmentGroups || []).map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Assign Technician (Optional)</label>
                <select
                  value={selectedTechId}
                  onChange={(e) => setSelectedTechId(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                >
                  <option value="">Auto-Assign / Unassigned</option>
                  {(technicians || []).map((u) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-3 py-1.5 rounded bg-slate-100 text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAssignment}
                disabled={isSubmitting}
                className="px-4 py-1.5 rounded bg-blue-700 text-white text-xs font-semibold hover:bg-blue-800"
              >
                Save Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Dialog */}
      {showResolveModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="bg-white w-full max-w-md rounded-xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Mark Ticket as Resolved</span>
            </h3>
            <p className="text-xs text-slate-500">
              Provide a detailed summary of root cause identification and corrective action taken.
            </p>
            <textarea
              rows={4}
              placeholder="e.g. Cleared /var/log/audit space, restarted service, verified latency below 50ms..."
              value={solutionText}
              onChange={(e) => setSolutionText(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-emerald-600"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowResolveModal(false)}
                className="px-3 py-1.5 rounded bg-slate-100 text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handlePerformResolve}
                disabled={isSubmitting || !solutionText.trim()}
                className="px-4 py-1.5 rounded bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 disabled:opacity-50"
              >
                Confirm Resolution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
