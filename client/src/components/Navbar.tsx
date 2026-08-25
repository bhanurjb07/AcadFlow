import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, User, LogOut, ShieldCheck, Sparkles, BookOpen } from 'lucide-react';
import api from '../api/client';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [notices, setNotices] = useState<any[]>([]);
  const [showNotices, setShowNotices] = useState(false);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await api.get('/notices');
        if (res.data.success) {
          setNotices(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch notices:', err);
      }
    };
    if (user) {
      fetchNotices();
    }
  }, [user]);

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'teacher':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'student':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-900/80 px-6 backdrop-blur-md">
      <div className="flex items-center space-x-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-lg shadow-indigo-500/25">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
            AcadFlow
          </span>
          <span className="ml-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
            v2.0
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Notice Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotices(!showNotices)}
            className="relative rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Bell className="h-5 w-5" />
            {notices.length > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
            )}
          </button>

          {showNotices && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-700/80 bg-slate-900 p-4 shadow-2xl z-50">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                <h4 className="font-semibold text-sm text-slate-200">System Bulletins</h4>
                <span className="text-xs text-indigo-400">{notices.length} active</span>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-3">
                {notices.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No recent notices</p>
                ) : (
                  notices.map((n) => (
                    <div key={n._id} className="rounded-lg bg-slate-800/60 p-2.5 border border-slate-700/40">
                      <p className="text-xs font-medium text-slate-200">{n.title}</p>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{n.content}</p>
                      <span className="text-[10px] text-slate-500 mt-2 block">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex items-center space-x-3 border-l border-slate-800 pl-4">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-semibold text-slate-200 leading-none">{user?.name}</div>
            <div className="mt-1">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${getRoleBadgeColor(user?.role)}`}>
                {user?.role?.toUpperCase()}
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className="flex items-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
