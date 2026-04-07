import React, { useState } from 'react';
import { Plane, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const GatePage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Artificial delay for a smoother feel
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (login(password)) {
      navigate('/dashboard');
    } else {
      setError('Senha incorreta. Tente novamente.');
      setPassword('');
    }
    setIsLoading(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6"
    >
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center space-y-8 border border-white/20 dark:border-slate-800"
      >
        <div className="bg-blue-600 w-20 h-20 rounded-[1.5rem] flex items-center justify-center mx-auto shadow-xl shadow-blue-600/30">
          <Plane className="text-white w-10 h-10" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Travel Planner</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
            Área restrita. Digite sua chave de acesso para gerenciar seus roteiros.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha secreta"
                autoFocus
                className="block w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-900 dark:text-white font-bold placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
            </div>
            {error && (
              <motion.p 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-red-500 text-[10px] font-black uppercase tracking-widest text-left ml-2"
              >
                {error}
              </motion.p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-900 dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl uppercase tracking-[0.2em] text-[10px] flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Entrar no Sistema</span>}
          </button>
        </form>
      </motion.div>
      
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em]"
      >
        Built for modern explorers
      </motion.p>
    </motion.div>
  );
};
