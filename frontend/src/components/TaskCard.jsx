import { motion } from 'framer-motion';
import { Edit2, Trash2, Clock, CheckCircle, AlertCircle, Upload } from 'lucide-react';

export default function TaskCard({ task, index, onEdit, onDelete, onOpenSubmit, userRole, currentUserId }) {
  const canModify = userRole === 'admin' || task.user_id === currentUserId;

  const statusColors = {
    pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    in_progress: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    completed: 'bg-green-500/10 text-green-400 border-green-500/20',
  };

  const statusIcons = {
    pending: <AlertCircle size={14} />,
    in_progress: <Clock size={14} />,
    completed: <CheckCircle size={14} />
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      className="glass-panel p-6 rounded-2xl hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 border border-slate-700/50 flex flex-col h-full bg-slate-900/60"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border ${statusColors[task.status]}`}>
          {statusIcons[task.status]}
          <span className="capitalize">{task.status.replace('_', ' ')}</span>
        </div>
        
        <div className="flex gap-2">
          {userRole === 'member' && (
            <button 
              onClick={onOpenSubmit}
              className="text-white hover:text-accent bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition flex items-center gap-2 text-xs font-semibold"
            >
              <Upload size={14} /> Submit
            </button>
          )}

          {canModify && (
            <>
              <button onClick={onEdit} className="text-slate-400 hover:text-primary transition-colors p-1.5 bg-slate-800/50 rounded hover:bg-slate-800">
                <Edit2 size={16} />
              </button>
              <button onClick={onDelete} className="text-slate-400 hover:text-red-400 transition-colors p-1.5 bg-slate-800/50 rounded hover:bg-slate-800">
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      <h3 className="text-xl font-bold text-white mb-3 line-clamp-1">{task.title}</h3>
      <p className="text-slate-400 text-sm mb-6 line-clamp-3 flex-1 leading-relaxed">{task.description}</p>

      <div className="mt-auto border-t border-slate-800/50 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-950/30 -mx-6 -mb-6 px-6 py-4 rounded-b-2xl">
        {task.file_url ? (
          <a 
            href={`http://localhost:5000${task.file_url}`} 
            target="_blank" 
            rel="noreferrer"
            className="text-xs font-semibold text-primary hover:text-accent flex items-center gap-1.5 transition-colors"
          >
            <Upload size={14} className="rotate-180" /> View Attachment
          </a>
        ) : (
          <span className="text-xs text-slate-500 font-medium tracking-wide">No attachment</span>
        )}
        <span className="text-xs text-slate-500 font-medium tracking-wide">
          Updated: {new Date(task.updated_at).toLocaleDateString()}
        </span>
      </div>
    </motion.div>
  );
}
