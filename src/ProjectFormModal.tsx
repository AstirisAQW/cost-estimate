import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface NewProjectState {
  name: string;
  subject: string;
  location: {
    street: string;
    barangay: string;
    city: string;
    province: string;
    postalCode: string;
  };
  owner: string;
}

interface ProjectFormModalProps {
  show: boolean;
  newProject: NewProjectState;
  onUpdate: (val: NewProjectState) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export function ProjectFormModal({
  show,
  newProject,
  onUpdate,
  onSubmit,
  onClose,
}: ProjectFormModalProps) {
  const { location } = newProject;
  const updateLoc = (patch: Partial<NewProjectState['location']>) =>
    onUpdate({ ...newProject, location: { ...location, ...patch } });

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-md overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <h3 className="font-bold text-zinc-900">Create New Project</h3>
              <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 block">
                  Project Name
                </label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => onUpdate({ ...newProject, name: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="e.g. Residential Building A"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 block">
                  Subject
                </label>
                <input
                  type="text"
                  value={newProject.subject}
                  onChange={(e) => onUpdate({ ...newProject, subject: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="e.g. Cost Estimate"
                />
              </div>

              {/* Location */}
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 block">
                  Location Details
                </label>
                <div className="grid grid-cols-1 gap-3">
                  <input
                    type="text"
                    value={location.street}
                    onChange={(e) => updateLoc({ street: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="House Number / Street Name"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={location.barangay}
                      onChange={(e) => updateLoc({ barangay: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="Barangay / Subdivision"
                    />
                    <input
                      type="text"
                      list="ph-cities"
                      value={location.city}
                      onChange={(e) => updateLoc({ city: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="City / Municipality"
                    />
                    <datalist id="ph-cities">
                      {['Manila','Quezon City','Davao City','Cebu City','Zamboanga City',
                        'Taguig','Pasig','Cagayan de Oro','Parañaque','Makati'].map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={location.province}
                      onChange={(e) => updateLoc({ province: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="Province"
                    />
                    <input
                      type="text"
                      maxLength={4}
                      value={location.postalCode}
                      onChange={(e) => updateLoc({ postalCode: e.target.value.replace(/\D/g, '') })}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                      placeholder="Postal Code (4 digits)"
                    />
                  </div>
                </div>
              </div>

              {/* Owner */}
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 block">
                  Owner
                </label>
                <input
                  type="text"
                  value={newProject.owner}
                  onChange={(e) => onUpdate({ ...newProject, owner: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="e.g. Juan Dela Cruz"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex justify-end gap-3">
              <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-zinc-500 hover:text-zinc-700">
                Cancel
              </button>
              <button
                onClick={onSubmit}
                className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold text-sm shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all"
              >
                Create Project
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
