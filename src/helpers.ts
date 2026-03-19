import { Project } from './index';

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

export const exportToCSV = (project: Project): void => {
  if (!project?.sections) return;

  const headers = [
    'No',
    'Description/Materials',
    'Qty',
    'Unit',
    'Unit Cost',
    'Material Total',
    'Labor Cost',
    'Equipment Cost',
    'Total Direct Cost',
    'Indirect Cost',
    'Section Total',
  ];

  const rows: (string | number)[][] = [];

  let grandMaterial  = 0;
  let grandLabor     = 0;
  let grandEquipment = 0;
  let grandIndirect  = 0;

  project.sections.forEach((section, sIdx) => {
    // Section header
    rows.push([
      `Section ${toRoman(sIdx + 1)}: ${section.title}`,
      '', '', '', '', '', '', '', '', '', '',
    ]);

    const items = section.items ?? [];
    items.forEach((item, iIdx) => {
      const materialTotal = item.qty * item.unitCost;
      rows.push([
        iIdx + 1,
        item.description,
        item.qty,
        item.unit,
        item.unitCost,
        materialTotal,
        '', '', '', '', '',
      ]);
    });

    // Section subtotal row
    const materialSum   = items.reduce((s, i) => s + i.qty * i.unitCost, 0);
    const laborCost     = section.laborCost ?? 0;
    const equipmentCost = section.equipmentCost ?? 0;
    const totalDirect   = materialSum + laborCost + equipmentCost;
    const indirectCost  = section.indirectCost ?? 0;
    const sectionTotal  = totalDirect + indirectCost;

    rows.push([
      `Section ${toRoman(sIdx + 1)} Subtotal`,
      '', '', '', '',
      materialSum,
      laborCost,
      equipmentCost,
      totalDirect,
      indirectCost,
      sectionTotal,
    ]);

    grandMaterial  += materialSum;
    grandLabor     += laborCost;
    grandEquipment += equipmentCost;
    grandIndirect  += indirectCost;
  });

  // Grand total row
  const grandDirect = grandMaterial + grandLabor + grandEquipment;
  const grandTotal  = grandDirect + grandIndirect;

  rows.push([]);
  rows.push([
    'TOTAL ESTIMATED PROJECT COST',
    '', '', '', '',
    grandMaterial,
    grandLabor,
    grandEquipment,
    grandDirect,
    grandIndirect,
    grandTotal,
  ]);

  const escape = (val: string | number) => {
    const s = String(val);
    return s.includes(',') ? `"${s}"` : s;
  };

  const csvContent = [
    headers.join(','),
    ...rows.map((r) => r.map(escape).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `CostEstimate_${project.name || 'export'}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
