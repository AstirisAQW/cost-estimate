import React from 'react';
import { Pencil, Trash2, Plus, ChevronRight } from 'lucide-react';
import { Project, CostItem } from './index';
import { toRoman } from './helpers';

const fmt = (n: number) =>
  `₱${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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

function CostInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      <span className="text-zinc-400 text-xs">₱</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-28 text-right bg-white border border-zinc-200 rounded-lg px-2 py-1 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all hover:border-zinc-300"
        min={0}
      />
    </div>
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

  // Grand totals across all sections
  const grandMaterial    = project.sections?.reduce((s, sec) => s + (sec.items ?? []).reduce((a, i) => a + i.qty * i.unitCost, 0), 0) ?? 0;
  const grandLabor       = project.sections?.reduce((s, sec) => s + (sec.laborCost ?? 0), 0) ?? 0;
  const grandEquipment   = project.sections?.reduce((s, sec) => s + (sec.equipmentCost ?? 0), 0) ?? 0;
  const grandDirect      = grandMaterial + grandLabor + grandEquipment;
  const grandIndirect    = project.sections?.reduce((s, sec) => s + (sec.indirectCost ?? 0), 0) ?? 0;
  const grandTotal       = grandDirect + grandIndirect;

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table ref={tableRef} className="w-full text-left border-collapse">

          {/* ── Column headers ── */}
          <thead>
            <tr className="bg-white border-b border-zinc-100">
              {[
                { label: 'No',                   cls: 'w-10' },
                { label: 'Description/Materials', cls: 'min-w-[180px]' },
                { label: 'Qty',                  cls: 'text-center w-16' },
                { label: 'Unit',                 cls: 'text-center w-16' },
                { label: 'Unit Cost',            cls: 'text-right w-28' },
                { label: 'Material Total',       cls: 'text-right w-32 border-r border-zinc-100' },
                { label: 'Labor Cost',           cls: 'text-right w-36' },
                { label: 'Equipment Cost',       cls: 'text-right w-36' },
                { label: 'Total Direct',         cls: 'text-right w-32' },
                { label: 'Indirect Cost',        cls: 'text-right w-36' },
                { label: 'Section Total',        cls: 'text-right w-32' },
                { label: 'Actions',              cls: 'text-center w-20' },
              ].map(({ label, cls }) => (
                <th
                  key={label}
                  className={`px-3 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider ${cls}`}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>

          {/* ── Sections ── */}
          {project.sections.map((section, sIdx) => {
            const items         = section.items ?? [];
            const materialSum   = items.reduce((s, i) => s + i.qty * i.unitCost, 0);
            const laborCost     = section.laborCost ?? 0;
            const equipmentCost = section.equipmentCost ?? 0;
            const totalDirect   = materialSum + laborCost + equipmentCost;
            const indirectCost  = section.indirectCost ?? 0;
            const sectionTotal  = totalDirect + indirectCost;

            return (
              <React.Fragment key={section.id}>
                {/* Section header row */}
                <tbody className="border-t-2 border-zinc-100">
                  <tr className="bg-zinc-50/80">
                    <td colSpan={12} className="px-3 py-2 border-b border-zinc-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shrink-0">
                            {toRoman(sIdx + 1)}
                          </span>
                          <input
                            type="text"
                            value={section.title}
                            onChange={(e) => onUpdateSectionTitle(section.id, e.target.value)}
                            placeholder="Enter section title..."
                            className="font-bold text-zinc-900 text-sm bg-transparent border-none p-0 focus:ring-0 w-full max-w-md placeholder:text-zinc-300"
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onAddItemToSection(section.id)}
                            className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 hover:bg-emerald-100 px-2 py-1 rounded transition-colors mr-2"
                          >
                            <Plus className="w-3 h-3" />
                            Add Item
                          </button>
                          <button
                            onClick={() => onMoveSection('up', section.id)}
                            disabled={sIdx === 0}
                            className="p-1 text-zinc-400 hover:text-emerald-600 disabled:opacity-30 transition-colors"
                          >
                            <ChevronRight className="w-3.5 h-3.5 -rotate-90" />
                          </button>
                          <button
                            onClick={() => onMoveSection('down', section.id)}
                            disabled={sIdx === totalSections - 1}
                            className="p-1 text-zinc-400 hover:text-emerald-600 disabled:opacity-30 transition-colors"
                          >
                            <ChevronRight className="w-3.5 h-3.5 rotate-90" />
                          </button>
                          <button
                            onClick={() => onRemoveSection(section.id)}
                            className="p-1 text-zinc-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* Item rows */}
                  {items.map((item, iIdx) => (
                    <tr
                      key={item.id}
                      className="hover:bg-zinc-50/50 transition-colors group border-b border-zinc-50"
                    >
                      <td className="px-3 py-3 text-xs text-zinc-400 font-mono">{iIdx + 1}</td>
                      <td className="px-3 py-3">
                        <p className="text-sm font-medium text-zinc-900">{item.description}</p>
                      </td>
                      <td className="px-3 py-3 text-center text-sm text-zinc-600">{item.qty}</td>
                      <td className="px-3 py-3 text-center text-sm text-zinc-600">{item.unit}</td>
                      <td className="px-3 py-3 text-right font-mono text-xs text-zinc-600">
                        {fmt(item.unitCost)}
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-xs font-semibold text-zinc-700 border-r border-zinc-100">
                        {fmt(item.qty * item.unitCost)}
                      </td>
                      {/* Cols 7–11: blank for item rows */}
                      <td className="px-3 py-3" />
                      <td className="px-3 py-3" />
                      <td className="px-3 py-3" />
                      <td className="px-3 py-3" />
                      <td className="px-3 py-3" />
                      {/* Actions */}
                      <td className="px-3 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onEditItem(item, section.id)}
                            className="p-1.5 text-zinc-300 hover:text-emerald-600 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="p-1.5 text-zinc-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {items.length === 0 && (
                    <tr>
                      <td colSpan={12} className="py-4" />
                    </tr>
                  )}
                </tbody>

                {/* ── Section subtotal / cost-input row ── */}
                <tbody className="bg-emerald-50/30 border-t border-zinc-100">
                  <tr>
                    {/* Span cols 1-5 with label */}
                    <td
                      colSpan={5}
                      className="px-3 py-3 text-right text-[10px] font-black text-zinc-400 uppercase tracking-wider"
                    >
                      Subtotal — {toRoman(sIdx + 1)}
                    </td>

                    {/* Material total sum */}
                    <td className="px-3 py-3 text-right font-mono text-xs font-bold text-zinc-700 border-r border-zinc-100">
                      {fmt(materialSum)}
                    </td>

                    {/* Labor Cost — editable */}
                    <td className="px-3 py-3 text-right">
                      <CostInput
                        value={laborCost}
                        onChange={(v) => onUpdateSectionCosts(section.id, 'laborCost', v)}
                      />
                    </td>

                    {/* Equipment Cost — editable */}
                    <td className="px-3 py-3 text-right">
                      <CostInput
                        value={equipmentCost}
                        onChange={(v) => onUpdateSectionCosts(section.id, 'equipmentCost', v)}
                      />
                    </td>

                    {/* Total Direct Cost — calculated */}
                    <td className="px-3 py-3 text-right font-mono text-xs font-bold text-zinc-700">
                      {fmt(totalDirect)}
                    </td>

                    {/* Indirect Cost — editable */}
                    <td className="px-3 py-3 text-right">
                      <CostInput
                        value={indirectCost}
                        onChange={(v) => onUpdateSectionCosts(section.id, 'indirectCost', v)}
                      />
                    </td>

                    {/* Section Total — calculated */}
                    <td className="px-3 py-3 text-right font-mono text-xs font-black text-emerald-700">
                      {fmt(sectionTotal)}
                    </td>

                    {/* Actions empty */}
                    <td />
                  </tr>
                </tbody>
              </React.Fragment>
            );
          })}

          {/* ── Grand total ── */}
          <tbody className="bg-white border-t-2 border-zinc-200">
            <tr>
              <td colSpan={5} className="px-3 py-4" />
              <td className="px-3 py-4 text-right font-mono text-sm font-black text-zinc-600 border-r border-zinc-100">
                {fmt(grandMaterial)}
              </td>
              <td className="px-3 py-4 text-right font-mono text-sm font-bold text-zinc-500">
                {fmt(grandLabor)}
              </td>
              <td className="px-3 py-4 text-right font-mono text-sm font-bold text-zinc-500">
                {fmt(grandEquipment)}
              </td>
              <td className="px-3 py-4 text-right font-mono text-sm font-bold text-zinc-600">
                {fmt(grandDirect)}
              </td>
              <td className="px-3 py-4 text-right font-mono text-sm font-bold text-zinc-500">
                {fmt(grandIndirect)}
              </td>
              <td className="px-3 py-4 text-right">
                <div>
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">
                    Total Project Cost
                  </p>
                  <p className="font-mono text-lg font-black text-emerald-600">{fmt(grandTotal)}</p>
                </div>
              </td>
              <td />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
