import React from 'react';
import { useITSM } from '@/context/ITSMContext';
import {
  LayoutDashboard,
  Ticket,
  AlertTriangle,
  RefreshCw,
  Package,
  BookOpen,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const { currentView, setCurrentView, setSelectedTicketId, tickets, changes, isMobileMenuOpen, setIsMobileMenuOpen } = useITSM();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'tickets',
      label: 'Service Desk',
      icon: Ticket,
      badge: tickets.filter(t => t.status === 'new' || t.status === 'open').length,
    },
    {
      id: 'problems',
      label: 'Problems',
      icon: AlertTriangle,
      badge: tickets.filter(t => t.type === 'problem' && t.status !== 'closed').length,
    },
    {
      id: 'changes',
      label: 'Changes',
      icon: RefreshCw,
      badge: changes.filter(c => c.status === 'submitted').length,
    },
    {
      id: 'assets',
      label: 'Assets',
      icon: Package,
      badge: null,
    },
    {
      id: 'knowledge',
      label: 'Knowledge Base',
      icon: BookOpen,
      badge: null,
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
  ];

  const handleNavClick = (viewId: string) => {
    setCurrentView(viewId as any);
    setSelectedTicketId(null);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          bg-[#1a2332] text-white
          transition-all duration-300 ease-in-out
          ${collapsed ? 'w-16' : 'w-64'}
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Ticket className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg">ServiceNow</span>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto">
              <Ticket className="w-5 h-5" />
            </div>
          )}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-1 hover:bg-white/10 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavClick(item.id)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                      transition-all duration-200
                      ${isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      }
                    `}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left text-sm font-medium">
                          {item.label}
                        </span>
                        {item.badge !== null && item.badge > 0 && (
                          <span className={`
                            px-2 py-0.5 text-xs font-bold rounded-full
                            ${isActive ? 'bg-white/20' : 'bg-blue-600'}
                          `}>
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                    {collapsed && item.badge !== null && item.badge > 0 && (
                      <span className="absolute right-1 top-1 w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Collapse toggle - desktop only */}
        <div className="hidden lg:block p-4 border-t border-white/10">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm">Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
