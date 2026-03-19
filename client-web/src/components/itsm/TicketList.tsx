import React, { useState, useMemo } from 'react';
import { useITSM } from '@/context/ITSMContext';
import {
  Search,
  Filter,
  SortAsc,
  SortDesc,
  AlertCircle,
  Ticket,
  Clock,
  User,
  ChevronDown,
  X,
  RefreshCw,
} from 'lucide-react';
import { categories, priorities, statuses, ticketTypes, TicketStatus, Priority, TicketType } from '@/data/mockData';

type SortField = 'createdAt' | 'updatedAt' | 'priority' | 'status';
type SortOrder = 'asc' | 'desc';

export default function TicketList() {
  const {
    filteredTickets,
    filters,
    setFilters,
    resetFilters,
    setCurrentView,
    setSelectedTicketId,
    getUserById,
    users,
  } = useITSM();

  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showFilters, setShowFilters] = useState(false);

  // Sort tickets
  const sortedTickets = useMemo(() => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const statusOrder = { new: 0, open: 1, in_progress: 2, pending: 3, resolved: 4, closed: 5 };

    return [...filteredTickets].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'createdAt':
        case 'updatedAt':
          comparison = new Date(a[sortField]).getTime() - new Date(b[sortField]).getTime();
          break;
        case 'priority':
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'status':
          comparison = statusOrder[a.status] - statusOrder[b.status];
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredTickets, sortField, sortOrder]);

  const handleTicketClick = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    setCurrentView('ticket-detail');
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'incident':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'problem':
        return <AlertCircle className="w-4 h-4 text-purple-500" />;
      case 'change':
        return <RefreshCw className="w-4 h-4 text-orange-500" />;
      default:
        return <Ticket className="w-4 h-4 text-blue-500" />;
    }
  };

  const activeFiltersCount = Object.entries(filters).filter(
    ([key, value]) => value && value !== 'all' && key !== 'search'
  ).length;

  const agents = users.filter(u => u.role === 'agent' || u.role === 'admin');

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Service Desk</h1>
        <p className="text-gray-500 mt-1">Manage incidents, service requests, and support tickets</p>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID, title, or description..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Quick filters */}
          <div className="flex flex-wrap gap-2">
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value as TicketType | 'all' })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              {ticketTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as TicketStatus | 'all' })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>

            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value as Priority | 'all' })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              {priorities.map((priority) => (
                <option key={priority.value} value={priority.value}>{priority.label}</option>
              ))}
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm transition-colors ${
                showFilters || activeFiltersCount > 0
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              More Filters
              {activeFiltersCount > 0 && (
                <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {(activeFiltersCount > 0 || filters.search) && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Extended filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
              <select
                value={filters.assignee}
                onChange={(e) => setFilters({ ...filters, assignee: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Assignees</option>
                <option value="unassigned">Unassigned</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>{agent.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results count and sort */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          Showing <span className="font-medium text-gray-900">{sortedTickets.length}</span> tickets
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Sort by:</span>
          <button
            onClick={() => toggleSort('createdAt')}
            className={`flex items-center gap-1 px-2 py-1 text-sm rounded ${
              sortField === 'createdAt' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Created
            {sortField === 'createdAt' && (sortOrder === 'desc' ? <SortDesc className="w-3 h-3" /> : <SortAsc className="w-3 h-3" />)}
          </button>
          <button
            onClick={() => toggleSort('priority')}
            className={`flex items-center gap-1 px-2 py-1 text-sm rounded ${
              sortField === 'priority' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Priority
            {sortField === 'priority' && (sortOrder === 'desc' ? <SortDesc className="w-3 h-3" /> : <SortAsc className="w-3 h-3" />)}
          </button>
        </div>
      </div>

      {/* Ticket list */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {sortedTickets.length === 0 ? (
          <div className="p-8 text-center">
            <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No tickets found</h3>
            <p className="text-gray-500">Try adjusting your filters or search criteria</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sortedTickets.map((ticket) => {
              const requester = getUserById(ticket.requesterId);
              const assignee = ticket.assigneeId ? getUserById(ticket.assigneeId) : null;

              return (
                <button
                  key={ticket.id}
                  onClick={() => handleTicketClick(ticket.id)}
                  className="w-full p-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-start gap-4">
                    {/* Type icon */}
                    <div className="mt-1">
                      {getTypeIcon(ticket.type)}
                    </div>

                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-sm font-medium text-blue-600">{ticket.id}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(ticket.status)}`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                        {ticket.slaBreached && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium text-red-700 bg-red-100">
                            SLA Breached
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-1">{ticket.title}</h3>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {requester?.name || 'Unknown'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </span>
                        <span>{ticket.category}</span>
                      </div>
                    </div>

                    {/* Right side */}
                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-xs px-2 py-1 rounded border font-medium ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                      {assignee ? (
                        <div className="flex items-center gap-1">
                          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                            {assignee.avatar}
                          </div>
                          <span className="text-xs text-gray-500 hidden sm:inline">{assignee.name.split(' ')[0]}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Unassigned</span>
                      )}
                    </div>
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
