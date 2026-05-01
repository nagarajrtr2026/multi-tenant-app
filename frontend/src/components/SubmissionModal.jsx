import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, UploadCloud } from 'lucide-react';
import api from '../utils/api';

export default function SubmissionModal({ task, onClose, onSubmitted }) {
  const [textSubmission, setTextSubmission] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!textSubmission.trim() && !file) return setError('Please provide text or attach a file.');
    
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('taskId', task.id);
      formData.append('text_submission', textSubmission);
      if (file) {
        formData.append('file', file);
      }

      await api.post('/submissions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onSubmitted();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit task.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-darker/80 backdrop-blur-sm" />

      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg glass-panel rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-900">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/20">
          <h2 className="text-xl font-bold flex items-center gap-2"><UploadCloud size={20} className="text-accent" /> Submit Work</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div className="mb-2">
            <label className="block text-sm font-medium text-slate-400 mb-1">Task</label>
            <p className="font-semibold text-white bg-slate-950 px-4 py-3 rounded-xl border border-slate-800">{task.title}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Attach File (PDF, DOC, Image)</label>
            <input 
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl px-4 py-3 focus:outline-none focus:border-accent text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Submission Details</label>
            <textarea 
              value={textSubmission}
              onChange={(e) => setTextSubmission(e.target.value)}
              placeholder="Provide more details or a link to your work..."
              className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl px-4 py-3 focus:outline-none focus:border-accent text-white min-h-[100px] resize-y placeholder-slate-500"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="mt-4 flex gap-3">
            <button type="button" onClick={onClose} className="w-1/2 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="w-1/2 bg-gradient-to-r from-primary to-accent hover:from-indigo-600 hover:to-cyan-500 text-white font-bold py-3 rounded-xl transition-shadow shadow-lg shadow-primary/20 disabled:opacity-50" disabled={loading}>
              {loading ? 'Submitting...' : 'Confirm Submission'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
