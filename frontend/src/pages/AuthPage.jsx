import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ThreeBackground from '../components/ThreeBackground';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    orgName: '',
    userName: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.orgName, formData.userName, formData.email, formData.password);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    }
  };

  return (
    <div className="flex h-screen w-full relative overflow-hidden bg-darker text-white font-sans">
      {/* 3D Animated Background covering the whole screen, but forms sit on top */}
      <div className="absolute inset-0 z-0">
        <ThreeBackground />
      </div>

      {/* Main Container - Centered */}
      <div className="relative z-10 flex w-full max-w-6xl mx-auto items-center justify-center h-full px-6 lg:px-12">
        
        {/* Left Side: Branding / Messaging */}
        <div className="hidden lg:flex flex-col justify-center w-1/2 pr-12">
          <div className="p-8 pb-10 bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl shadow-primary/20">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-3xl shadow-lg shadow-primary/30 mb-8">
            AI
            </div>
            <h1 className="text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-6 drop-shadow-sm">
              Genora AI
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed max-w-md">
              Your AI-driven partner for task management, project tracking, and team collaboration.
            </p>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="w-full max-w-md lg:w-1/2 flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full p-10 bg-slate-900/60 backdrop-blur-2xl border border-white/5 rounded-3xl shadow-[0_0_50px_rgba(30,41,59,0.7)]"
          >
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white mb-3">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-slate-400">
                {isLogin ? 'Enter your details to access your workspace.' : 'Sign up to start organizing your team.'}
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <AnimatePresence mode="popLayout">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-col gap-4 overflow-hidden"
                  >
                    <input
                      type="text"
                      name="orgName"
                      placeholder="Organization Name"
                      value={formData.orgName}
                      onChange={handleChange}
                      className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl px-5 py-3.5 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 text-white transition-all duration-300 placeholder-slate-500"
                      required={!isLogin}
                    />
                    <input
                      type="text"
                      name="userName"
                      placeholder="Your Full Name"
                      value={formData.userName}
                      onChange={handleChange}
                      className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl px-5 py-3.5 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 text-white transition-all duration-300 placeholder-slate-500"
                      required={!isLogin}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl px-5 py-3.5 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 text-white transition-all duration-300 placeholder-slate-500"
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl px-5 py-3.5 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 text-white transition-all duration-300 placeholder-slate-500"
                required
              />

              <button type="submit" className="w-full bg-gradient-to-r from-primary to-accent hover:from-indigo-600 hover:to-cyan-500 text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-300 shadow-lg shadow-primary/30 mt-6 transform hover:-translate-y-0.5">
                {isLogin ? 'Log In to Nova' : 'Register Organization'}
              </button>
            </form>

            <div className="mt-8 text-center text-sm">
              <p className="text-slate-400">
                {isLogin ? "Don't have an account? " : "Already have an organization? "}
                <button 
                  onClick={() => { setIsLogin(!isLogin); setError(''); }}
                  className="text-accent hover:text-white transition-colors font-semibold ml-1"
                >
                  {isLogin ? 'Register' : 'Login'}
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
