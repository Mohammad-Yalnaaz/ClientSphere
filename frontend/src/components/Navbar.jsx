import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../config/api.config';
import { Bell, Search } from 'lucide-react';

const Navbar = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await api.get('/notifications/unread-count');
        setUnreadCount(res.data.data.unreadCount || 0);
      } catch (err) {
        // ignore
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
      {/* Search hint */}
      <div className="flex items-center gap-2 text-slate-400 text-sm w-72 bg-slate-50 px-3.5 py-1.5 rounded-lg border border-slate-200/80">
        <Search className="h-4 w-4 text-slate-400" />
        <span className="text-slate-400 text-xs">Search projects, tasks, clients...</span>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-4">
        <Link
          to="/notifications"
          className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-4 w-4 bg-indigo-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
