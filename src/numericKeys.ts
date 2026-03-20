// ── Numeric key guards ────────────────────────────────────
// Allow: digits, control keys, and Ctrl/Cmd+A / Ctrl/Cmd+C / Ctrl/Cmd+V

export const integerOnly = (e: React.KeyboardEvent<HTMLInputElement>) => {
  const ctrl = e.ctrlKey || e.metaKey;
  if (ctrl && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) return;
  const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
  if (!allowed.includes(e.key) && !/^\d$/.test(e.key)) e.preventDefault();
};

export const decimalOnly = (e: React.KeyboardEvent<HTMLInputElement>) => {
  const ctrl = e.ctrlKey || e.metaKey;
  if (ctrl && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) return;
  const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
  if (!allowed.includes(e.key) && !/^\d$/.test(e.key) && e.key !== '.') e.preventDefault();
};
