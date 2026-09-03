import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CheckSquare,
  Bell,
  Activity,
  LogOut,
  FolderOpen
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', path: '/projects', icon: Briefcase },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
  ];

  // Admin & Manager see Clients
  if (user?.role === 'ADMINISTRATOR' || user?.role === 'MANAGER') {
    navItems.splice(1, 0, { name: 'Clients', path: '/clients', icon: Users });
  }

  // All users see Notifications
  navItems.push({ name: 'Notifications', path: '/notifications', icon: Bell });

  // Admin sees Activity Logs
  if (user?.role === 'ADMINISTRATOR') {
    navItems.push({ name: 'Activity Logs', path: '/activity-logs', icon: Activity });
  }

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div>
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100 gap-3">
          <div className="h-9 w-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm shadow-indigo-200">
            CS
          </div>
          <div>
            <h1 className="font-bold text-slate-800 leading-none">ClientSphere</h1>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{user?.role || 'Team'}</span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="h-4.5 w-4.5" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User profile & Logout */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-semibold text-sm">
              {user?.firstName?.[0] || 'U'}
            </div>
            <div className="truncate">
              <p className="text-sm font-semibold text-slate-800 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
