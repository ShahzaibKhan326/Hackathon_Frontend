import React from 'react';
import { money } from '../utils/format';
import { PageHead } from '../components/PageHead';

export function Dashboard({ res, setTab }) {
  const d = res.data || {};
  const cards = [
    { label: 'Employees', value: d.totalEmployees ?? d.employeesCount ?? 0, tab: 'employees' },
    { label: 'Present today', value: d.presentToday ?? 0, tab: 'attendance' },
    { label: 'Pending leave requests', value: d.pendingLeaves ?? 0, tab: 'leaves', warn: (d.pendingLeaves ?? 0) > 0 },
    { label: 'Payroll this month', value: money(d.currentMonth?.totalPayrollExpense), tab: 'payroll' },
  ];
  return (
    <>
      <PageHead title="Overview" sub="A snapshot of today." />
      {res.error && <div className="mb-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{res.error} <button className="ml-2 underline" onClick={res.reload}>Retry</button></div>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <button key={c.label} onClick={() => setTab(c.tab)} className="rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-teal-600">
            <p className="text-sm text-slate-500">{c.label}</p>
            {res.loading && !res.data
              ? <div className="mt-3 h-8 w-20 animate-pulse rounded bg-slate-100" />
              : <p className={`mt-2 text-3xl font-semibold ${c.warn ? 'text-amber-600' : 'text-slate-900'}`}>{c.value}</p>}
          </button>
        ))}
      </div>
    </>
  );
}
