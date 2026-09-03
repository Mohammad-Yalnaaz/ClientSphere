import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api.config';
import { Briefcase, CheckCircle2, Clock, Users, AlertTriangle } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard');
        setData(res.data.data.dashboard);
      } catch (err) {
        // ignore
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  const overview = data?.overview;
  const deadlines = data?.upcomingDeadlines;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {user?.firstName} 👋
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Here is what is happening across your projects and team today.
        </p>
      </div>

      {/* Metrics Row (Admin / Manager) */}
      {overview && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Clients</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{overview.activeClients}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Projects</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{overview.activeProjects}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Tasks</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{overview.pendingTasks}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Team Members</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{overview.activeUsers}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Deadlines & Workload Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deadlines */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-indigo-600" />
            Upcoming Deadlines (Next 7 Days)
          </h2>
          {deadlines?.tasks?.length === 0 && deadlines?.projects?.length === 0 ? (
            <p className="text-sm text-slate-400 py-4">No deadlines approaching in the next 7 days.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {deadlines?.tasks?.map((t) => (
                <div key={t._id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{t.title}</p>
                    <p className="text-xs text-slate-400">Project: {t.projectId?.name}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-lg border border-amber-200/60">
                    Due {new Date(t.dueDate).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Team Workload */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-indigo-600" />
            Team Workload
          </h2>
          {data?.teamWorkload?.length === 0 ? (
            <p className="text-sm text-slate-400 py-4">No workload data available.</p>
          ) : (
            <div className="space-y-3">
              {data?.teamWorkload?.map((w) => (
                <div key={w._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-center">
                      {w.firstName?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{w.firstName} {w.lastName}</p>
                      <p className="text-xs text-slate-400 capitalize">{w.role.toLowerCase()}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {w.taskCount} tasks
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
