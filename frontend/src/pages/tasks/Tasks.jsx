import React, { useEffect, useState } from 'react';
import api from '../../config/api.config';
import { Plus, CheckSquare, Sparkles } from 'lucide-react';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
  });

  const fetchData = async () => {
    try {
      const projRes = await api.get('/projects');
      const projs = projRes.data.data.projects || [];
      setProjects(projs);

      if (projs.length > 0) {
        const pId = projs[0]._id;
        setSelectedProject(pId);
        const taskRes = await api.get(`/projects/${pId}/tasks`);
        setTasks(taskRes.data.data.tasks || []);
      }
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleProjectChange = async (projectId) => {
    setSelectedProject(projectId);
    setLoading(true);
    try {
      const taskRes = await api.get(`/projects/${projectId}/tasks`);
      setTasks(taskRes.data.data.tasks || []);
    } catch (err) {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAIDescription = async () => {
    if (!newTask.title || !selectedProject) {
      alert('Please enter a task title first.');
      return;
    }

    setGeneratingAI(true);
    try {
      const res = await api.post(`/ai/projects/${selectedProject}/generate-task-description`, {
        title: newTask.title,
      });
      setNewTask({ ...newTask, description: res.data.data.description });
    } catch (err) {
      alert(err.response?.data?.message || 'AI generation failed');
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!selectedProject) return;

    try {
      await api.post(`/projects/${selectedProject}/tasks`, newTask);
      setShowModal(false);
      setNewTask({ title: '', description: '', priority: 'MEDIUM' });
      handleProjectChange(selectedProject);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create task');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Task Board</h1>
          <p className="text-sm text-slate-500 mt-1">Manage project workflows, subtasks, and deliverables</p>
        </div>

        <div className="flex items-center gap-3">
          {projects.length > 0 && (
            <select
              value={selectedProject}
              onChange={(e) => handleProjectChange(e.target.value)}
              className="px-3.5 py-2 bg-white border border-slate-200 text-sm font-medium rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  Project: {p.name}
                </option>
              ))}
            </select>
          )}

          <button
            disabled={!selectedProject}
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-sm shadow-sm shadow-indigo-200 transition-all disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <CheckSquare className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No tasks in this project</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
            Break down the project scope by adding actionable tasks and assigning team members.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tasks.map((t) => (
            <div key={t._id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <h3 className="text-sm font-bold text-slate-900 leading-snug">{t.title}</h3>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded uppercase bg-slate-100 text-slate-700 shrink-0 ml-2">
                  {t.status}
                </span>
              </div>

              {t.description && (
                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed whitespace-pre-line">
                  {t.description}
                </p>
              )}

              <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-400">
                <span>Priority: <strong className="text-slate-700 font-semibold">{t.priority}</strong></span>
                {t.assignedTo && (
                  <span className="text-indigo-600 font-medium">
                    {t.assignedTo.firstName} {t.assignedTo.lastName}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Task Modal with Gemini AI Assistant */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Create Task</h2>
            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Implement OAuth Authentication"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">Description</label>
                  <button
                    type="button"
                    onClick={handleGenerateAIDescription}
                    disabled={generatingAI || !newTask.title}
                    className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 disabled:opacity-40"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    {generatingAI ? 'Drafting with Gemini...' : 'Generate with Gemini AI'}
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Details, requirements, and acceptance criteria"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
