import React from 'react';
import {
  X,
  Book,
  Pencil,
  Trash2,
  Search,
  Star,
  Save,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CostItem, CatalogItem } from './index';

interface ItemFormModalProps {
  show: boolean;
  newItem: Omit<CostItem, 'id'>;
  catalog: CatalogItem[];
  catalogSearch: string;
  editingItemId: string | null;
  editingCatalogId: string | null;
  showCatalog: boolean;
  onItemChange: (item: Omit<CostItem, 'id'>) => void;
  onCatalogSearchChange: (val: string) => void;
  onLoadFromCatalog: (item: CatalogItem) => void;
  onEditCatalogItem: (item: CatalogItem) => void;
  onDeleteCatalogItem: (id: string) => void;
  onSaveToCatalog: () => void;
  onAddItem: () => void;
  onClose: () => void;
}

export function ItemFormModal({
  show,
  newItem,
  catalog,
  catalogSearch,
  editingItemId,
  editingCatalogId,
  showCatalog,
  onItemChange,
  onCatalogSearchChange,
  onLoadFromCatalog,
  onEditCatalogItem,
  onDeleteCatalogItem,
  onSaveToCatalog,
  onAddItem,
  onClose,
}: ItemFormModalProps) {
  const filteredCatalog = catalog.filter(
    (item) =>
      item.description.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      (item.section ?? '').toLowerCase().includes(catalogSearch.toLowerCase()),
  );

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-zinc-50 rounded-3xl shadow-2xl border border-white/20 w-full max-w-2xl flex flex-col overflow-hidden"
          >
            {/* ── Header ── */}
            <div className="px-8 py-6 bg-white border-b border-zinc-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-100">
                  <Book className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-black text-zinc-900">
                  {editingCatalogId ? 'Edit Catalog Item' : 'Add Item to Catalog'}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-100 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ── Body ── */}
            <div className="flex overflow-hidden" style={{ maxHeight: '60vh' }}>
              {/* Left: existing catalog list */}
              {!showCatalog && (
                <div className="w-64 border-r border-zinc-200 bg-white flex flex-col overflow-hidden flex-shrink-0">
                  <div className="p-4 border-b border-zinc-100 shrink-0">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="Search catalog..."
                        value={catalogSearch}
                        onChange={(e) => onCatalogSearchChange(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
                    <p className="px-2 mb-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                      Existing Items
                    </p>
                    {catalog.length > 0 ? (
                      filteredCatalog.map((item) => (
                        <div key={item.id} className="group relative">
                          <button
                            onClick={() => onLoadFromCatalog(item)}
                            className={`w-full text-left p-3 rounded-xl border transition-all ${
                              editingCatalogId === item.id
                                ? 'border-emerald-300 bg-emerald-50'
                                : 'border-transparent hover:border-emerald-200 hover:bg-emerald-50/50'
                            }`}
                          >
                            <p className="text-sm font-bold text-zinc-900 group-hover:text-emerald-700 line-clamp-1 pr-10">
                              {item.description}
                            </p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-[10px] font-mono text-zinc-400 uppercase">{item.unit}</span>
                              <span className="text-xs font-black text-emerald-600">
                                ₱{item.unitCost.toLocaleString()}
                              </span>
                            </div>
                          </button>

                          <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all">
                            <button
                              onClick={(e) => { e.stopPropagation(); onEditCatalogItem(item); }}
                              className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              title="Edit"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); onDeleteCatalogItem(item.id); }}
                              className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-10 text-center">
                        <Book className="w-7 h-7 text-zinc-200 mx-auto mb-2" />
                        <p className="text-xs text-zinc-400">No items yet</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Right: entry form */}
              <div className="flex-1 overflow-y-auto p-8 bg-zinc-50/50">
                <div className="space-y-5">
                  {/* Item name */}
                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">
                      Item Name
                    </label>
                    <textarea
                      value={newItem.description}
                      onChange={(e) => onItemChange({ ...newItem, description: e.target.value })}
                      placeholder="e.g. Portland Cement, Type I"
                      rows={3}
                      className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-base font-medium resize-none shadow-sm"
                    />
                  </div>

                  {/* Unit / Unit Cost */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">
                        Unit
                      </label>
                      <input
                        type="text"
                        value={newItem.unit}
                        onChange={(e) => onItemChange({ ...newItem, unit: e.target.value })}
                        placeholder="e.g., bag, cu.m, kg"
                        className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-lg font-bold shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">
                        Unit Cost
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">₱</span>
                        <input
                          type="number"
                          value={newItem.unitCost}
                          onChange={(e) => onItemChange({ ...newItem, unitCost: Number(e.target.value) })}
                          className="w-full pl-9 pr-4 py-3 bg-white border border-zinc-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-lg font-bold shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Footer ── */}
            <div className="px-8 py-5 bg-white border-t border-zinc-200 flex items-center justify-between shrink-0">
              <button
                onClick={onClose}
                className="px-6 py-2.5 text-zinc-400 font-bold hover:text-zinc-600 transition-all text-sm"
              >
                Discard
              </button>

              <button
                onClick={onSaveToCatalog}
                className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-black text-base transition-all shadow-xl ${
                  editingCatalogId
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100'
                }`}
              >
                {editingCatalogId ? <Save className="w-5 h-5" /> : <Star className="w-5 h-5" />}
                {editingCatalogId ? 'Update Catalog Item' : 'Add Item to Catalog'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
