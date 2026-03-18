import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useAuth, User as AuthUser } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  Ticket,
  Asset,
  KnowledgeArticle,
  ChangeRequest,
  TicketStatus,
  Priority,
  TicketType,
  tickets as initialTickets,
  assets as initialAssets,
  knowledgeArticles as initialArticles,
  changeRequests as initialChanges,
  users as mockUsers,
  Comment,
  User,
} from '@/data/mockData';

type ViewType = 'dashboard' | 'tickets' | 'ticket-detail' | 'assets' | 'knowledge' | 'changes' | 'problems' | 'analytics' | 'settings';

interface Filters {
  status: TicketStatus | 'all';
  priority: Priority | 'all';
  type: TicketType | 'all';
  category: string;
  assignee: string;
  search: string;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
}

interface ITSMContextType {
  // Current user (from auth)
  currentUser: User;
  currentRole: 'admin' | 'agent' | 'end_user';

  // Navigation
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  selectedTicketId: string | null;
  setSelectedTicketId: (id: string | null) => void;

  // Data
  tickets: Ticket[];
  assets: Asset[];
  articles: KnowledgeArticle[];
  changes: ChangeRequest[];
  users: User[];

  // Filters
  filters: Filters;
  setFilters: (filters: Filters) => void;
  resetFilters: () => void;

  // Ticket operations
  createTicket: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'comments' | 'attachments'>) => void;
  updateTicket: (id: string, updates: Partial<Ticket>) => void;
  addComment: (ticketId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => void;
  assignTicket: (ticketId: string, assigneeId: string | null) => void;

  // Asset operations
  updateAsset: (id: string, updates: Partial<Asset>) => void;

  // Change operations
  updateChange: (id: string, updates: Partial<ChangeRequest>) => void;
  approveChange: (changeId: string, userId: string) => void;
  rejectChange: (changeId: string, userId: string) => void;

  // Computed values
  filteredTickets: Ticket[];
  getTicketById: (id: string) => Ticket | undefined;
  getUserById: (id: string) => User | undefined;
  getAssetById: (id: string) => Asset | undefined;

  // UI State
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;

  // Notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  dismissNotification: (id: string) => void;
}

const defaultFilters: Filters = {
  status: 'all',
  priority: 'all',
  type: 'all',
  category: '',
  assignee: '',
  search: '',
};

const ITSMContext = createContext<ITSMContextType | undefined>(undefined);

