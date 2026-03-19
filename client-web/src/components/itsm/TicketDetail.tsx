import React, { useState } from 'react';
import { useITSM } from '@/context/ITSMContext';
import {
  ArrowLeft,
  Clock,
  User,
  Tag,
  MessageSquare,
  Paperclip,
  Send,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreVertical,
  Calendar,
  Building,
  Lock,
  Unlock,
} from 'lucide-react';
import { statuses, priorities, users as allUsers } from '@/data/mockData';

export default function TicketDetail() {
  const {
    selectedTicketId,
    getTicketById,
    getUserById,
    setCurrentView,
    updateTicket,
    addComment,
    assignTicket,
    currentUser,
  } = useITSM();

  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [showAssignMenu, setShowAssignMenu] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const ticket = selectedTicketId ? getTicketById(selectedTicketId) : null;

  if (!ticket) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Ticket not found</p>
        <button
          onClick={() => setCurrentView('tickets')}
          className="mt-4 text-blue-600 hover:text-blue-700"
        >
          Back to tickets
        </button>
      </div>
    );
  }

  const requester = getUserById(ticket.requesterId);
  const assignee = ticket.assigneeId ? getUserById(ticket.assigneeId) : null;
  const agents = allUsers.filter(u => u.role === 'agent' || u.role === 'admin');

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    addComment(ticket.id, {
      userId: currentUser.id,
      content: newComment,
      isInternal,
    });

    setNewComment('');
    setIsInternal(false);
  };

  const handleStatusChange = (newStatus: string) => {
    updateTicket(ticket.id, { status: newStatus as any });
    setShowStatusMenu(false);
  };

  const handleAssign = (userId: string | null) => {
    assignTicket(ticket.id, userId);
    setShowAssignMenu(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-700 bg-red-100 border-red-200';
      case 'high': return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'medium': return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'low': return 'text-green-700 bg-green-100 border-green-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'text-purple-700 bg-purple-100';
      case 'open': return 'text-blue-700 bg-blue-100';
      case 'in_progress': return 'text-yellow-700 bg-yellow-100';
      case 'pending': return 'text-gray-700 bg-gray-200';
      case 'resolved': return 'text-green-700 bg-green-100';
      case 'closed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => setCurrentView('tickets')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to tickets
        </button>

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">{ticket.id}</h1>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(ticket.status)}`}>
                {ticket.status.replace('_', ' ')}
              </span>
              <span className={`text-xs px-2 py-1 rounded border font-medium ${getPriorityColor(ticket.priority)}`}>
                {ticket.priority}
              </span>
              {ticket.slaBreached && (
                <span className="text-xs px-2 py-1 rounded-full font-medium text-red-700 bg-red-100 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  SLA Breached
                </span>
              )}
            </div>
            <h2 className="text-lg text-gray-700">{ticket.title}</h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Status dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <span className="text-sm">Change Status</span>
              </button>
              {showStatusMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowStatusMenu(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                    {statuses.map((status) => (
                      <button
                        key={status.value}
                        onClick={() => handleStatusChange(status.value)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 ${
                          ticket.status === status.value ? 'text-blue-600 font-medium' : 'text-gray-700'
                        }`}
                      >
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: status.color }} />
                        {status.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Assign dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowAssignMenu(!showAssignMenu)}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <User className="w-4 h-4" />
                <span className="text-sm">{assignee ? 'Reassign' : 'Assign'}</span>
              </button>
              {showAssignMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowAssignMenu(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                    <button
                      onClick={() => handleAssign(null)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-50"
                    >
                      Unassign
                    </button>
                    <div className="border-t border-gray-100 my-1" />
                    {agents.map((agent) => (
                      <button
                        key={agent.id}
                        onClick={() => handleAssign(agent.id)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-3 ${
                          ticket.assigneeId === agent.id ? 'text-blue-600 font-medium' : 'text-gray-700'
                        }`}
                      >
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          {agent.avatar}
                        </div>
                        <div>
                          <p className="font-medium">{agent.name}</p>
                          <p className="text-xs text-gray-500">{agent.department}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>

            {ticket.tags.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="w-4 h-4 text-gray-400" />
                  {ticket.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Comments */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Activity ({ticket.comments.length})
              </h3>
            </div>

            {/* Comment list */}
            <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
              {ticket.comments.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No comments yet
                </div>
              ) : (
                ticket.comments.map((comment) => {
                  const author = getUserById(comment.userId);
                  return (
                    <div key={comment.id} className={`p-4 ${comment.isInternal ? 'bg-yellow-50' : ''}`}>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                          {author?.avatar || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900">{author?.name || 'Unknown'}</span>
                            {comment.isInternal && (
                              <span className="text-xs px-2 py-0.5 bg-yellow-200 text-yellow-800 rounded flex items-center gap-1">
                                <Lock className="w-3 h-3" />
                                Internal
                              </span>
                            )}
                            <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                          </div>
                          <p className="text-gray-700 text-sm">{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Add comment */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => setIsInternal(false)}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                    !isInternal ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <Unlock className="w-3 h-3" />
                  Public
                </button>
                <button
                  onClick={() => setIsInternal(true)}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                    isInternal ? 'bg-yellow-100 text-yellow-700' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <Lock className="w-3 h-3" />
                  Internal Note
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                  placeholder={isInternal ? 'Add an internal note...' : 'Add a comment...'}
                  className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isInternal ? 'bg-yellow-50 border-yellow-200' : 'border-gray-200'
                  }`}
                />
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Details</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Type</label>
                <p className="text-sm font-medium text-gray-900 capitalize">{ticket.type.replace('_', ' ')}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Category</label>
                <p className="text-sm font-medium text-gray-900">{ticket.category}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Subcategory</label>
                <p className="text-sm font-medium text-gray-900">{ticket.subcategory}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Due Date</label>
                <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {formatDate(ticket.dueDate)}
                </p>
              </div>
              {ticket.resolutionTime && (
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Resolution Time</label>
                  <p className="text-sm font-medium text-gray-900">{ticket.resolutionTime} minutes</p>
                </div>
              )}
            </div>
          </div>

          {/* People */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">People</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Requester</label>
                <div className="flex items-center gap-3 mt-1">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                    {requester?.avatar || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{requester?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">{requester?.department}</p>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Assignee</label>
                {assignee ? (
                  <div className="flex items-center gap-3 mt-1">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                      {assignee.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{assignee.name}</p>
                      <p className="text-xs text-gray-500">{assignee.department}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mt-1">Unassigned</p>
                )}
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Timeline</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Created</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(ticket.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Last Updated</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(ticket.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
