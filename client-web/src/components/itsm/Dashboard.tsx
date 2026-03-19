import React from 'react';
import { useITSM } from '@/context/ITSMContext';
import {
  Ticket,
  AlertTriangle,
  Clock,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  RefreshCw,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { priorities, statuses } from '@/data/mockData';

export default function Dashboard() {
  const { tickets, assets, changes, setCurrentView, setSelectedTicketId, getUserById } = useITSM();

  // Calculate metrics
  const openTickets = tickets.filter(t => ['new', 'open', 'in_progress'].includes(t.status)).length;
  const resolvedToday = tickets.filter(t => {
    const today = new Date().toDateString();
    return t.status === 'resolved' && new Date(t.updatedAt).toDateString() === today;
  }).length;
  const criticalIncidents = tickets.filter(t => t.type === 'incident' && t.priority === 'critical' && t.status !== 'closed').length;
  const slaBreached = tickets.filter(t => t.slaBreached).length;
  const pendingChanges = changes.filter(c => c.status === 'submitted').length;
  const activeAssets = assets.filter(a => a.status === 'active').length;

  // Calculate SLA compliance
  const totalWithSLA = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;
  const withinSLA = totalWithSLA - slaBreached;
  const slaCompliance = totalWithSLA > 0 ? Math.round((withinSLA / totalWithSLA) * 100) : 100;

  // Recent tickets
  const recentTickets = [...tickets]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Tickets by status
  const ticketsByStatus = statuses.map(status => ({
    ...status,
    count: tickets.filter(t => t.status === status.value).length,
  }));

  // Tickets by priority
  const ticketsByPriority = priorities.map(priority => ({
    ...priority,
    count: tickets.filter(t => t.priority === priority.value && !['resolved', 'closed'].includes(t.status)).length,
  }));

  const handleTicketClick = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    setCurrentView('ticket-detail');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-blue-600 bg-blue-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'text-purple-600 bg-purple-50';
      case 'open': return 'text-blue-600 bg-blue-50';
      case 'in_progress': return 'text-yellow-600 bg-yellow-50';
      case 'pending': return 'text-gray-600 bg-gray-50';
      case 'resolved': return 'text-green-600 bg-green-50';
      case 'closed': return 'text-gray-500 bg-gray-100';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">Welcome back!</h1>
        <p className="text-blue-100 mb-4">Here's what's happening with your IT services today.</p>
        <div className="flex flex-wrap gap-4">
          <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
            <span className="text-sm text-blue-100">Open Tickets</span>
            <p className="text-2xl font-bold">{openTickets}</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
            <span className="text-sm text-blue-100">Resolved Today</span>
            <p className="text-2xl font-bold">{resolvedToday}</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
            <span className="text-sm text-blue-100">SLA Compliance</span>
            <p className="text-2xl font-bold">{slaCompliance}%</p>
          </div>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Open Tickets"
          value={openTickets}
          icon={Ticket}
          trend={-5}
          color="blue"
          onClick={() => setCurrentView('tickets')}
        />
        <MetricCard
          title="Critical Incidents"
          value={criticalIncidents}
          icon={AlertTriangle}
          trend={criticalIncidents > 0 ? 2 : 0}
          color="red"
          onClick={() => setCurrentView('tickets')}
        />
        <MetricCard
          title="Pending Changes"
          value={pendingChanges}
          icon={RefreshCw}
          trend={0}
          color="orange"
          onClick={() => setCurrentView('changes')}
        />
        <MetricCard
          title="Active Assets"
          value={activeAssets}
          icon={Package}
          trend={3}
          color="green"
          onClick={() => setCurrentView('assets')}
        />
      </div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent tickets */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent Tickets</h2>
            <button
              onClick={() => setCurrentView('tickets')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {recentTickets.map((ticket) => {
              const requester = getUserById(ticket.requesterId);
              return (
                <button
                  key={ticket.id}
                  onClick={() => handleTicketClick(ticket.id)}
                  className="w-full p-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${getPriorityColor(ticket.priority)}`}>
                      {ticket.type === 'incident' ? (
                        <AlertCircle className="w-5 h-5" />
                      ) : (
                        <Ticket className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-500">{ticket.id}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(ticket.status)}`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 truncate">{ticket.title}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {requester?.name} • {new Date(ticket.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded font-medium ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Tickets by status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Tickets by Status</h3>
            <div className="space-y-3">
              {ticketsByStatus.map((status) => (
                <div key={status.value} className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: status.color }}
                  />
                  <span className="flex-1 text-sm text-gray-600">{status.label}</span>
                  <span className="text-sm font-semibold text-gray-900">{status.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tickets by priority */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Open by Priority</h3>
            <div className="space-y-3">
              {ticketsByPriority.map((priority) => (
                <div key={priority.value}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">{priority.label}</span>
                    <span className="text-sm font-semibold text-gray-900">{priority.count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        backgroundColor: priority.color,
                        width: `${Math.min((priority.count / Math.max(...ticketsByPriority.map(p => p.count), 1)) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SLA breached alert */}
          {slaBreached > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-900">SLA Breached</h4>
                  <p className="text-sm text-red-700 mt-1">
                    {slaBreached} ticket{slaBreached > 1 ? 's have' : ' has'} breached SLA. Immediate attention required.
                  </p>
                  <button
                    onClick={() => setCurrentView('tickets')}
                    className="mt-2 text-sm font-medium text-red-700 hover:text-red-800"
                  >
                    View tickets →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  trend: number;
  color: 'blue' | 'red' | 'orange' | 'green';
  onClick: () => void;
}

function MetricCard({ title, value, icon: Icon, trend, color, onClick }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-50 text-red-600',
    orange: 'bg-orange-50 text-orange-600',
    green: 'bg-green-50 text-green-600',
  };

  return (
    <button
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow text-left w-full"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend !== 0 && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trend > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{title}</p>
    </button>
  );
}
