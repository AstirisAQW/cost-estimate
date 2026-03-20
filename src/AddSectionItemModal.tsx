import React, { useState, useCallback } from 'react';
import { X, Search, Book, Plus, Trash2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CostItem, CatalogItem } from './index';

// ── Numeric key guards ────────────────────────────────────
const integerOnly = (e: React.KeyboardEvent<HTMLInputElement>) => {
  const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
  if (!allowed.includes(e.key) && !/^\d$/.test(e.key)) e.preventDefault();
};

const decimalOnly = (e: React.KeyboardEvent<HTMLInputElement>) => {
  const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
  if (!allowed.includes(e.key) && !/^\d$/.test(e.key) && e.key !== '.') e.preventDefault();
};

// ── Row type (local to this modal) ───────────────────────
interface SectionItemRow {
  rowId: string;           // stable key — never based on content
  description: string;
  qty: number | '';
  unit: string;
  unitCost: number | '';
  qtyError: boolean;
}

const blankRow = (): SectionItemRow => ({
  rowId: Math.random().toString(36).slice(2),
  description: '',
  qty: '',
  unit: '',
  unitCost: '',
  qtyError: false,
});

const rowFromCatalog = (item: CatalogItem): SectionItemRow => ({
  rowId: Math.random().toString(36).slice(2),
  description: item.description,
  qty: '',
  unit: item.unit,
  unitCost: item.unitCost,
  qtyError: false,
});

// ── Props ────────────────────────────────────────────────
interface AddSectionItemModalProps {
  show: boolean;
  catalog: CatalogItem[];
  catalogSearch: string;
  onCatalogSearchChange: (val: string) => void;
  onAddItems: (items: Omit<CostItem, 'id'>[]) => void;
  onClose: () => void;
}

