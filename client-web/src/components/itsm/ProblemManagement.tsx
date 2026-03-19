import React from 'react';
import { useITSM } from '@/context/ITSMContext';
import {
  AlertTriangle,
  Search,
  Clock,
  User,
  ChevronRight,
  Link2,
  FileText,
} from 'lucide-react';

export default function ProblemManagement() {
  const { tickets, setCurrentView, setSelectedTicketId, getUserById } = useITSM();

  // Filter only problem tickets
  const problems = tickets.filter(t => t.type === 'problem');

  // Related incidents for each problem (simulated)
  const getRelatedIncidents = (problemId: string) => {
    return tickets.filter(t => t.type === 'incident' && t.category === problems.find(p => p.id === problemId)?.category).slice(0, 3);
  };

  const handleProblemClick = (problemId: string) => {
    setSelectedTicketId(problemId);
    setCurrentView('ticket-detail');
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

  const openProblems = problems.filter(p => !['resolved', 'closed'].includes(p.status)).length;
  const criticalProblems = problems.filter(p => p.priority === 'critical' && !['resolved', 'closed'].includes(p.status)).length;

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Problem Management</h1>
        <p className="text-gray-500 mt-1">Identify and resolve root causes of recurring incidents</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{problems.length}</p>
              <p className="text-sm text-gray-500">Total Problems</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{openProblems}</p>
              <p className="text-sm text-gray-500">Open</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{criticalProblems}</p>
              <p className="text-sm text-gray-500">Critical</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{problems.filter(p => p.status === 'resolved' || p.status === 'closed').length}</p>
              <p className="text-sm text-gray-500">Resolved</p>
            </div>
          </div>
        </div>
      </div>

      {/* Problem list */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search problems..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {problems.length === 0 ? (
          <div className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No problems found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {problems.map((problem) => {
              const assignee = problem.assigneeId ? getUserById(problem.assigneeId) : null;
              const relatedIncidents = getRelatedIncidents(problem.id);

              return (
                <div key={problem.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <button
                    onClick={() => handleProblemClick(problem.id)}
                    className="w-full text-left"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-purple-100 rounded-lg mt-1">
                        <AlertTriangle className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-sm font-medium text-purple-600">{problem.id}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(problem.status)}`}>
                            {problem.status.replace('_', ' ')}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded border font-medium ${getPriorityColor(problem.priority)}`}>
                            {problem.priority}
                          </span>
                        </div>
                        <h3 className="font-medium text-gray-900 mb-1">{problem.title}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-2">{problem.description}</p>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {assignee?.name || 'Unassigned'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(problem.createdAt).toLocaleDateString()}
                          </span>
                          <span>{problem.category}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </button>

                  {/* Related incidents */}
                  {relatedIncidents.length > 0 && (
                    <div className="mt-4 ml-14 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Link2 className="w-4 h-4 text-gray-400" />
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Related Incidents ({relatedIncidents.length})
                        </span>
                      </div>
                      <div className="space-y-2">
                        {relatedIncidents.map((incident) => (
                          <button
                            key={incident.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTicketId(incident.id);
                              setCurrentView('ticket-detail');
                            }}
                            className="w-full text-left flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600"
                          >
                            <span className="font-medium">{incident.id}</span>
                            <span className="truncate">{incident.title}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
