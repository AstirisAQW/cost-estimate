import React from 'react';
import { Pencil, Trash2, Plus, ChevronRight } from 'lucide-react';
import { Project, CostItem } from './index';
import { toRoman } from './helpers';

const fmt = (n: number) =>
  `₱${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Only allow digits and decimal point — blocks all letters including 'e', '+', '-'
const numericOnly = (e: React.KeyboardEvent<HTMLInputElement>) => {
  const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
  if (!allowed.includes(e.key) && !/^\d$/.test(e.key) && e.key !== '.') {
    e.preventDefault();
  }
};

// Integer-only (no decimal) — for future use if needed
const integerOnly = (e: React.KeyboardEvent<HTMLInputElement>) => {
  const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
  if (!allowed.includes(e.key) && !/^\d$/.test(e.key)) {
    e.preventDefault();
  }
};

interface ItemTableProps {
  project: Project;
  tableRef: React.RefObject<HTMLTableElement>;
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
}

function CostInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <input
      type="number"
      value={value || ''}
      placeholder="0"
      min={0}
      onKeyDown={numericOnly}
      onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
      className="w-full text-right bg-white border border-zinc-200 rounded-lg px-2 py-1 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all hover:border-zinc-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
    />
  );
}

export function ItemTable({
  project,
  tableRef,
  onEditItem,
  onRemoveItem,
  onAddItemToSection,
  onUpdateSectionTitle,
  onUpdateSectionCosts,
  onMoveSection,
  onRemoveSection,
}: ItemTableProps) {
  const totalSections = project.sections?.length ?? 0;

  // Project-level totals — named to match column headers exactly
  const totalEstimatedMaterialCost  = project.sections?.reduce(
    (sum, sec) => sum + (sec.items ?? []).reduce((a, i) => a + i.qty * i.unitCost, 0), 0,
  ) ?? 0;
  const totalEstimatedLaborCost     = project.sections?.reduce((sum, sec) => sum + (sec.laborCost ?? 0), 0) ?? 0;
  const totalEstimatedEquipmentCost = project.sections?.reduce((sum, sec) => sum + (sec.equipmentCost ?? 0), 0) ?? 0;
  const totalEstimatedDirectCost    = totalEstimatedMaterialCost + totalEstimatedLaborCost + totalEstimatedEquipmentCost;
  const totalEstimatedIndirectCost  = project.sections?.reduce((sum, sec) => sum + (sec.indirectCost ?? 0), 0) ?? 0;
  const totalEstimatedProjectCost   = totalEstimatedDirectCost + totalEstimatedIndirectCost;

  const columns = [
    { label: 'No',                       align: 'text-left'   },
    { label: 'Description',              align: 'text-left'   },
    { label: 'Qty',                      align: 'text-center' },
    { label: 'Unit',                     align: 'text-center' },
    { label: 'Unit Cost',                align: 'text-right'  },
    { label: 'Total Unit Cost',          align: 'text-right'  },
    { label: 'Total Material Cost',      align: 'text-right border-r border-zinc-100' },
    { label: 'Labor Cost',               align: 'text-right'  },
    { label: 'Equipment Cost',           align: 'text-right'  },
    { label: 'Total Direct Cost',        align: 'text-right'  },
    { label: 'Indirect Cost',            align: 'text-right'  },
    { label: 'Total Cost',               align: 'text-right'  },
    { label: '',                         align: 'text-center' },
  ];

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
      <table ref={tableRef} className="w-full text-left border-collapse table-fixed">

        {/* ── Column widths ── */}
        <colgroup>
          <col style={{ width: '2rem' }} />      {/* No */}
          <col />                                  {/* Description — fills remaining space */}
          <col style={{ width: '2.5rem' }} />    {/* Qty */}
          <col style={{ width: '3rem' }} />       {/* Unit */}
          <col style={{ width: '5.5rem' }} />     {/* Unit Cost */}
          <col style={{ width: '6rem' }} />       {/* Total Unit Cost */}
          <col style={{ width: '6.5rem' }} />     {/* Total Material Cost */}
          <col style={{ width: '6rem' }} />       {/* Labor Cost */}
          <col style={{ width: '6rem' }} />       {/* Equipment Cost */}
          <col style={{ width: '6.5rem' }} />     {/* Total Direct Cost */}
          <col style={{ width: '6rem' }} />       {/* Indirect Cost */}
          <col style={{ width: '6.5rem' }} />     {/* Total Cost */}
          <col style={{ width: '3rem' }} />       {/* Actions */}
        </colgroup>

        {/* ── Headers ── */}
        <thead>
          <tr className="bg-white border-b border-zinc-100">
            {columns.map(({ label, align }, i) => (
              <th
                key={i}
                className={`px-1.5 py-2.5 text-[9px] font-bold text-zinc-400 uppercase tracking-wide leading-tight ${align}`}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>

        {/* ── Sections ── */}
        {project.sections.map((section, sIdx) => {
          const items = section.items ?? [];

          // Per-section calculated values — named to match column headers
          const sectionTotalUnitCost     = items.reduce((sum, i) => sum + i.qty * i.unitCost, 0);
          const sectionTotalMaterialCost = sectionTotalUnitCost; // same value, separate column
          const sectionLaborCost         = section.laborCost ?? 0;
          const sectionEquipmentCost     = section.equipmentCost ?? 0;
          const sectionTotalDirectCost   = sectionTotalMaterialCost + sectionLaborCost + sectionEquipmentCost;
          const sectionIndirectCost      = section.indirectCost ?? 0;
          const sectionTotalCost         = sectionTotalDirectCost + sectionIndirectCost;

          return (
            <React.Fragment key={section.id}>
              {/* Section header row */}
              <tbody className="border-t-2 border-zinc-100">
                <tr className="bg-zinc-50/80">
                  <td colSpan={13} className="px-2 py-1.5 border-b border-zinc-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0">
                          {toRoman(sIdx + 1)}
                        </span>
                        <input
                          type="text"
                          value={section.title}
                          onChange={(e) => onUpdateSectionTitle(section.id, e.target.value)}
                          placeholder="Section title..."
                          className="font-bold text-zinc-900 text-sm bg-transparent border-none p-0 focus:ring-0 min-w-0 flex-1 placeholder:text-zinc-300"
                        />
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          onClick={() => onAddItemToSection(section.id)}
                          className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 hover:bg-emerald-100 px-2 py-1 rounded transition-colors mr-1"
                        >
                          <Plus className="w-3 h-3" />
                          Add Item
                        </button>
                        <button
                          onClick={() => onMoveSection('up', section.id)}
                          disabled={sIdx === 0}
                          className="p-1 text-zinc-400 hover:text-emerald-600 disabled:opacity-30 transition-colors"
                        >
                          <ChevronRight className="w-3 h-3 -rotate-90" />
                        </button>
                        <button
                          onClick={() => onMoveSection('down', section.id)}
                          disabled={sIdx === totalSections - 1}
                          className="p-1 text-zinc-400 hover:text-emerald-600 disabled:opacity-30 transition-colors"
                        >
                          <ChevronRight className="w-3 h-3 rotate-90" />
                        </button>
                        <button
                          onClick={() => onRemoveSection(section.id)}
                          className="p-1 text-zinc-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>

                {/* Item rows */}
                {items.map((item, iIdx) => {
                  const itemTotalUnitCost    = item.qty * item.unitCost;
                  const itemTotalMaterialCost = itemTotalUnitCost;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-zinc-50/50 transition-colors group border-b border-zinc-50"
                    >
                      <td className="px-1.5 py-2 text-xs text-zinc-400 font-mono">{iIdx + 1}</td>
                      <td className="px-1.5 py-2">
                        <p className="text-xs font-medium text-zinc-900 truncate">{item.description}</p>
                      </td>
                      <td className="px-1.5 py-2 text-center text-xs text-zinc-600">{item.qty}</td>
                      <td className="px-1.5 py-2 text-center text-xs text-zinc-600 truncate">{item.unit}</td>
                      <td className="px-1.5 py-2 text-right font-mono text-xs text-zinc-600">
                        {fmt(item.unitCost)}
                      </td>
                      <td className="px-1.5 py-2 text-right font-mono text-xs text-zinc-600">
                        {fmt(itemTotalUnitCost)}
                      </td>
                      <td className="px-1.5 py-2 text-right font-mono text-xs text-zinc-600 border-r border-zinc-100">
                        {fmt(itemTotalMaterialCost)}
                      </td>
                      {/* Labor, Equipment, Total Direct, Indirect — blank on item rows */}
                      <td /><td /><td /><td />
                      {/* Total Cost — blank on item rows */}
                      <td />
                      {/* Actions */}
                      <td className="px-1.5 py-2 text-center">
                        <div className="flex items-center justify-center gap-0.5">
                          <button
                            onClick={() => onEditItem(item, section.id)}
                            className="p-1 text-zinc-300 hover:text-emerald-600 transition-colors"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="p-1 text-zinc-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {items.length === 0 && (
                  <tr><td colSpan={13} className="py-3" /></tr>
                )}
              </tbody>

              {/* ── Section subtotal row ── */}
              <tbody className="bg-emerald-50/30 border-t border-zinc-100">
                <tr>
                  <td
                    colSpan={5}
                    className="px-1.5 py-2 text-right text-[9px] font-black text-zinc-400 uppercase tracking-wide"
                  >
                    Section {toRoman(sIdx + 1)} Subtotal
                  </td>

                  {/* Total Unit Cost — calculated */}
                  <td className="px-1.5 py-2 text-right font-mono text-xs font-bold text-zinc-700">
                    {fmt(sectionTotalUnitCost)}
                  </td>

                  {/* Total Material Cost — calculated */}
                  <td className="px-1.5 py-2 text-right font-mono text-xs font-bold text-zinc-700 border-r border-zinc-100">
                    {fmt(sectionTotalMaterialCost)}
                  </td>

                  {/* Labor Cost — editable */}
                  <td className="px-1.5 py-2">
                    <CostInput
                      value={sectionLaborCost}
                      onChange={(v) => onUpdateSectionCosts(section.id, 'laborCost', v)}
                    />
                  </td>

                  {/* Equipment Cost — editable */}
                  <td className="px-1.5 py-2">
                    <CostInput
                      value={sectionEquipmentCost}
                      onChange={(v) => onUpdateSectionCosts(section.id, 'equipmentCost', v)}
                    />
                  </td>

                  {/* Total Direct Cost — calculated, bold */}
                  <td className="px-1.5 py-2 text-right font-mono text-xs font-black text-zinc-800">
                    {fmt(sectionTotalDirectCost)}
                  </td>

                  {/* Indirect Cost — editable */}
                  <td className="px-1.5 py-2">
                    <CostInput
                      value={sectionIndirectCost}
                      onChange={(v) => onUpdateSectionCosts(section.id, 'indirectCost', v)}
                    />
                  </td>

                  {/* Total Cost — calculated, bold */}
                  <td className="px-1.5 py-2 text-right font-mono text-xs font-black text-emerald-700">
                    {fmt(sectionTotalCost)}
                  </td>

                  <td />
                </tr>
              </tbody>
            </React.Fragment>
          );
        })}

        {/* ── Total Estimated Project Cost row ── */}
        <tbody className="bg-white border-t-2 border-zinc-200">
          <tr>
            <td
              colSpan={5}
              className="px-1.5 py-3 text-right text-[9px] font-black text-zinc-500 uppercase tracking-wide"
            >
              Total Estimated Project Cost
            </td>
            <td className="px-1.5 py-3 text-right font-mono text-xs font-bold text-zinc-600">
              {fmt(totalEstimatedMaterialCost)}
            </td>
            <td className="px-1.5 py-3 text-right font-mono text-xs font-bold text-zinc-600 border-r border-zinc-100">
              {fmt(totalEstimatedMaterialCost)}
            </td>
            <td className="px-1.5 py-3 text-right font-mono text-xs font-bold text-zinc-500">
              {fmt(totalEstimatedLaborCost)}
            </td>
            <td className="px-1.5 py-3 text-right font-mono text-xs font-bold text-zinc-500">
              {fmt(totalEstimatedEquipmentCost)}
            </td>
            <td className="px-1.5 py-3 text-right font-mono text-xs font-black text-zinc-800">
              {fmt(totalEstimatedDirectCost)}
            </td>
            <td className="px-1.5 py-3 text-right font-mono text-xs font-bold text-zinc-500">
              {fmt(totalEstimatedIndirectCost)}
            </td>
            <td className="px-1.5 py-3 text-right font-mono text-sm font-black text-emerald-600">
              {fmt(totalEstimatedProjectCost)}
            </td>
            <td />
          </tr>
        </tbody>
      </table>
    </div>
  );
}
