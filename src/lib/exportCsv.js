/**
 * Client-side CSV export for the current table view.
 * Columns come from the same `columns` config the table renders, so the export
 * can never drift from what the admin sees on screen.
 */
function escapeCell(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function toCsvValue(value) {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number") return value;
  // cell() returns JSX — fall back to a stable primitive for the export
  return value?.toString?.() ?? "";
}

export function exportRowsToCsv({ filename, rows, columns }) {
  const exportable = columns.filter((column) => column.export !== false);
  const header = exportable.map((column) => escapeCell(column.header)).join(",");

  const lines = rows.map((row) =>
    exportable
      .map((column) => {
        const raw = column.exportValue ? column.exportValue(row) : row[column.key];
        return escapeCell(toCsvValue(raw));
      })
      .join(","),
  );

  const csv = `\uFEFF${[header, ...lines].join("\n")}`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
