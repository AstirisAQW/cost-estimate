import React from 'react';
import { HardHat, Plus, Folder, ChevronRight, Book } from 'lucide-react';
import { Project, CatalogItem } from './index';

interface SidebarProps {
  projects: Project[];
  catalog: CatalogItem[];
  activeProjectId: string | null;
  showCatalog: boolean;
  onSelectProject: (id: string) => void;
  onShowCatalog: () => void;
  onNewProject: () => void;
}

export function Sidebar({
  projects,
  catalog,
  activeProjectId,
  showCatalog,
  onSelectProject,
  onShowCatalog,
  onNewProject,
}: SidebarProps) {
  return (
    <aside className="w-64 bg-white border-r border-zinc-200 flex flex-col flex-shrink-0">
      {/* Brand + new project */}
      <div className="p-6 border-b border-zinc-100">
        <div className="flex items-center gap-2 mb-6">
          <div className="bg-emerald-600 p-2 rounded-lg">
            <HardHat className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">Cost Estimate</h1>
        </div>
        <button
          onClick={onNewProject}
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl transition-all shadow-sm font-bold text-sm"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        <div className="flex items-center justify-between px-2 mb-2">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Projects</p>
        </div>

        {projects.map((p) => {
          const isActive = activeProjectId === p.id && !showCatalog;
          return (
            <button
              key={p.id}
              onClick={() => onSelectProject(p.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700 font-bold'
                  : 'text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <Folder className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-zinc-400'}`} />
                <span className="truncate">{p.name}</span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4" />}
            </button>
          );
        })}

        <div className="pt-6 px-2 mb-2">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Resources</p>
        </div>

        <button
          onClick={onShowCatalog}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
            showCatalog
              ? 'bg-emerald-50 text-emerald-700 font-bold'
              : 'text-zinc-600 hover:bg-zinc-50'
          }`}
        >
          <Book className={`w-4 h-4 ${showCatalog ? 'text-emerald-600' : 'text-zinc-400'}`} />
          Catalog
          <span className="ml-auto bg-zinc-100 text-zinc-500 text-[10px] px-1.5 py-0.5 rounded-full">
            {catalog.length}
          </span>
        </button>
      </div>
    </aside>
  );
}
