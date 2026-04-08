import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plane, LogOut, Settings, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  transparent?: boolean;
  absolute?: boolean;
  onSettingsClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ transparent, absolute, onSettingsClick }) => {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';
  const isTripView = location.pathname.startsWith('/trip/');

  return (
    <header className={`${absolute ? 'absolute top-0 left-0 right-0 z-50' : 'relative'} ${transparent ? 'bg-transparent border-none' : 'bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800'}`}>
      <div className="max-w-6xl mx-auto px-4 min-h-20 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => navigate('/dashboard')}>
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
            <Plane className="text-white w-5 h-5" />
          </div>
          <span className={`hidden sm:inline font-black tracking-tighter text-xl ${transparent ? 'text-white' : 'text-slate-900 dark:text-white'}`}>Travel Planner</span>
        </div>
        
        {!isTripView && (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-full cursor-pointer transition-all ${transparent ? 'text-white/70 hover:text-white bg-white/10 backdrop-blur-md border border-white/20' : 'text-slate-500 hover:text-blue-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-blue-400'}`}
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {isDashboard && onSettingsClick && (
              <button
                onClick={onSettingsClick}
                className={`p-2.5 rounded-full cursor-pointer transition-all ${transparent ? 'text-white/70 hover:text-white bg-white/10 backdrop-blur-md border border-white/20' : 'text-slate-500 hover:text-blue-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-blue-400'}`}
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
            
            <button
              onClick={logout}
              className={`flex items-center space-x-2 cursor-pointer transition-colors text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-full ${transparent ? 'text-white/70 hover:text-white bg-white/10 backdrop-blur-md border border-white/20' : 'text-slate-500 hover:text-red-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-red-400'}`}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
