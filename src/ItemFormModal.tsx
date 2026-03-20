import React, { useState, useCallback } from 'react';
import { X, Search, Book, Plus, Trash2, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CatalogItem } from './index';
import { decimalOnly } from './numericKeys';

interface CatalogItemRow {
  rowId: string;
  description: string;
  unit: string;
  unitCost: number | '';
}

const blankRow = (): CatalogItemRow => ({
  rowId: Math.random().toString(36).slice(2),
  description: '',
  unit: '',
  unitCost: '',
});

interface ItemFormModalProps {
  initialEditItem?: CatalogItem | null;
  show: boolean;
  catalog: CatalogItem[];
  catalogSearch: string;
  onCatalogSearchChange: (val: string) => void;
  onSaveItems: (items: (Pick<CatalogItem, 'description' | 'unit' | 'unitCost'> & { id?: string })[]) => void;
  onDeleteCatalogItem: (id: string) => void;
  onClose: () => void;
}

export function ItemFormModal({
  show,
  catalog,
  catalogSearch,
  onCatalogSearchChange,
  onSaveItems,
  onDeleteCatalogItem,
  onClose,
  initialEditItem,
}: ItemFormModalProps) {
  const [rows, setRows] = useState<CatalogItemRow[]>([blankRow()]);
  const [editingCatalogId, setEditingCatalogId] = useState<string | null>(null);

  // Pre-load when opened from CatalogView edit button
  React.useEffect(() => {
    if (show && initialEditItem) {
      setEditingCatalogId(initialEditItem.id);
      setRows([{
        rowId: Math.random().toString(36).slice(2),
        description: initialEditItem.description,
        unit: initialEditItem.unit,
        unitCost: initialEditItem.unitCost,
      }]);
    } else if (show && !initialEditItem) {
      setEditingCatalogId(null);
      setRows([blankRow()]);
    }
  }, [show, initialEditItem]);

  const filteredCatalog = catalog.filter(
    (item) =>
      item.description.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      (item.section ?? '').toLowerCase().includes(catalogSearch.toLowerCase()),
  );

  const updateRow = useCallback(
    (rowId: string, patch: Partial<CatalogItemRow>) =>
      setRows((prev) => prev.map((r) => (r.rowId === rowId ? { ...r, ...patch } : r))),
    [],
  );

  const deleteRow = useCallback(
    (rowId: string) => setRows((prev) => prev.filter((r) => r.rowId !== rowId)),
    [],
  );

  const appendBlankRow = () => {
    setEditingCatalogId(null);
    setRows((prev) => [...prev, blankRow()]);
  };

  const handleEditCatalogItem = (item: CatalogItem) => {
    setEditingCatalogId(item.id);
    setRows([{
      rowId: Math.random().toString(36).slice(2),
      description: item.description,
      unit: item.unit,
      unitCost: item.unitCost,
    }]);
  };

  // If edit was triggered from CatalogView (initialEditItem), close entirely.
  // If edit was triggered from within the modal's left panel, go back to add mode.
  const handleDiscardEdit = () => {
    if (initialEditItem) {
      handleClose();
    } else {
      setEditingCatalogId(null);
      setRows([blankRow()]);
    }
  };

  const handleSubmit = () => {
    const nonEmpty = rows.filter(
      (r) => r.description.trim() || r.unit.trim() || Number(r.unitCost) > 0,
    );
    if (nonEmpty.length === 0) return;
    onSaveItems(nonEmpty.map((r) => ({
      ...(editingCatalogId ? { id: editingCatalogId } : {}),
      description: r.description.trim(),
      unit: r.unit.trim(),
      unitCost: Number(r.unitCost),
    })));
    if (initialEditItem) {
      // Opened from CatalogView — close entirely after saving
      handleClose();
    } else {
      // Opened from within the modal — reset to add mode so user can keep adding
      setRows([blankRow()]);
      setEditingCatalogId(null);
    }
  };

  const handleClose = () => {
    setRows([blankRow()]);
    setEditingCatalogId(null);
    onClose();
  };

  const isEditing = editingCatalogId !== null;

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-zinc-50 rounded-3xl shadow-2xl border border-white/20 w-full max-w-4xl flex flex-col"
            style={{ height: '680px' }}
          >
            {/* ── Header ── */}
            <div className="px-8 py-5 bg-white border-b border-zinc-200 flex items-center justify-between shrink-0 rounded-t-3xl">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-100">
                  <Book className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-zinc-900">
                    {isEditing ? 'Edit Catalog Item' : 'Add Items to Catalog'}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {isEditing
                      ? 'Update the item then save, or discard to go back'
                      : 'Add multiple items at once · click an existing item to edit it'}
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
            <div className="flex flex-1 min-h-0">

              {/* Left: existing catalog list */}
              <div className="w-56 border-r border-zinc-200 bg-white flex flex-col shrink-0 min-h-0">
                <div className="p-3 border-b border-zinc-100 shrink-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={catalogSearch}
                      onChange={(e) => onCatalogSearchChange(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-xs"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
                  <p className="px-1.5 mb-1.5 text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                    Existing Items
                  </p>
                  {catalog.length > 0 ? (
                    filteredCatalog.map((item) => (
                      <div key={item.id} className="group relative">
                        <button
                          onClick={() => handleEditCatalogItem(item)}
                          className={`w-full text-left p-2.5 rounded-xl border transition-all ${
                            editingCatalogId === item.id
                              ? 'border-emerald-300 bg-emerald-50'
                              : 'border-transparent hover:border-zinc-200 hover:bg-zinc-50'
                          }`}
                        >
                          <p className="text-xs font-bold text-zinc-900 line-clamp-1 pr-6">
                            {item.description}
                          </p>
                          <div className="flex items-center justify-between mt-0.5">
                            <span className="text-[9px] font-mono text-zinc-400 uppercase">{item.unit}</span>
                            <span className="text-[10px] font-black text-emerald-600">
                              ₱{item.unitCost.toLocaleString()}
                            </span>
                          </div>
                        </button>
                        <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            onClick={(e) => { e.stopPropagation(); onDeleteCatalogItem(item.id); }}
                            className="p-1 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center">
                      <Book className="w-6 h-6 text-zinc-200 mx-auto mb-2" />
                      <p className="text-[10px] text-zinc-400">No items yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: batch rows */}
              <div className="flex-1 flex flex-col min-h-0 bg-zinc-50/50">
                <div className="shrink-0 grid grid-cols-[1fr_5rem_7rem_2rem] gap-2 px-4 py-2 bg-zinc-100 border-b border-zinc-200 text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                  <span>Item Name</span>
                  <span className="text-center">Unit</span>
                  <span className="text-right">Unit Cost</span>
                  <span />
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
                  {rows.map((row) => (
                    <div key={row.rowId} className="grid grid-cols-[1fr_5rem_7rem_2rem] gap-2 items-center">
                      <input
                        type="text"
                        value={row.description}
                        onChange={(e) => updateRow(row.rowId, { description: e.target.value })}
                        placeholder="Item name..."
                        className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                      <input
                        type="text"
                        value={row.unit}
                        onChange={(e) => updateRow(row.rowId, { unit: e.target.value })}
                        placeholder="unit"
                        className="w-full px-2 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-bold text-center focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-400 text-xs font-bold">₱</span>
                        <input
                          type="number"
                          value={row.unitCost}
                          placeholder="0"
                          min={0}
                          onKeyDown={decimalOnly}
                          onChange={(e) => updateRow(row.rowId, {
                            unitCost: e.target.value === '' ? '' : Number(e.target.value),
                          })}
                          className="w-full pl-5 pr-2 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-bold text-right focus:ring-2 focus:ring-emerald-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                      <button
                        onClick={() => deleteRow(row.rowId)}
                        disabled={rows.length === 1}
                        className="flex items-center justify-center h-9 text-zinc-300 hover:text-red-500 disabled:opacity-20 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {!isEditing && (
                    <button
                      onClick={appendBlankRow}
                      className="w-full mt-1 py-2 border border-dashed border-zinc-300 rounded-lg text-xs font-bold text-zinc-400 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Row
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ── Footer ── */}
            <div className="px-8 py-4 bg-white border-t border-zinc-200 flex items-center justify-between shrink-0 rounded-b-3xl">
              <p className="text-xs text-zinc-400">
                {isEditing ? 'Editing 1 item' : `${rows.length} row${rows.length !== 1 ? 's' : ''}`}
              </p>
              <div className="flex items-center gap-3">
                {/* Discard in edit mode → back to add mode; otherwise close modal */}
                <button
                  onClick={isEditing ? handleDiscardEdit : handleClose}
                  className="px-5 py-2.5 text-zinc-400 font-bold hover:text-zinc-600 transition-all text-sm"
                >
                  {isEditing ? 'Cancel Edit' : 'Discard'}
                </button>
                <button
                  onClick={handleSubmit}
                  className={`flex items-center gap-2 px-7 py-2.5 rounded-2xl font-black text-sm transition-all shadow-lg ${
                    isEditing
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100'
                  }`}
                >
                  {isEditing ? <Save className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {isEditing ? 'Update Item' : 'Add All to Catalog'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
