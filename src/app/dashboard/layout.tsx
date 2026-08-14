import React from 'react';
import { Sidebar } from '@/components/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row w-full">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-full overflow-x-hidden min-w-0">
        {children}
      </main>
    </div>
  );
}
