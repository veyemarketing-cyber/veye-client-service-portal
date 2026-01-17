
import React from 'react';
import { User, UserRole } from '../types';
import InstallPWA from './InstallPWA';

interface SidebarProps {
  currentUser: User;
  onLogout: () => void;
  onNavigate: (path: string) => void;
  currentPath: string;
}

const Sidebar: React.FC<SidebarProps> = ({ currentUser, onLogout, onNavigate, currentPath }) => {
  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-full border-r border-slate-800">
      <div className="p-6 flex flex-col space-y-1 border-b border-slate-800">
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <span className="bg-blue-600 p-1.5 rounded">VM</span>
          Veye Portal
        </h1>
        <p className="text-slate-400 text-xs mt-1 uppercase tracking-widest font-semibold">Client Service</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        <button 
          onClick={() => onNavigate('dashboard')}
          className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
            currentPath === 'dashboard' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Dashboard
        </button>
        <button 
          onClick={() => onNavigate('new-ticket')}
          className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
            currentPath === 'new-ticket' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Request
        </button>
      </nav>

      <div className="px-4">
        <InstallPWA />
      </div>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold">
            {currentUser.name.charAt(0)}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium text-white truncate">{currentUser.name}</span>
            <span className="text-xs text-slate-400 truncate">{currentUser.companyName}</span>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-full text-left px-4 py-2 text-sm rounded-lg hover:bg-red-900/30 hover:text-red-400 text-slate-400 transition-colors flex items-center gap-3"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
