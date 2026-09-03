import React, { useEffect, useState } from 'react';
import api from '../../config/api.config';
import { Activity, Clock } from 'lucide-react';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/activity-logs');
        setLogs(res.data.data.logs || []);
      } catch (err) {
        // ignore
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Activity Logs</h1>
        <p className="text-sm text-slate-500 mt-1">Audit trail and historical record of actions taken across the organization</p>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <Activity className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No activity logged yet</h3>
          <p className="text-sm text-slate-400 mt-1">Actions taken in your workspace will automatically be recorded here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100 shadow-sm overflow-hidden">
          {logs.map((log) => (
            <div key={log._id} className="p-4 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-700 tracking-wider">
                    {log.action}
                  </span>
                  <span className="text-xs font-semibold text-indigo-600">
                    {log.entityType}
                  </span>
                </div>
                <p className="text-sm text-slate-800 font-medium">{log.description}</p>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>By: <strong className="text-slate-600">{log.userId?.firstName} {log.userId?.lastName} ({log.userId?.email})</strong></span>
                </div>
              </div>

              <span className="text-xs text-slate-400 flex items-center gap-1 shrink-0 pt-0.5">
                <Clock className="h-3 w-3" />
                {new Date(log.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityLogs;
