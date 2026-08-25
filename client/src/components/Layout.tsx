import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden p-8 bg-gradient-to-b from-slate-900/40 to-slate-950">
          <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
