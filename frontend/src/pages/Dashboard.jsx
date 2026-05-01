import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import SubmissionModal from '../components/SubmissionModal';
import MemberManagement from '../components/MemberManagement';
import SubmissionsReview from '../components/SubmissionsReview';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Plus, LayoutDashboard, Users, FileText, CheckCircle, Clock } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  
  // Tabs: 'tasks', 'members', 'submissions'
  const [activeTab, setActiveTab] = useState('tasks');
  
  // Task specific state
  const [tasks, setTasks] = useState([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [loadingTasks, setLoadingTasks] = useState(true);

  // Submission specific state
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submittingTask, setSubmittingTask] = useState(null);

  const fetchTasks = async () => {
    setLoadingTasks(true);
    try {
      const res = await api.get('/tasks');
      setTasks(res.data);
    } catch (error) {
      console.error('Failed to fetch tasks', error);
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'tasks') {
      fetchTasks();
    }
  }, [activeTab]);

  const handleCreateOrUpdateTask = async (taskData) => {
    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}`, taskData);
        fetchTasks();
      } else {
        const res = await api.post('/tasks', taskData);
        console.log('API response after create:', res.data);
        
        // Extract the newly created task
        const newTask = res.data.task || res.data;
        
        console.log('Tasks state before update:', tasks);
        // Prepend new task to the local state immediately
        setTasks((prev) => [newTask, ...prev]);
      }
      setIsTaskModalOpen(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Failed to save task', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchTasks();
    } catch (error) {
      console.error('Failed to delete task', error);
    }
  };

  const pendingCount = tasks.filter((t) => t.status === 'pending' || t.status === 'in_progress').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div className="flex h-screen bg-darker text-white font-sans">
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        className="w-72 bg-slate-900 border-r border-slate-800 flex-col hidden md:flex"
      >
        <div className="p-8 border-b border-slate-800 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-xl shadow-lg shadow-primary/20">
            N
          </div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            Nova Task
          </h2>
        </div>
        
        <div className="flex-1 p-6 flex flex-col gap-3">
          <div className="mb-4 px-2 uppercase text-xs font-bold text-slate-500 tracking-wider">
            Workspace: <span className="text-white ml-1">{user.org_name || 'Organization'}</span>
          </div>

          <button 
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'tasks' ? 'bg-primary/20 text-primary border border-primary/20 font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <LayoutDashboard size={20} /> Tasks
          </button>

          {user.role === 'admin' && (
            <button 
              onClick={() => setActiveTab('members')}
              className={`px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'members' ? 'bg-primary/20 text-primary border border-primary/20 font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              <Users size={20} /> Members
            </button>
          )}

          <button 
            onClick={() => setActiveTab('submissions')}
            className={`px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'submissions' ? 'bg-primary/20 text-primary border border-primary/20 font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <FileText size={20} /> Submissions
          </button>
        </div>

        <div className="p-6 border-t border-slate-800 mt-auto bg-slate-900/50">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-xl font-bold border border-slate-700 text-white">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{user?.name || 'User'}</p>
              <p className="text-xs text-primary font-medium tracking-wide uppercase mt-0.5">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex items-center justify-center gap-2 w-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 py-3 rounded-xl transition-colors text-sm font-semibold border border-transparent hover:border-red-500/20"
          >
            <LogOut size={16} /> Log Out
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {activeTab === 'members' && <MemberManagement />}
        {activeTab === 'submissions' && <SubmissionsReview userRole={user.role} />}
        
        {activeTab === 'tasks' && (
          <>
            <header className="h-24 border-b border-slate-800 flex items-center justify-between px-10 bg-slate-950/50 backdrop-blur-md z-10 shrink-0">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-wide">Tasks Overview</h1>
                <p className="text-sm text-slate-400 mt-1">Manage, assign, and track organizational tasks</p>
              </div>
              {user.role === 'admin' && (
                <button 
                  onClick={() => { setEditingTask(null); setIsTaskModalOpen(true); }}
                  className="bg-primary hover:bg-indigo-500 text-white font-semibold py-2.5 px-6 rounded-xl transition-all shadow-lg shadow-primary/30 flex items-center gap-2 m-0"
                >
                  <Plus size={18} /> New Task
                </button>
              )}
            </header>

            <div className="flex-1 overflow-y-auto p-10 relative">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 rounded-2xl flex items-center gap-5 border border-slate-800/50">
                  <div className="p-4 bg-primary/20 text-primary rounded-xl"><LayoutDashboard size={24} /></div>
                  <div>
                    <p className="text-slate-400 text-sm font-medium">Total Tasks</p>
                    <p className="text-3xl font-bold">{tasks.length}</p>
                  </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-6 rounded-2xl flex items-center gap-5 border border-slate-800/50">
                  <div className="p-4 bg-blue-500/20 text-blue-400 rounded-xl"><Clock size={24} /></div>
                  <div>
                    <p className="text-slate-400 text-sm font-medium">Active & Pending</p>
                    <p className="text-3xl font-bold">{pendingCount}</p>
                  </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel p-6 rounded-2xl flex items-center gap-5 border border-slate-800/50">
                  <div className="p-4 bg-green-500/20 text-green-400 rounded-xl"><CheckCircle size={24} /></div>
                  <div>
                    <p className="text-slate-400 text-sm font-medium">Completed</p>
                    <p className="text-3xl font-bold">{completedCount}</p>
                  </div>
                </motion.div>
              </div>

              {loadingTasks ? (
                <div className="flex justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-24 glass-panel rounded-2xl border border-slate-800">
                  <p className="text-slate-400 text-lg">No tasks found. {user.role === 'admin' ? 'Create one to get started.' : 'Wait for an admin to assign one.'}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-12">
                  <AnimatePresence>
                    {tasks.map((task, index) => (
                      <TaskCard 
                        key={task.id} 
                        task={task} 
                        index={index}
                        onEdit={() => { setEditingTask(task); setIsTaskModalOpen(true); }}
                        onDelete={() => handleDeleteTask(task.id)}
                        onOpenSubmit={() => { setSubmittingTask(task); setIsSubmitModalOpen(true); }}
                        userRole={user.role}
                        currentUserId={user.id}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Modals */}
      <AnimatePresence>
        {isTaskModalOpen && (
          <TaskModal 
            task={editingTask} 
            onClose={() => setIsTaskModalOpen(false)} 
            onSave={handleCreateOrUpdateTask} 
          />
        )}
        {isSubmitModalOpen && (
          <SubmissionModal 
            task={submittingTask}
            onClose={() => setIsSubmitModalOpen(false)}
            onSubmitted={() => {
              setIsSubmitModalOpen(false);
              // optionally fetchTasks if submitting affects them, though submissions are tracked separately
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
