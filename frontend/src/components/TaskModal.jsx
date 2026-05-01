import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export default function TaskModal({ task, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending'
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'pending'
      });
      setFile(null);
    }
  }, [task]);

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('status', formData.status);
    if (file) {
      data.append('file', file);
    }
    onSave(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-darker/80 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg glass-panel rounded-2xl overflow-hidden shadow-2xl shadow-primary/10 border border-slate-300 bg-slate-400"
      >
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-bold">{task ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-0">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Task Title</label>
            <input 
              type="text" 
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Fix database connection"
              className="input-field mb-0"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide more details about this task..."
              className="input-field mb-0 min-h-[120px] resize-y"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Status</label>
            <select 
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="input-field mb-0 py-3 bg-slate-900 appearance-none"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Attachment (Optional)</label>
            <input 
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl px-4 py-3 focus:outline-none focus:border-accent text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30"
            />
            {task && task.file_url && !file && (
              <p className="text-xs text-slate-500 mt-2">A file is already attached. Uploading a new one will replace it.</p>
            )}
          </div>

          <div className="mt-4 flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary w-1/2">
              Cancel
            </button>
            <button type="submit" className="btn-primary m-0! w-1/2">
              {task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
        <br />
        
      </motion.div>
    </div>
  );
}