export function AddSectionItemModal({
  show,
  catalog,
  catalogSearch,
  onCatalogSearchChange,
  onAddItems,
  onClose,
}: AddSectionItemModalProps) {
  const [rows, setRows] = useState<SectionItemRow[]>([blankRow()]);

  const filteredCatalog = catalog.filter(
    (item) =>
      item.description.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      (item.section ?? '').toLowerCase().includes(catalogSearch.toLowerCase()),
  );

  // ── Row helpers ──────────────────────────────────────
  const updateRow = useCallback(
    (rowId: string, patch: Partial<SectionItemRow>) =>
      setRows((prev) =>
        prev.map((r) => (r.rowId === rowId ? { ...r, ...patch } : r)),
      ),
    [],
  );

  const deleteRow = useCallback(
    (rowId: string) => setRows((prev) => prev.filter((r) => r.rowId !== rowId)),
    [],
  );

  const appendBlankRow = () => setRows((prev) => [...prev, blankRow()]);

  const appendCatalogItem = (item: CatalogItem) =>
    setRows((prev) => [...prev, rowFromCatalog(item)]);

  // ── Submit ────────────────────────────────────────────
  const handleSubmit = () => {
    // Filter out completely empty rows silently
    const nonEmpty = rows.filter(
      (r) => r.description.trim() || Number(r.qty) > 0 || r.unit.trim() || Number(r.unitCost) > 0,
    );

    // Validate qty > 0 on non-empty rows
    let hasError = false;
    const validated = rows.map((r) => {
      const isEmpty =
        !r.description.trim() && !Number(r.qty) && !r.unit.trim() && !Number(r.unitCost);
      if (isEmpty) return r;
      if (!r.qty || Number(r.qty) <= 0) {
        hasError = true;
        return { ...r, qtyError: true };
      }
      return { ...r, qtyError: false };
    });

    if (hasError) {
      setRows(validated);
      return;
    }

    const items: Omit<CostItem, 'id'>[] = nonEmpty.map((r) => ({
      description: r.description.trim(),
      qty: Number(r.qty),
      unit: r.unit.trim(),
      unitCost: Number(r.unitCost),
    }));

    if (items.length === 0) return;
    onAddItems(items);
    handleClose();
  };

  const handleClose = () => {
    setRows([blankRow()]);
    onClose();
  };

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-zinc-50 rounded-3xl shadow-2xl border border-white/20 w-full max-w-4xl flex flex-col overflow-hidden"
          >
            {/* ── Header ── */}
            <div className="px-8 py-5 bg-white border-b border-zinc-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-100">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-zinc-900">Add Items to Section</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Click catalog items to append rows · fill in quantities · submit all at once
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-zinc-100 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ── Body ── */}
            <div className="flex overflow-hidden" style={{ maxHeight: '68vh' }}>

              {/* Left: catalog picker */}
              <div className="w-56 border-r border-zinc-200 bg-white flex flex-col overflow-hidden flex-shrink-0">
                <div className="p-3 border-b border-zinc-100 shrink-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Search catalog..."
                      value={catalogSearch}
                      onChange={(e) => onCatalogSearchChange(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-xs"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
                  <p className="px-1.5 mb-1.5 text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                    Click to Append Row
                  </p>
                  {catalog.length > 0 ? (
                    filteredCatalog.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => appendCatalogItem(item)}
                        className="w-full text-left p-2.5 rounded-xl border border-transparent hover:border-emerald-200 hover:bg-emerald-50/60 transition-all group"
                      >
                        <p className="text-xs font-bold text-zinc-900 group-hover:text-emerald-700 line-clamp-1">
                          {item.description}
                        </p>
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="text-[9px] font-mono text-zinc-400 uppercase">{item.unit}</span>
                          <span className="text-[10px] font-black text-emerald-600">
                            ₱{item.unitCost.toLocaleString()}
                          </span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="py-8 text-center">
                      <Book className="w-6 h-6 text-zinc-200 mx-auto mb-2" />
                      <p className="text-[10px] text-zinc-400">Catalog is empty</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: batch row table */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Table header */}
                <div className="shrink-0 grid grid-cols-[1fr_5rem_5rem_6rem_2rem] gap-2 px-4 py-2 bg-zinc-100 border-b border-zinc-200 text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                  <span>Item Name</span>
                  <span className="text-center">Qty</span>
                  <span className="text-center">Unit</span>
                  <span className="text-right">Unit Cost</span>
                  <span />
                </div>

                {/* Scrollable rows */}
                <div className="flex-1 overflow-y-auto p-3 space-y-1.5 bg-zinc-50/50">
                  {rows.map((row) => (
                    <div
                      key={row.rowId}
                      className="grid grid-cols-[1fr_5rem_5rem_6rem_2rem] gap-2 items-start"
                    >
                      {/* Item Name */}
                      <input
                        type="text"
                        value={row.description}
                        onChange={(e) => updateRow(row.rowId, { description: e.target.value })}
                        placeholder="Item name..."
                        className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                      />

                      {/* Qty */}
                      <input
                        type="number"
                        value={row.qty}
                        placeholder="0"
                        min={1}
                        onKeyDown={integerOnly}
                        onChange={(e) =>
                          updateRow(row.rowId, {
                            qty: e.target.value === '' ? '' : Number(e.target.value),
                            qtyError: false,
                          })
                        }
                        className={`w-full px-2 py-2 border rounded-lg text-sm font-bold text-center focus:ring-2 focus:ring-emerald-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                          row.qtyError
                            ? 'border-red-300 bg-red-50 text-red-600'
                            : 'bg-white border-zinc-200'
                        }`}
                      />

                      {/* Unit */}
                      <input
                        type="text"
                        value={row.unit}
                        onChange={(e) => updateRow(row.rowId, { unit: e.target.value })}
                        placeholder="unit"
                        className="w-full px-2 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-bold text-center focus:ring-2 focus:ring-emerald-500 outline-none"
                      />

                      {/* Unit Cost */}
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-400 text-xs font-bold">₱</span>
                        <input
                          type="number"
                          value={row.unitCost}
                          placeholder="0"
                          min={0}
                          onKeyDown={decimalOnly}
                          onChange={(e) =>
                            updateRow(row.rowId, {
                              unitCost: e.target.value === '' ? '' : Number(e.target.value),
                            })
                          }
                          className="w-full pl-5 pr-2 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-bold text-right focus:ring-2 focus:ring-emerald-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>

                      {/* Delete row */}
                      <button
                        onClick={() => deleteRow(row.rowId)}
                        disabled={rows.length === 1}
                        className="flex items-center justify-center h-9 text-zinc-300 hover:text-red-500 disabled:opacity-20 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {/* Add blank row button */}
                  <button
                    onClick={appendBlankRow}
                    className="w-full mt-1 py-2 border border-dashed border-zinc-300 rounded-lg text-xs font-bold text-zinc-400 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Row
                  </button>
                </div>
              </div>
            </div>

            {/* ── Footer ── */}
            <div className="px-8 py-4 bg-white border-t border-zinc-200 flex items-center justify-between shrink-0">
              <p className="text-xs text-zinc-400">
                {rows.length} row{rows.length !== 1 ? 's' : ''}
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleClose}
                  className="px-5 py-2.5 text-zinc-400 font-bold hover:text-zinc-600 transition-all text-sm"
                >
                  Discard
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex items-center gap-2 px-7 py-2.5 bg-emerald-600 text-white rounded-2xl font-black text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                >
                  Add All to Section
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
