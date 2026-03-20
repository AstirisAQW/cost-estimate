import React, { useState } from 'react';
import { X, Search, Book, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CostItem, CatalogItem } from './index';

// Blocks all non-numeric keys (letters, symbols) — allows digits only, no decimals for integer fields
const integerOnly = (e: React.KeyboardEvent<HTMLInputElement>) => {
  const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
  if (!allowed.includes(e.key) && !/^\d$/.test(e.key)) {
    e.preventDefault();
  }
};

// Allows digits and one decimal point
const decimalOnly = (e: React.KeyboardEvent<HTMLInputElement>) => {
  const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
  if (!allowed.includes(e.key) && !/^\d$/.test(e.key) && e.key !== '.') {
    e.preventDefault();
  }
};

interface AddSectionItemModalProps {
  show: boolean;
  newItem: Omit<CostItem, 'id'>;
  catalog: CatalogItem[];
  catalogSearch: string;
  editingItemId: string | null;
  onItemChange: (item: Omit<CostItem, 'id'>) => void;
  onCatalogSearchChange: (val: string) => void;
  onLoadFromCatalog: (item: CatalogItem) => void;
  onAddItem: () => void;
  onClose: () => void;
}

export function AddSectionItemModal({
  show,
  newItem,
  catalog,
  catalogSearch,
  editingItemId,
  onItemChange,
  onCatalogSearchChange,
  onLoadFromCatalog,
  onAddItem,
  onClose,
}: AddSectionItemModalProps) {
  const [selectedCatalogId, setSelectedCatalogId] = useState<string | null>(null);
  const [qtyError, setQtyError] = useState(false);

  const filteredCatalog = catalog.filter(
    (item) =>
      item.description.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      (item.section ?? '').toLowerCase().includes(catalogSearch.toLowerCase()),
  );

  const handleLoadFromCatalog = (item: CatalogItem) => {
    setSelectedCatalogId(item.id);
    onLoadFromCatalog(item);
  };

  const handleClose = () => {
    setSelectedCatalogId(null);
    setQtyError(false);
    onClose();
  };

  const handleSubmit = () => {
    if (!newItem.qty || newItem.qty <= 0) {
      setQtyError(true);
      return;
    }
    setSelectedCatalogId(null);
    setQtyError(false);
    onAddItem();
  };

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
                  <ChevronRight className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-black text-zinc-900">
                  {editingItemId ? 'Update Item' : 'Add Item to Section'}
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-100 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ── Body ── */}
            <div className="flex overflow-hidden" style={{ maxHeight: '60vh' }}>
              {/* Left: catalog picker */}
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
                    Pick from Catalog
                  </p>
                  {catalog.length > 0 ? (
                    filteredCatalog.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleLoadFromCatalog(item)}
                        className={`w-full text-left p-3 rounded-xl border transition-all ${
                          selectedCatalogId === item.id
                            ? 'border-emerald-300 bg-emerald-50'
                            : 'border-transparent hover:border-emerald-200 hover:bg-emerald-50/50'
                        }`}
                      >
                        <p className="text-sm font-bold text-zinc-900 line-clamp-1">
                          {item.description}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[10px] font-mono text-zinc-400 uppercase">{item.unit}</span>
                          <span className="text-xs font-black text-emerald-600">
                            ₱{item.unitCost.toLocaleString()}
                          </span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="py-10 text-center">
                      <Book className="w-7 h-7 text-zinc-200 mx-auto mb-2" />
                      <p className="text-xs text-zinc-400">Catalog is empty</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: item fields */}
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
                      rows={2}
                      className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-base font-medium resize-none shadow-sm"
                    />
                  </div>

                  {/* Qty / Unit / Unit Cost */}
                  <div className="grid grid-cols-3 gap-4">
                    {/* Quantity */}
                    <div>
                      <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 ${qtyError ? 'text-red-500' : 'text-zinc-400'}`}>
                        Quantity{qtyError && <span className="normal-case font-normal ml-1">— must be &gt; 0</span>}
                      </label>
                      <input
                        type="number"
                        value={newItem.qty || ''}
                        placeholder="0"
                        min={1}
                        onKeyDown={integerOnly}
                        onChange={(e) => {
                          setQtyError(false);
                          onItemChange({ ...newItem, qty: Number(e.target.value) });
                        }}
                        className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-lg font-bold shadow-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                          qtyError ? 'border-red-300 bg-red-50' : 'border-zinc-200'
                        }`}
                      />
                    </div>

                    {/* Unit */}
                    <div>
                      <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">
                        Unit
                      </label>
                      <input
                        type="text"
                        value={newItem.unit}
                        onChange={(e) => onItemChange({ ...newItem, unit: e.target.value })}
                        placeholder="bag, cu.m…"
                        className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-lg font-bold shadow-sm"
                      />
                    </div>

                    {/* Unit Cost */}
                    <div>
                      <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">
                        Unit Cost
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">₱</span>
                        <input
                          type="number"
                          value={newItem.unitCost || ''}
                          placeholder="0"
                          min={0}
                          onKeyDown={decimalOnly}
                          onChange={(e) => onItemChange({ ...newItem, unitCost: Number(e.target.value) })}
                          className="w-full pl-9 pr-4 py-3 bg-white border border-zinc-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-lg font-bold shadow-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                onClick={handleClose}
                className="px-6 py-2.5 text-zinc-400 font-bold hover:text-zinc-600 transition-all text-sm"
              >
                Discard
              </button>
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-2xl font-black text-base hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100"
              >
                {editingItemId ? 'Update Item' : 'Add to Section'}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
