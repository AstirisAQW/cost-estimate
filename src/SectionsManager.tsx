import React, { useRef } from 'react';
import { Plus, Copy, Download, Layout } from 'lucide-react';
// Plus is still used for Add Section + empty state
import { Project, CostItem } from './index';
import { ItemTable } from './ItemTable';
import { exportToCSV } from './helpers';

interface SectionsManagerProps {
  project: Project;
  onAddSection: () => void;
  onEditItem: (item: CostItem, sectionId: string) => void;
  onRemoveItem: (itemId: string) => void;
  onAddItemToSection: (sectionId: string) => void;
  onUpdateSectionTitle: (sectionId: string, title: string) => void;
  onUpdateSectionCosts: (
    sectionId: string,
    field: 'laborCost' | 'equipmentCost' | 'indirectCost',
    value: number,
  ) => void;
  onMoveSection: (direction: 'up' | 'down', sectionId: string) => void;
  onRemoveSection: (sectionId: string) => void;
  onUpdateSubject: (subject: string) => void;
}

export function SectionsManager({
  project,
  onAddSection,
  onEditItem,
  onRemoveItem,
  onAddItemToSection,
  onUpdateSectionTitle,
  onUpdateSectionCosts,
  onMoveSection,
  onRemoveSection,
  onUpdateSubject,
}: SectionsManagerProps) {
  const tableRef = useRef<HTMLTableElement>(null);

  const copyForWord = () => {
    if (!tableRef.current) return;
    const range = document.createRange();
    range.selectNode(tableRef.current);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(range);
    try {
      document.execCommand('copy');
    } catch {
      // silent fail
    }
    window.getSelection()?.removeAllRanges();
  };

  const hasSections = (project.sections?.length ?? 0) > 0;

  if (!hasSections) {
    return (
      <div className="py-32 flex flex-col items-center justify-center text-center bg-white border border-zinc-200 rounded-2xl">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
          <Layout className="w-8 h-8 text-emerald-600" />
        </div>
        <h3 className="text-xl font-bold text-zinc-900 mb-2">No Sections Yet</h3>
        <button
          onClick={onAddSection}
          className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all"
        >
          <Plus className="w-4 h-4" />
          Create a Section
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Actions bar — always visible when sections exist */}
      <div className="flex items-center justify-between">
        <input
          type="text"
          value={project.subject}
          onChange={(e) => onUpdateSubject(e.target.value)}
          className="bg-transparent border-none p-0 focus:ring-0 font-bold text-lg text-zinc-900 w-64"
          placeholder="Enter subject here"
        />
        <div className="flex items-center gap-2">
          <button
            onClick={onAddSection}
            className="flex items-center gap-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-3 py-1.5 rounded-lg transition-all shadow-sm font-bold text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Section
          </button>
          <button
            onClick={copyForWord}
            className="flex items-center gap-2 text-xs font-semibold text-zinc-600 hover:text-emerald-600 transition-colors bg-white border border-zinc-200 px-3 py-1.5 rounded-lg"
          >
            <Copy className="w-3.5 h-3.5" />
            Copy for Word
          </button>
          <button
            onClick={() => exportToCSV(project)}
            className="flex items-center gap-2 text-xs font-semibold text-zinc-600 hover:text-emerald-600 transition-colors bg-white border border-zinc-200 px-3 py-1.5 rounded-lg"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      <ItemTable
        project={project}
        tableRef={tableRef}
        onEditItem={onEditItem}
        onRemoveItem={onRemoveItem}
        onAddItemToSection={onAddItemToSection}
        onUpdateSectionTitle={onUpdateSectionTitle}
        onUpdateSectionCosts={onUpdateSectionCosts}
        onMoveSection={onMoveSection}
        onRemoveSection={onRemoveSection}
      />
    </div>
  );
}
