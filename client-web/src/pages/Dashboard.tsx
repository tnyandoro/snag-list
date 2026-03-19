// client-web/src/pages/Dashboard.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { 
  Building2, 
  ClipboardCheck, 
  Wrench, 
  Users, 
  FileText, 
  Settings, 
  LogOut,
  Plus,
  TrendingUp,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState({
    properties: 0,
    inspections: 0,
    issues: 0,
    vendors: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('auth_token');

    if (!token || !storedUser) {
      navigate('/login', { replace: true });
      return;
    }

    setUser(JSON.parse(storedUser));
    
    // Load dashboard stats (mock data for now)
    setStats({
      properties: 3,
      inspections: 12,
      issues: 5,
      vendors: 8,
    });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    toast({
      title: 'Logged out successfully',
      description: 'See you next time!',
    });
    navigate('/login', { replace: true });
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-red-100 text-red-800 border-red-300',
      owner: 'bg-blue-100 text-blue-800 border-blue-300',
      inspector: 'bg-green-100 text-green-800 border-green-300',
      vendor: 'bg-purple-100 text-purple-800 border-purple-300',
      tenant: 'bg-orange-100 text-orange-800 border-orange-300',
    };
    return colors[role] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const quickActions = [
    { 
      title: 'Properties', 
      icon: Building2, 
      color: 'from-blue-500 to-blue-600',
      path: '/properties',
      roles: ['admin', 'owner', 'inspector']
    },
    { 
      title: 'Inspections', 
      icon: ClipboardCheck, 
      color: 'from-green-500 to-green-600',
      path: '/inspections',
      roles: ['admin', 'inspector', 'owner']
    },
    { 
      title: 'Issues', 
      icon: AlertCircle, 
      color: 'from-red-500 to-red-600',
      path: '/issues',
      roles: ['admin', 'owner', 'tenant', 'inspector']
    },
    { 
      title: 'Vendors', 
      icon: Users, 
      color: 'from-purple-500 to-purple-600',
      path: '/vendors',
      roles: ['admin', 'owner']
    },
    { 
      title: 'Jobs', 
      icon: Wrench, 
      color: 'from-orange-500 to-orange-600',
      path: '/jobs',
      roles: ['admin', 'owner', 'vendor']
    },
    { 
      title: 'Reports', 
      icon: FileText, 
      color: 'from-teal-500 to-teal-600',
      path: '/reports',
      roles: ['admin', 'owner', 'inspector']
    },
  ].filter(action => action.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-md">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Property Platform
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2">
              <div className="text-right">
                <p className="text-sm font-semibold">{user.full_name}</p>
                <Badge className={getRoleColor(user.role)} variant="outline">
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
              </div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold shadow-md">
                {user.full_name.charAt(0).toUpperCase()}
              </div>
            </div>
            <Button variant="outline" size="icon" onClick={handleLogout} className="h-10 w-10">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, {user.full_name.split(' ')[0]}! 👋
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Here's what's happening with your properties today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {[
            { title: 'Properties', value: stats.properties, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-100' },
            { title: 'Inspections', value: stats.inspections, icon: ClipboardCheck, color: 'text-green-600', bg: 'bg-green-100' },
            { title: 'Open Issues', value: stats.issues, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' },
            { title: 'Vendors', value: stats.vendors, icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
          ].map((stat) => (
            <Card key={stat.title} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  +20% from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common tasks based on your role as {user.role}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {quickActions.map((action) => (
                <Button
                  key={action.title}
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center gap-2 border-2 hover:shadow-lg transition-all duration-300 hover:scale-105"
                  onClick={() => navigate(action.path)}
                >
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} shadow-md`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="font-semibold">{action.title}</span>
                </Button>
              ))}
              
              {user.role === 'owner' && (
                <Button
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center gap-2 border-2 border-dashed hover:bg-gray-50 transition-all"
                  onClick={() => navigate('/properties/new')}
                >
                  <div className="p-3 rounded-xl bg-gradient-to-br from-gray-400 to-gray-500 shadow-md">
                    <Plus className="h-6 w-6 text-white" />
                  </div>
                  <span className="font-semibold">Add Property</span>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-0 shadow-lg mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest updates from your properties</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: 'Inspection completed', property: 'Riverside Apartments', time: '2 hours ago', status: 'success' },
                { action: 'New issue reported', property: 'Sunset Townhouses', time: '5 hours ago', status: 'warning' },
                { action: 'Vendor assigned', property: 'Downtown Lodge', time: '1 day ago', status: 'info' },
                { action: 'Payment approved', property: 'Riverside Apartments', time: '2 days ago', status: 'success' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${
                      activity.status === 'success' ? 'bg-green-500' :
                      activity.status === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} />
                    <div>
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{activity.property}</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;