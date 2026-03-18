import React, { useState } from 'react';
import { useITSM } from '@/context/ITSMContext';
import {
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  User,
  ChevronRight,
  Shield,
  Zap,
  FileText,
  ArrowLeft,
} from 'lucide-react';
import { ChangeRequest, ChangeStatus } from '@/data/mockData';

export default function ChangeManagement() {
  const { changes, getUserById, approveChange, rejectChange, currentUser } = useITSM();

  const [selectedChange, setSelectedChange] = useState<ChangeRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState<ChangeStatus | ''>('');

  const filteredChanges = statusFilter
    ? changes.filter(c => c.status === statusFilter)
    : changes;

  const getStatusColor = (status: ChangeStatus) => {
    switch (status) {
      case 'draft': return 'text-gray-600 bg-gray-100';
      case 'submitted': return 'text-blue-600 bg-blue-100';
      case 'approved': return 'text-green-600 bg-green-100';
      case 'scheduled': return 'text-purple-600 bg-purple-100';
      case 'implementing': return 'text-yellow-600 bg-yellow-100';
      case 'completed': return 'text-green-700 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'emergency': return <Zap className="w-4 h-4 text-red-500" />;
      case 'normal': return <RefreshCw className="w-4 h-4 text-blue-500" />;
      default: return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
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

  // Summary counts
  const pendingApproval = changes.filter(c => c.status === 'submitted').length;
  const scheduled = changes.filter(c => c.status === 'scheduled' || c.status === 'approved').length;
  const implementing = changes.filter(c => c.status === 'implementing').length;

  if (selectedChange) {
    const requester = getUserById(selectedChange.requesterId);
    const assignee = selectedChange.assigneeId ? getUserById(selectedChange.assigneeId) : null;
    const canApprove = selectedChange.approvers.some(
      a => a.userId === currentUser.id && a.status === 'pending'
    );

    return (
      <div className="p-4 lg:p-6">
        <button
          onClick={() => setSelectedChange(null)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Changes
        </button>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg font-bold text-gray-900">{selectedChange.id}</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(selectedChange.status)}`}>
                      {selectedChange.status}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getRiskColor(selectedChange.risk)}`}>
                      {selectedChange.risk} risk
                    </span>
                  </div>
                  <h1 className="text-xl font-semibold text-gray-900">{selectedChange.title}</h1>
                </div>
                {getTypeIcon(selectedChange.type)}
              </div>
              <p className="text-gray-600">{selectedChange.description}</p>
            </div>

            {/* Approval workflow */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Approval Workflow</h3>
              <div className="space-y-4">
                {selectedChange.approvers.map((approver, index) => {
                  const user = getUserById(approver.userId);
                  return (
                    <div key={index} className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        approver.status === 'approved' ? 'bg-green-100' :
                        approver.status === 'rejected' ? 'bg-red-100' : 'bg-gray-100'
                      }`}>
                        {approver.status === 'approved' ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : approver.status === 'rejected' ? (
                          <XCircle className="w-5 h-5 text-red-600" />
                        ) : (
                          <Clock className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{user?.name || 'Unknown'}</p>
                        <p className="text-sm text-gray-500">
                          {approver.status === 'pending' ? 'Pending approval' :
                           approver.date ? `${approver.status} on ${formatDate(approver.date)}` : approver.status}
                        </p>
                      </div>
                      {approver.userId === currentUser.id && approver.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => approveChange(selectedChange.id, currentUser.id)}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => rejectChange(selectedChange.id, currentUser.id)}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rollback plan */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Rollback Plan</h3>
              <p className="text-gray-600">{selectedChange.rollbackPlan}</p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Type</label>
                  <p className="text-sm font-medium text-gray-900 capitalize mt-1">{selectedChange.type}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Priority</label>
                  <p className="text-sm font-medium text-gray-900 capitalize mt-1">{selectedChange.priority}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Impact</label>
                  <p className="text-sm font-medium text-gray-900 capitalize mt-1">{selectedChange.impact}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Scheduled Start</label>
                  <p className="text-sm font-medium text-gray-900 mt-1">{formatDate(selectedChange.scheduledStart)}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Scheduled End</label>
                  <p className="text-sm font-medium text-gray-900 mt-1">{formatDate(selectedChange.scheduledEnd)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Affected Services</h3>
              <div className="flex flex-wrap gap-2">
                {selectedChange.affectedServices.map(service => (
                  <span key={service} className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                    {service}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-4">People</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Requester</label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs">
                      {requester?.avatar}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{requester?.name}</span>
                  </div>
                </div>
                {assignee && (
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Implementer</label>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs">
                        {assignee.avatar}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{assignee.name}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Change Management</h1>
        <p className="text-gray-500 mt-1">Manage IT changes with approval workflows</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pendingApproval}</p>
              <p className="text-sm text-gray-500">Pending Approval</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{scheduled}</p>
              <p className="text-sm text-gray-500">Scheduled</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <RefreshCw className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{implementing}</p>
              <p className="text-sm text-gray-500">In Progress</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{changes.filter(c => c.status === 'completed').length}</p>
              <p className="text-sm text-gray-500">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === '' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All
          </button>
          {['submitted', 'approved', 'scheduled', 'implementing', 'completed', 'rejected'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as ChangeStatus)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                statusFilter === status ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Change list */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredChanges.length === 0 ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No changes found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredChanges.map(change => {
              const requester = getUserById(change.requesterId);
              return (
                <button
                  key={change.id}
                  onClick={() => setSelectedChange(change)}
                  className="w-full p-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {getTypeIcon(change.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-sm font-medium text-blue-600">{change.id}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(change.status)}`}>
                          {change.status}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRiskColor(change.risk)}`}>
                          {change.risk} risk
                        </span>
                      </div>
                      <h3 className="font-medium text-gray-900 line-clamp-1">{change.title}</h3>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {requester?.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(change.scheduledStart).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
