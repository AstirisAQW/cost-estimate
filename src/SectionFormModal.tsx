import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SectionFormModalProps {
  show: boolean;
  title: string;
  onTitleChange: (val: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export function SectionFormModal({
  show,
  title,
  onTitleChange,
  onSubmit,
  onClose,
}: SectionFormModalProps) {
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
              <h3 className="font-bold text-zinc-900">Add New Section</h3>
              <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 block">
                Section Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="e.g. Earthworks"
                autoFocus
              />
              <div className="flex gap-3 mt-6">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 text-sm font-bold text-zinc-500 hover:text-zinc-700"
                >
                  Cancel
                </button>
                <button
                  onClick={onSubmit}
                  className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all"
                >
                  Create Section
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
