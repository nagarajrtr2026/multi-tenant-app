import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { UserPlus, Users, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MemberManagement() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  
  const [formData, setFormData] = useState({ userName: '', email: '', password: '' });
  const [inviteError, setInviteError] = useState('');

  const fetchMembers = async () => {
    try {
      const res = await api.get('/members');
      setMembers(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteError('');
    try {
      await api.post('/members/add', formData);
      setIsInviteOpen(false);
      setFormData({ userName: '', email: '', password: '' });
      fetchMembers();
    } catch (error) {
      setInviteError(error.response?.data?.error || 'Failed to add member');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Users className="text-primary"/> Managing Members</h2>
          <p className="text-slate-400 text-sm mt-1">Add and manage users within your organization.</p>
        </div>
        <button onClick={() => setIsInviteOpen(true)} className="bg-primary hover:bg-indigo-500 text-white font-semibold py-2 px-6 rounded-xl transition-colors shadow-lg shadow-primary/30 flex items-center gap-2">
          <UserPlus size={18} /> Invite Member
        </button>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-700/50">
        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" size={32}/></div>
        ) : members.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No members found.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-700">
                <th className="p-4 font-medium text-slate-300">Name</th>
                <th className="p-4 font-medium text-slate-300">Email</th>
                <th className="p-4 font-medium text-slate-300">Role</th>
                <th className="p-4 font-medium text-slate-300">Joined</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-white border border-slate-600">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    {member.name}
                  </td>
                  <td className="p-4 text-slate-400">{member.email}</td>
                  <td className="p-4 text-slate-400 capitalize">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${member.role === 'admin' ? 'bg-primary/20 text-primary border border-primary/20' : 'bg-slate-700 text-slate-300'}`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400">{new Date(member.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Invite Modal */}
      <AnimatePresence>
        {isInviteOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsInviteOpen(false)} className="absolute inset-0 bg-darker/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-8 shadow-2xl">
              <h3 className="text-xl font-bold mb-4">Add New Member</h3>
              {inviteError && <div className="bg-red-500/10 text-red-400 p-3 rounded-xl mb-4 text-sm border border-red-500/20">{inviteError}</div>}
              <form onSubmit={handleInvite} className="flex flex-col gap-4">
                <input type="text" placeholder="Full Name" value={formData.userName} onChange={(e) => setFormData({...formData, userName: e.target.value})} className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl px-4 py-3 focus:outline-none focus:border-accent text-white" required />
                <input type="email" placeholder="Email Address" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl px-4 py-3 focus:outline-none focus:border-accent text-white" required />
                <input type="password" placeholder="Temporary Password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl px-4 py-3 focus:outline-none focus:border-accent text-white" required />
                <div className="flex gap-3 mt-4">
                  <button type="button" onClick={() => setIsInviteOpen(false)} className="w-1/2 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 rounded-xl transition-colors">Cancel</button>
                  <button type="submit" className="w-1/2 bg-primary hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-colors">Invite Member</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
