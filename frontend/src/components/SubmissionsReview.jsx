import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { FileText, Loader2, CheckCircle, Info, XCircle, Download } from 'lucide-react';

export default function SubmissionsReview({ userRole }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackInputs, setFeedbackInputs] = useState({});

  const fetchSubmissions = async () => {
    try {
      const res = await api.get('/submissions');
      setSubmissions(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleEvaluate = async (id, status) => {
    try {
      await api.put(`/submissions/${id}`, { 
        status, 
        feedback: feedbackInputs[id] || ''
      });
      fetchSubmissions();
    } catch (e) {
      console.error('Error updating status', e);
    }
  };

  const handleFeedbackChange = (id, val) => {
    setFeedbackInputs(prev => ({ ...prev, [id]: val }));
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" size={32}/></div>;

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold flex items-center gap-2"><FileText className="text-primary"/> {userRole === 'admin' ? 'Submissions Review' : 'My Submissions'}</h2>
        <p className="text-slate-400 text-sm mt-1">
          {userRole === 'admin' ? 'Evaluate work submitted by organization members.' : 'View the status and feedback of your submitted work.'}
        </p>
      </div>

      <div className="grid gap-6">
        {submissions.length === 0 ? (
          <div className="text-center py-12 glass-panel rounded-xl text-slate-400">
            No submissions found.
          </div>
        ) : (
          submissions.map((sub) => (
            <div key={sub.id} className="glass-panel p-6 rounded-2xl flex flex-col xl:flex-row justify-between items-start gap-6 border border-slate-800">
              <div className="flex-1 w-full">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Task: {sub.task_title}</p>
                
                {sub.text_submission && (
                  <div className="text-slate-300 mt-2 bg-slate-950/50 p-4 border border-slate-800 rounded-lg whitespace-pre-wrap text-sm mb-3">
                    {sub.text_submission}
                  </div>
                )}

                {sub.file_url && (
                  <a 
                    href={`http://localhost:5000${sub.file_url}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-primary border border-slate-700 hover:border-primary rounded-lg transition-colors text-sm font-semibold mb-3"
                  >
                    <Download size={16} /> View Attached File
                  </a>
                )}

                <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                  {userRole === 'admin' && <span>Submitted by: <strong className="text-slate-300">{sub.user_name}</strong></span>}
                  <span>Date: {new Date(sub.created_at).toLocaleString()}</span>
                </div>

                {/* Member sees feedback if it exists */}
                {userRole === 'member' && sub.feedback && (
                  <div className="mt-4 p-4 rounded-xl border border-blue-500/20 bg-blue-500/10 text-sm text-blue-200">
                    <strong>Admin Feedback:</strong> {sub.feedback}
                  </div>
                )}
              </div>
              
              <div className="flex flex-col items-start xl:items-end gap-3 min-w-[280px] w-full xl:w-auto">
                <div className={`px-4 py-2 flex items-center gap-2 rounded-xl text-sm font-bold border w-full justify-center xl:w-auto ${
                  sub.status === 'approved' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                  sub.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                  'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                }`}>
                  {sub.status === 'approved' ? <CheckCircle size={18}/> : sub.status === 'rejected' ? <XCircle size={18}/> : <Info size={18}/>}
                  {sub.status.toUpperCase()}
                </div>

                {userRole === 'admin' && sub.status === 'submitted' && (
                  <div className="w-full flex flex-col gap-2 mt-2">
                    <textarea 
                      placeholder="Enter feedback (optional)"
                      value={feedbackInputs[sub.id] || ''}
                      onChange={(e) => handleFeedbackChange(sub.id, e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-primary resize-y min-h-[80px]"
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEvaluate(sub.id, 'rejected')}
                        className="flex-1 text-sm bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold py-2 px-3 rounded-lg transition-all border border-red-500/20"
                      >
                        Reject
                      </button>
                      <button 
                        onClick={() => handleEvaluate(sub.id, 'approved')}
                        className="flex-1 text-sm bg-green-500/10 hover:bg-green-500/20 text-green-400 font-semibold py-2 px-3 rounded-lg transition-all border border-green-500/20"
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                )}

                {/* If already evaluated, admin can see what they wrote */}
                {userRole === 'admin' && sub.status !== 'submitted' && sub.feedback && (
                  <div className="mt-2 text-xs text-slate-400 bg-slate-900/50 p-3 rounded-lg border border-slate-800 w-full text-left">
                    <strong className="text-slate-300">Given Feedback:</strong> {sub.feedback}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
