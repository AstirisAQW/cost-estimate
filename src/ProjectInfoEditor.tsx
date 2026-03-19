import React from 'react';
import { Trash2 } from 'lucide-react';
import { Project } from './index';

interface ProjectInfoEditorProps {
  project: Project;
  onUpdate: (updates: Partial<Project>) => void;
  onDelete: () => void;
}

export function ProjectInfoEditor({ project, onUpdate, onDelete }: ProjectInfoEditorProps) {
  const { location } = project;
  const updateLocation = (patch: Partial<Project['location']>) =>
    onUpdate({ location: { ...location, ...patch } });

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-6 mb-8 shadow-sm">
      <div className="flex justify-between items-start mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1">
          {/* Project name */}
          <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 block">
              Project Name
            </label>
            <input
              type="text"
              value={project.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              placeholder="Enter project name..."
              className="w-full text-lg font-bold text-zinc-900 border-none p-0 focus:ring-0 placeholder:text-zinc-300"
            />
          </div>

          {/* Location */}
          <div className="md:col-span-2">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 block">
              Location Details
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="text-[8px] font-bold text-zinc-400 uppercase mb-1 block">
                  Street / House No.
                </label>
                <input
                  type="text"
                  value={location.street}
                  onChange={(e) => updateLocation({ street: e.target.value })}
                  placeholder="Street..."
                  className="w-full text-xs text-zinc-600 border-none p-0 focus:ring-0 placeholder:text-zinc-300"
                />
              </div>
              <div>
                <label className="text-[8px] font-bold text-zinc-400 uppercase mb-1 block">Barangay</label>
                <input
                  type="text"
                  value={location.barangay}
                  onChange={(e) => updateLocation({ barangay: e.target.value })}
                  placeholder="Barangay..."
                  className="w-full text-xs text-zinc-600 border-none p-0 focus:ring-0 placeholder:text-zinc-300"
                />
              </div>
              <div>
                <label className="text-[8px] font-bold text-zinc-400 uppercase mb-1 block">City</label>
                <input
                  type="text"
                  value={location.city}
                  onChange={(e) => updateLocation({ city: e.target.value })}
                  placeholder="City..."
                  className="w-full text-xs text-zinc-600 border-none p-0 focus:ring-0 placeholder:text-zinc-300"
                />
              </div>
              <div>
                <label className="text-[8px] font-bold text-zinc-400 uppercase mb-1 block">Province</label>
                <input
                  type="text"
                  value={location.province}
                  onChange={(e) => updateLocation({ province: e.target.value })}
                  placeholder="Province..."
                  className="w-full text-xs text-zinc-600 border-none p-0 focus:ring-0 placeholder:text-zinc-300"
                />
              </div>
              <div>
                <label className="text-[8px] font-bold text-zinc-400 uppercase mb-1 block">Postal Code</label>
                <input
                  type="text"
                  maxLength={4}
                  value={location.postalCode}
                  onChange={(e) => updateLocation({ postalCode: e.target.value.replace(/\D/g, '') })}
                  placeholder="0000"
                  className="w-full text-xs text-zinc-600 border-none p-0 focus:ring-0 placeholder:text-zinc-300 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Owner */}
          <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 block">Owner</label>
            <input
              type="text"
              value={project.owner}
              onChange={(e) => onUpdate({ owner: e.target.value })}
              placeholder="Enter owner name..."
              className="w-full text-sm text-zinc-600 border-none p-0 focus:ring-0 placeholder:text-zinc-300"
            />
          </div>
        </div>

        <button
          onClick={onDelete}
          className="p-2 text-zinc-300 hover:text-red-500 transition-colors"
          title="Delete Project"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="pt-4 border-t border-zinc-50 text-xs text-zinc-400">
        Created on {project.date}
      </div>
    </div>
  );
}
