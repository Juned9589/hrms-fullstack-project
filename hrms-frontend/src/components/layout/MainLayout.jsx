import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function MainLayout() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface text-ink">
      <div className="hidden py-3 shrink-0 md:flex">
        <Sidebar />
      </div>

      <div className="min-w-0 flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
