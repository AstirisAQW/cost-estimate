import React from 'react';
import { Search, Plus, Book, Trash2 } from 'lucide-react';
import { CatalogItem } from './index';

interface CatalogViewProps {
  catalog: CatalogItem[];
  catalogSearch: string;
  onSearchChange: (val: string) => void;
  onAddToCatalog: () => void;
  onRemoveFromCatalog: (id: string) => void;
}

export function CatalogView({
  catalog,
  catalogSearch,
  onSearchChange,
  onAddToCatalog,
  onRemoveFromCatalog,
}: CatalogViewProps) {
  const filtered = catalog.filter(
    (item) =>
      item.description.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      (item.section ?? '').toLowerCase().includes(catalogSearch.toLowerCase()),
  );

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header row */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Master Catalog</h2>
          <p className="text-zinc-500 text-sm">Save common items here to reuse them across all projects.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search catalog..."
              value={catalogSearch}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none w-64"
            />
          </div>
          <button
            onClick={onAddToCatalog}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-all shadow-sm font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            Add to Catalog
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1 pr-2">
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">
                  {item.section || 'General'}
                </p>
                <h4 className="font-bold text-zinc-900 text-sm leading-snug">{item.description}</h4>
              </div>
              <button
                onClick={() => onRemoveFromCatalog(item.id)}
                className="text-zinc-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-100">
              <span className="text-xs text-zinc-400 font-mono uppercase">{item.unit}</span>
              <div className="text-right">
                <p className="text-[10px] text-zinc-400">Unit Cost</p>
                <p className="font-mono font-black text-zinc-900">₱{item.unitCost.toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}

        {catalog.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white border border-dashed border-zinc-200 rounded-2xl">
            <Book className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
            <p className="text-zinc-400 text-sm font-medium">Your catalog is empty.</p>
            <p className="text-zinc-300 text-xs mt-1">Save items from your projects to see them here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
