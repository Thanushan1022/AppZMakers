import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
  LayoutDashboard, Clock, CalendarDays, User, Users, CheckSquare,
  FileText, Building2, ShieldCheck, DollarSign, Settings,
  Bell, LogOut, Menu, X, ChevronRight, BarChart3
} from 'lucide-react';

const navByRole = {
  employee: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'leave', label: 'Leave Requests', icon: CalendarDays },
    { id: 'profile', label: 'My Profile', icon: User },
  ],
  hr: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'leave-approvals', label: 'Leave Approvals', icon: CheckSquare },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'calendar', label: 'Company Calendar', icon: CalendarDays },
    { id: 'profile', label: 'My Profile', icon: User },
  ],
  company: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'employees', label: 'My Employees', icon: Users },
    { id: 'attendance', label: 'Attendance Log', icon: Clock },
    { id: 'calendar', label: 'Company Calendar', icon: CalendarDays },
    { id: 'profile', label: 'My Profile', icon: User },
  ],
  superadmin: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'calendar', label: 'Company Calendar', icon: CalendarDays },
    { id: 'reports', label: 'System Reports', icon: FileText },
    { id: 'companies', label: 'Clients', icon: Building2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ],
};

const roleColors = {
  employee: 'bg-indigo-500',
  hr: 'bg-sky-500',
  company: 'bg-emerald-500',
  superadmin: 'bg-violet-500',
};

const roleLabels = {
  employee: 'Employee',
  hr: 'HR Manager',
  company: 'Client',
  superadmin: 'Super Admin',
};

const userNames = {
  employee: 'Sarah Johnson',
  hr: 'Amanda Foster',
  company: 'Client Partner',
  superadmin: 'System Admin',
};

const userInitials = {
  employee: 'SJ',
  hr: 'AF',
  company: 'CP',
  superadmin: 'SA',
};

const rolePrefixes = {
  employee: 'employee',
  hr: 'hr',
  company: 'company',
  superadmin: 'admin',
};

export function Layout({ role, onLogout, auth, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = navByRole[role] || [];
  const badgeColor = roleColors[role] || 'bg-slate-500';
  const pathPrefix = rolePrefixes[role] || role;

  // Find active nav item based on URL path
  const activeItem = navItems.find(item => location.pathname === `/${pathPrefix}/${item.id}`) || navItems[0];
  const currentPage = activeItem ? activeItem.id : 'dashboard';

  const displayName = auth?.name || userNames[role] || 'User';
  const displayInitials = displayName
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const formatTime = (d) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  const formatDate = (d) => d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const Sidebar = () => (
    <div className="flex flex-col h-full" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-white font-semibold leading-tight">WorkForge</div>
            <div className="text-slate-500 text-xs">Workforce Management</div>
          </div>
        </div>
      </div>

      {/* Role badge */}
      <div className="px-4 py-4">
        <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
          <div className={`w-9 h-9 ${badgeColor} rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
            {displayInitials}
          </div>
          <div className="min-w-0">
            <div className="text-white text-sm font-medium truncate">{displayName}</div>
            <div className="text-slate-400 text-xs">{roleLabels[role]}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        <div className="text-slate-500 text-xs px-3 py-2 uppercase tracking-wider">Navigation</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { navigate(`/${pathPrefix}/${item.id}`); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 group ${isActive
                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/20'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
              <span className="flex-1 text-left">{item.label}</span>
              {isActive && <ChevronRight className="w-3 h-3 text-indigo-400" />}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-white/6 space-y-1">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: 'DM Sans, sans-serif', background: 'var(--background)' }}>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-col flex-shrink-0 bg-[#0f172a]" style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-[#0f172a] h-full flex flex-col z-10">
            <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <Sidebar />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-border h-16 flex items-center px-4 lg:px-6 gap-4 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-slate-500 hover:text-slate-800"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1">
            <div className="text-slate-800 font-semibold capitalize text-sm lg:text-base">
              {navItems.find(n => n.id === currentPage)?.label || 'Dashboard'}
            </div>
            <div className="text-slate-400 text-xs hidden sm:block">{formatDate(currentTime)}</div>
          </div>

          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-border">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-600 text-xs" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{formatTime(currentTime)}</span>
          </div>

          <div className={`w-8 h-8 ${badgeColor} rounded-full flex items-center justify-center text-white text-xs font-bold`}>
            {displayInitials}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
