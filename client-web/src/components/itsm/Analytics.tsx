import React, { useMemo } from 'react';
import { useITSM } from '@/context/ITSMContext';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  BarChart3,
  PieChart,
  Activity,
} from 'lucide-react';

export default function Analytics() {
  const { tickets, users } = useITSM();

  // Calculate metrics
  const metrics = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentTickets = tickets.filter(t => new Date(t.createdAt) >= thirtyDaysAgo);
    const resolvedTickets = tickets.filter(t => t.status === 'resolved' || t.status === 'closed');
    const resolvedWithTime = resolvedTickets.filter(t => t.resolutionTime);

    // Average resolution time
    const avgResolutionTime = resolvedWithTime.length > 0
      ? resolvedWithTime.reduce((sum, t) => sum + (t.resolutionTime || 0), 0) / resolvedWithTime.length
      : 0;

    // SLA compliance
    const slaBreached = tickets.filter(t => t.slaBreached).length;
    const slaCompliance = tickets.length > 0 
      ? ((tickets.length - slaBreached) / tickets.length) * 100 
      : 100;

    // Tickets by day (last 7 days)
    const ticketsByDay: { date: string; created: number; resolved: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      ticketsByDay.push({
        date: dateStr,
        created: tickets.filter(t => {
          const created = new Date(t.createdAt);
          return created >= dayStart && created <= dayEnd;
        }).length,
        resolved: tickets.filter(t => {
          const updated = new Date(t.updatedAt);
          return (t.status === 'resolved' || t.status === 'closed') && updated >= dayStart && updated <= dayEnd;
        }).length,
      });
    }

    // Tickets by category
    const byCategory: Record<string, number> = {};
    tickets.forEach(t => {
      byCategory[t.category] = (byCategory[t.category] || 0) + 1;
    });
    const topCategories = Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    // Tickets by type
    const byType = {
      incident: tickets.filter(t => t.type === 'incident').length,
      service_request: tickets.filter(t => t.type === 'service_request').length,
      problem: tickets.filter(t => t.type === 'problem').length,
    };

    // Agent performance
    const agents = users.filter(u => u.role === 'agent' || u.role === 'admin');
    const agentPerformance = agents.map(agent => {
      const assigned = tickets.filter(t => t.assigneeId === agent.id);
      const resolved = assigned.filter(t => t.status === 'resolved' || t.status === 'closed');
      const avgTime = resolved.filter(t => t.resolutionTime).length > 0
        ? resolved.filter(t => t.resolutionTime).reduce((sum, t) => sum + (t.resolutionTime || 0), 0) / resolved.filter(t => t.resolutionTime).length
        : 0;

      return {
        ...agent,
        assigned: assigned.length,
        resolved: resolved.length,
        avgResolutionTime: avgTime,
      };
    }).sort((a, b) => b.resolved - a.resolved);

    return {
      totalTickets: tickets.length,
      openTickets: tickets.filter(t => !['resolved', 'closed'].includes(t.status)).length,
      resolvedTickets: resolvedTickets.length,
      avgResolutionTime,
      slaCompliance,
      slaBreached,
      ticketsByDay,
      topCategories,
      byType,
      agentPerformance,
      recentTickets: recentTickets.length,
    };
  }, [tickets, users]);

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)} min`;
    if (minutes < 1440) return `${(minutes / 60).toFixed(1)} hrs`;
    return `${(minutes / 1440).toFixed(1)} days`;
  };

  const maxDayTickets = Math.max(...metrics.ticketsByDay.map(d => Math.max(d.created, d.resolved)), 1);

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-1">Performance metrics and insights</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Total Tickets</span>
            <div className="p-1.5 bg-blue-100 rounded">
              <BarChart3 className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{metrics.totalTickets}</p>
          <p className="text-xs text-gray-500 mt-1">{metrics.recentTickets} in last 30 days</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Avg Resolution</span>
            <div className="p-1.5 bg-green-100 rounded">
              <Clock className="w-4 h-4 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatTime(metrics.avgResolutionTime)}</p>
          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
            <TrendingDown className="w-3 h-3" />
            12% faster than last month
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">SLA Compliance</span>
            <div className="p-1.5 bg-purple-100 rounded">
              <CheckCircle className="w-4 h-4 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{metrics.slaCompliance.toFixed(1)}%</p>
          <p className="text-xs text-gray-500 mt-1">{metrics.slaBreached} breached</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Resolution Rate</span>
            <div className="p-1.5 bg-orange-100 rounded">
              <Activity className="w-4 h-4 text-orange-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {metrics.totalTickets > 0 ? ((metrics.resolvedTickets / metrics.totalTickets) * 100).toFixed(0) : 0}%
          </p>
          <p className="text-xs text-gray-500 mt-1">{metrics.resolvedTickets} resolved</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Ticket trend chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-6">Ticket Trend (Last 7 Days)</h3>
          <div className="h-64">
            <div className="flex h-full items-end gap-4">
              {metrics.ticketsByDay.map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex gap-1 items-end h-48">
                    <div
                      className="flex-1 bg-blue-500 rounded-t transition-all duration-500"
                      style={{ height: `${(day.created / maxDayTickets) * 100}%`, minHeight: day.created > 0 ? '8px' : '0' }}
                      title={`Created: ${day.created}`}
                    />
                    <div
                      className="flex-1 bg-green-500 rounded-t transition-all duration-500"
                      style={{ height: `${(day.resolved / maxDayTickets) * 100}%`, minHeight: day.resolved > 0 ? '8px' : '0' }}
                      title={`Resolved: ${day.resolved}`}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{day.date}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded" />
              <span className="text-sm text-gray-600">Created</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded" />
              <span className="text-sm text-gray-600">Resolved</span>
            </div>
          </div>
        </div>

        {/* Tickets by type */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-6">Tickets by Type</h3>
          <div className="space-y-4">
            {[
              { label: 'Incidents', value: metrics.byType.incident, color: 'bg-red-500' },
              { label: 'Service Requests', value: metrics.byType.service_request, color: 'bg-blue-500' },
              { label: 'Problems', value: metrics.byType.problem, color: 'bg-purple-500' },
            ].map((item) => {
              const percentage = metrics.totalTickets > 0 ? (item.value / metrics.totalTickets) * 100 : 0;
              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">{item.label}</span>
                    <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Donut chart representation */}
          <div className="mt-6 flex justify-center">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full transform -rotate-90">
                {(() => {
                  const total = metrics.byType.incident + metrics.byType.service_request + metrics.byType.problem;
                  if (total === 0) return null;
                  
                  let offset = 0;
                  const segments = [
                    { value: metrics.byType.incident, color: '#ef4444' },
                    { value: metrics.byType.service_request, color: '#3b82f6' },
                    { value: metrics.byType.problem, color: '#a855f7' },
                  ];

                  return segments.map((segment, i) => {
                    const percentage = (segment.value / total) * 100;
                    const circumference = 2 * Math.PI * 45;
                    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
                    const strokeDashoffset = -(offset / 100) * circumference;
                    offset += percentage;

                    return (
                      <circle
                        key={i}
                        cx="64"
                        cy="64"
                        r="45"
                        fill="none"
                        stroke={segment.color}
                        strokeWidth="20"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                      />
                    );
                  });
                })()}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{metrics.totalTickets}</p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        {/* Top categories */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Top Categories</h3>
          <div className="space-y-3">
            {metrics.topCategories.map(([category, count], index) => {
              const maxCount = metrics.topCategories[0][1];
              return (
                <div key={category} className="flex items-center gap-3">
                  <span className="text-sm text-gray-400 w-4">{index + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{category}</span>
                      <span className="text-sm text-gray-500">{count}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(count / maxCount) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Agent performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Agent Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wide">
                  <th className="pb-3">Agent</th>
                  <th className="pb-3 text-center">Assigned</th>
                  <th className="pb-3 text-center">Resolved</th>
                  <th className="pb-3 text-right">Avg Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {metrics.agentPerformance.slice(0, 5).map((agent) => (
                  <tr key={agent.id}>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          {agent.avatar}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{agent.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-center text-sm text-gray-600">{agent.assigned}</td>
                    <td className="py-3 text-center text-sm text-gray-600">{agent.resolved}</td>
                    <td className="py-3 text-right text-sm text-gray-600">
                      {agent.avgResolutionTime > 0 ? formatTime(agent.avgResolutionTime) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
