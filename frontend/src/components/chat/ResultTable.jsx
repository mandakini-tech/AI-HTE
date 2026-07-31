function formatColumnName(col) {
  return col
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

function formatCellValue(val) {
  if (val === null || val === undefined) return '—';
  if (typeof val === 'number') {
    return val.toLocaleString('en-IN');
  }
  return String(val);
}

export default function ResultTable({ table }) {
  if (!table?.rows?.length) return null;

  const columns = table.columns?.length
    ? table.columns
    : Object.keys(table.rows[0]);

  return (
    <div className="mt-3 overflow-hidden rounded-lg border border-gov-border">
      {table.title && (
        <div className="border-b border-gov-border bg-gov-surface/80 px-4 py-2">
          <h4 className="text-xs font-semibold text-gov-text">{table.title}</h4>
        </div>
      )}
      <div className="max-h-64 overflow-auto">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-gov-surface">
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className="whitespace-nowrap border-b border-gov-border px-4 py-2.5 font-medium text-gov-muted"
                >
                  {formatColumnName(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, i) => (
              <tr
                key={i}
                className="border-b border-gov-border/50 transition-colors hover:bg-gov-surface/40"
              >
                {columns.map((col) => (
                  <td key={col} className="whitespace-nowrap px-4 py-2 text-gov-text">
                    {formatCellValue(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
