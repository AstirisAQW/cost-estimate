import { Project, CatalogItem, CostItem, Section } from './index';

// ── Roman numerals ────────────────────────────────────────
export const toRoman = (num: number): string => {
  const roman: { [key: string]: number } = {
    M: 1000, CM: 900, D: 500, CD: 400,
    C: 100,  XC: 90,  L: 50,  XL: 40,
    X: 10,   IX: 9,   V: 5,   IV: 4,  I: 1,
  };
  let str = '';
  for (const key of Object.keys(roman)) {
    const q = Math.floor(num / roman[key]);
    num -= q * roman[key];
    str += key.repeat(q);
  }
  return str;
};

// ── Shared download helper ────────────────────────────────
const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// ── Estimate CSV export ───────────────────────────────────
export const exportToCSV = (project: Project): void => {
  if (!project?.sections) return;

  const escape = (val: string | number) => {
    const s = String(val);
    return s.includes(',') ? `"${s}"` : s;
  };

  const loc = project.location;
  const locationParts = [loc.street, loc.barangay, loc.city, loc.province, loc.postalCode]
    .filter(Boolean)
    .join(', ');

  // ── Project header rows ───────────────────────────────────
  const headerRows = [
    ['Date',        project.date],
    ['Project Name', project.name],
    ['Location',    locationParts || '—'],
    ['Owner',       project.owner || '—'],
    ['Subject',     project.subject || '—'],
    [], // blank spacer
  ];

  // ── Table headers ─────────────────────────────────────────
  const tableHeaders = [
    'No', 'Description/Materials', 'Qty', 'Unit', 'Unit Cost',
    'Total Unit Cost', 'Total Material Cost', 'Labor Cost',
    'Equipment Cost', 'Total Direct Cost', 'Indirect Cost', 'Total Cost',
  ];

  const tableRows: (string | number)[][] = [];

  let totalEstimatedMaterialCost  = 0;
  let totalEstimatedLaborCost     = 0;
  let totalEstimatedEquipmentCost = 0;
  let totalEstimatedIndirectCost  = 0;

  project.sections.forEach((section, sIdx) => {
    tableRows.push([`Section ${toRoman(sIdx + 1)}: ${section.title}`, '', '', '', '', '', '', '', '', '', '', '']);

    const items = section.items ?? [];
    items.forEach((item, iIdx) => {
      const itemTotalUnitCost     = item.qty * item.unitCost;
      const itemTotalMaterialCost = itemTotalUnitCost;
      tableRows.push([
        iIdx + 1,
        item.description,
        item.qty,
        item.unit,
        item.unitCost,
        itemTotalUnitCost,
        itemTotalMaterialCost,
        '', '', '', '', '',
      ]);
    });

    const sectionTotalMaterialCost = items.reduce((s, i) => s + i.qty * i.unitCost, 0);
    const sectionLaborCost         = section.laborCost ?? 0;
    const sectionEquipmentCost     = section.equipmentCost ?? 0;
    const sectionTotalDirectCost   = sectionTotalMaterialCost + sectionLaborCost + sectionEquipmentCost;
    const sectionIndirectCost      = section.indirectCost ?? 0;
    const sectionTotalCost         = sectionTotalDirectCost + sectionIndirectCost;

    tableRows.push([
      `Section ${toRoman(sIdx + 1)} Subtotal`, '', '', '', '',
      sectionTotalMaterialCost,
      sectionTotalMaterialCost,
      sectionLaborCost,
      sectionEquipmentCost,
      sectionTotalDirectCost,
      sectionIndirectCost,
      sectionTotalCost,
    ]);

    totalEstimatedMaterialCost  += sectionTotalMaterialCost;
    totalEstimatedLaborCost     += sectionLaborCost;
    totalEstimatedEquipmentCost += sectionEquipmentCost;
    totalEstimatedIndirectCost  += sectionIndirectCost;
  });

  const totalEstimatedDirectCost  = totalEstimatedMaterialCost + totalEstimatedLaborCost + totalEstimatedEquipmentCost;
  const totalEstimatedProjectCost = totalEstimatedDirectCost + totalEstimatedIndirectCost;

  tableRows.push([]);
  tableRows.push([
    'TOTAL ESTIMATED PROJECT COST', '', '', '', '',
    totalEstimatedMaterialCost,
    totalEstimatedMaterialCost,
    totalEstimatedLaborCost,
    totalEstimatedEquipmentCost,
    totalEstimatedDirectCost,
    totalEstimatedIndirectCost,
    totalEstimatedProjectCost,
  ]);

  const csvContent = [
    ...headerRows.map((r) => r.map(escape).join(',')),
    tableHeaders.join(','),
    ...tableRows.map((r) => r.map(escape).join(',')),
  ].join('\n');

  downloadFile(csvContent, `CostEstimate_${project.name || 'export'}.csv`, 'text/csv;charset=utf-8;');
};

// ── Estimate CSV import ───────────────────────────────────
// Parses a CSV exported by this app and returns sections with items.
// Rows that start with a number are item rows; rows starting with "Section X:"
// are section headers; subtotal / total rows are skipped.
export const importFromCSV = (
  csvText: string,
): Pick<Section, 'title' | 'items'>[] => {
  const lines = csvText.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  // Skip header row (index 0)
  const sections: Pick<Section, 'title' | 'items'>[] = [];
  let currentSection: Pick<Section, 'title' | 'items'> | null = null;

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());

    const firstCol = cols[0] ?? '';

    // Section header — "Section I: Title" or "Section I Subtotal"
    if (/^Section\s+[IVXLCDM]+:/i.test(firstCol)) {
      const title = firstCol.replace(/^Section\s+[IVXLCDM]+:\s*/i, '').trim();
      currentSection = { title, items: [] };
      sections.push(currentSection);
      continue;
    }

    // Skip subtotal / total rows
    if (/subtotal|total/i.test(firstCol) || firstCol === '') continue;

    // Item row — first column is a number
    const rowNumber = Number(firstCol);
    if (!isNaN(rowNumber) && rowNumber > 0 && currentSection) {
      const description = cols[1] ?? '';
      const qty         = Number(cols[2]) || 0;
      const unit        = cols[3] ?? '';
      const unitCost    = Number(cols[4]) || 0;

      if (description && qty > 0) {
        currentSection.items.push({
          id: Math.random().toString(36).slice(2),
          description,
          qty,
          unit,
          unitCost,
        } as CostItem);
      }
    }
  }

  return sections.filter((s) => s.items.length > 0);
};

// ── Catalog JSON export ───────────────────────────────────
export const exportCatalog = (catalog: CatalogItem[]): void => {
  const data = JSON.stringify(catalog, null, 2);
  downloadFile(data, 'items_catalog.json', 'application/json');
};

// ── Catalog JSON import ───────────────────────────────────
// Returns parsed catalog items, or throws on invalid JSON / wrong shape.
export const parseCatalogImport = (jsonText: string): CatalogItem[] => {
  const parsed = JSON.parse(jsonText);
  if (!Array.isArray(parsed)) throw new Error('Expected a JSON array.');

  return parsed
    .filter((item: any) => item && typeof item === 'object')
    .map((item: any) => ({
      id:          Math.random().toString(36).slice(2), // always generate fresh IDs to avoid collisions
      description: String(item.description ?? '').trim(),
      unit:        String(item.unit ?? '').trim(),
      unitCost:    Number(item.unitCost) || 0,
      section:     item.section ? String(item.section) : undefined,
    }))
    .filter((item) => item.description); // skip blank entries
};
