import React from 'react';
import { Layout } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-white border-b border-zinc-200 h-16 flex items-center px-8 flex-shrink-0">
      <div className="flex items-center gap-4">
        <Layout className="w-5 h-5 text-zinc-400" />
        <h2 className="text-sm font-bold text-zinc-900">Project Dashboard</h2>
      </div>
    </header>
  );
}
