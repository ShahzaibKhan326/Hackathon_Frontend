import React from 'react';

export function DataTable({ columns, rows, loading, error, onRetry, empty, rowKey }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-medium text-slate-500">
            <tr>{columns.map((c) => <th key={c.key} className={`px-4 py-3 ${c.right ? 'text-right' : ''}`}>{c.label}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && !rows.length && [0, 1, 2, 3].map((i) => (
              <tr key={i}>{columns.map((c) => <td key={c.key} className="px-4 py-4"><div className="h-3 w-3/4 animate-pulse rounded bg-slate-100" /></td>)}</tr>
            ))}
            {rows.map((r) => (
              <tr key={rowKey(r)} className="hover:bg-slate-50/70">
                {columns.map((c) => <td key={c.key} className={`px-4 py-3 ${c.right ? 'text-right' : ''}`}>{c.render(r)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {error && (
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <span>{error}</span><button className="font-medium underline" onClick={onRetry}>Retry</button>
        </div>
      )}
      {!loading && !error && !rows.length && <div className="px-4 py-12 text-center text-sm text-slate-500">{empty}</div>}
    </div>
  );
}