export function ITSMProvider({ children }: { children: ReactNode }) {
  const { user: authUser } = useAuth();

  // Convert auth user to ITSM user format
  const currentUser: User = authUser ? {
    id: authUser.id,
    name: authUser.name,
    email: authUser.email,
    role: authUser.role,
    avatar: authUser.avatar,
    department: authUser.department,
  } : mockUsers[0]; // Fallback for development

  const currentRole = authUser?.role || 'admin';

  // Navigation
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // Data state - combine mock users with authenticated user
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [articles] = useState<KnowledgeArticle[]>(initialArticles);
  const [changes, setChanges] = useState<ChangeRequest[]>(initialChanges);
  
  // Users list includes mock users plus authenticated user
  const [dbUsers, setDbUsers] = useState<User[]>([]);
  const users = [...mockUsers, ...dbUsers.filter(u => !mockUsers.find(m => m.id === u.id))];

  // Load users from database
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, name, role, department, avatar');
        
        if (data && !error) {
          setDbUsers(data.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role as 'admin' | 'agent' | 'end_user',
            department: u.department || 'General',
            avatar: u.avatar || u.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
          })));
        }
      } catch (err) {
        console.error('Failed to load users:', err);
      }
    };

    loadUsers();
  }, [authUser]);

  // Filters
  const [filters, setFilters] = useState<Filters>(defaultFilters);

  // UI State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  // Ticket operations
  const createTicket = useCallback((ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'comments' | 'attachments'>) => {
    const prefix = ticketData.type === 'incident' ? 'INC' : ticketData.type === 'service_request' ? 'SR' : ticketData.type === 'problem' ? 'PRB' : 'CHG';
    const newId = `${prefix}-${String(tickets.length + 200).padStart(3, '0')}`;
    const now = new Date().toISOString();
    
    const newTicket: Ticket = {
      ...ticketData,
      id: newId,
      createdAt: now,
      updatedAt: now,
      comments: [],
      attachments: [],
    };

    setTickets(prev => [newTicket, ...prev]);
    addNotification({
      type: 'success',
      title: 'Ticket Created',
      message: `${newId} has been created successfully.`,
    });
  }, [tickets.length]);

  const updateTicket = useCallback((id: string, updates: Partial<Ticket>) => {
    setTickets(prev => prev.map(ticket => 
      ticket.id === id 
        ? { ...ticket, ...updates, updatedAt: new Date().toISOString() }
        : ticket
    ));
  }, []);

  const addComment = useCallback((ticketId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => {
    const newComment: Comment = {
      ...comment,
      id: `c-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setTickets(prev => prev.map(ticket =>
      ticket.id === ticketId
        ? { ...ticket, comments: [...ticket.comments, newComment], updatedAt: new Date().toISOString() }
        : ticket
    ));
  }, []);

  const assignTicket = useCallback((ticketId: string, assigneeId: string | null) => {
    updateTicket(ticketId, { assigneeId, status: assigneeId ? 'open' : 'new' });
    if (assigneeId) {
      const assignee = users.find(u => u.id === assigneeId);
      addNotification({
        type: 'info',
        title: 'Ticket Assigned',
        message: `${ticketId} has been assigned to ${assignee?.name || 'Unknown'}.`,
      });
    }
  }, [updateTicket, users]);

  // Asset operations
  const updateAsset = useCallback((id: string, updates: Partial<Asset>) => {
    setAssets(prev => prev.map(asset =>
      asset.id === id ? { ...asset, ...updates } : asset
    ));
  }, []);

  // Change operations
  const updateChange = useCallback((id: string, updates: Partial<ChangeRequest>) => {
    setChanges(prev => prev.map(change =>
      change.id === id ? { ...change, ...updates } : change
    ));
  }, []);

  const approveChange = useCallback((changeId: string, userId: string) => {
    setChanges(prev => prev.map(change => {
      if (change.id !== changeId) return change;
      
      const updatedApprovers = change.approvers.map(approver =>
        approver.userId === userId
          ? { ...approver, status: 'approved' as const, date: new Date().toISOString() }
          : approver
      );

      const allApproved = updatedApprovers.every(a => a.status === 'approved');
      
      return {
        ...change,
        approvers: updatedApprovers,
        status: allApproved ? 'approved' : change.status,
      };
    }));

    addNotification({
      type: 'success',
      title: 'Change Approved',
      message: `${changeId} has been approved.`,
    });
  }, []);

  const rejectChange = useCallback((changeId: string, userId: string) => {
    setChanges(prev => prev.map(change => {
      if (change.id !== changeId) return change;
      
      const updatedApprovers = change.approvers.map(approver =>
        approver.userId === userId
          ? { ...approver, status: 'rejected' as const, date: new Date().toISOString() }
          : approver
      );

      return {
        ...change,
        approvers: updatedApprovers,
        status: 'rejected',
      };
    }));

    addNotification({
      type: 'warning',
      title: 'Change Rejected',
      message: `${changeId} has been rejected.`,
    });
  }, []);

  // Computed values
  const filteredTickets = tickets.filter(ticket => {
    if (filters.status !== 'all' && ticket.status !== filters.status) return false;
    if (filters.priority !== 'all' && ticket.priority !== filters.priority) return false;
    if (filters.type !== 'all' && ticket.type !== filters.type) return false;
    if (filters.category && ticket.category !== filters.category) return false;
    if (filters.assignee && ticket.assigneeId !== filters.assignee) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        ticket.id.toLowerCase().includes(searchLower) ||
        ticket.title.toLowerCase().includes(searchLower) ||
        ticket.description.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const getTicketById = useCallback((id: string) => tickets.find(t => t.id === id), [tickets]);
  const getUserById = useCallback((id: string) => users.find(u => u.id === id), [users]);
  const getAssetById = useCallback((id: string) => assets.find(a => a.id === id), [assets]);

  // Notifications
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setNotifications(prev => [newNotification, ...prev].slice(0, 10));

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 5000);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const value: ITSMContextType = {
    currentUser,
    currentRole,
    currentView,
    setCurrentView,
    selectedTicketId,
    setSelectedTicketId,
    tickets,
    assets,
    articles,
    changes,
    users,
    filters,
    setFilters,
    resetFilters,
    createTicket,
    updateTicket,
    addComment,
    assignTicket,
    updateAsset,
    updateChange,
    approveChange,
    rejectChange,
    filteredTickets,
    getTicketById,
    getUserById,
    getAssetById,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    isCreateModalOpen,
    setIsCreateModalOpen,
    notifications,
    addNotification,
    dismissNotification,
  };

  return (
    <ITSMContext.Provider value={value}>
      {children}
    </ITSMContext.Provider>
  );
}

export function useITSM() {
  const context = useContext(ITSMContext);
  if (context === undefined) {
    throw new Error('useITSM must be used within an ITSMProvider');
  }
  return context;
}
