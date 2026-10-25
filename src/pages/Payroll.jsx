import React, { useState } from 'react';
import { request } from '../api/client';
import { money, MONTHS, empName, list } from '../utils/format';
import { input, btn, btnPrimary, btnGhost } from '../components/styles';
import { Badge } from '../components/Badge';
import { Field } from '../components/Field';
import { Modal } from '../components/Modal';
import { DataTable } from '../components/DataTable';
import { PageHead } from '../components/PageHead';

export function Payroll({ res, employees, canManage, act, token }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ emp: 'all', month: new Date().getMonth() + 1, year: new Date().getFullYear() });
  const rows = list(res.data);
  const staff = list(employees);
  const owed = rows.filter((p) => p.status !== 'Paid').reduce((s, p) => s + (Number(p.netSalary) || 0), 0);

  // The API generates one employee at a time, so "all" loops and skips existing slips (409)
  const generate = async () => {
    const targets = f.emp === 'all' ? staff : staff.filter((e) => e._id === f.emp);
    let made = 0, skipped = 0, failed = 0, lastErr = '';
    for (const e of targets) {
      try {
        await request('/payroll/generate', { method: 'POST', token, body: { employeeId: e._id, month: Number(f.month), year: Number(f.year) } });
        made++;
      } catch (err) {
        if (err.status === 409) skipped++; else { failed++; lastErr = err.message; }
      }
    }
    if (!made && failed) throw new Error(lastErr);
    return { made, skipped, failed };
  };

  const submit = async (e) => {
    e.preventDefault();
    const ok = await act(generate, (r) => `${r.made} slip(s) generated${r.skipped ? `, ${r.skipped} already existed` : ''}${r.failed ? `, ${r.failed} failed` : ''}`);
    if (ok) { setOpen(false); res.reload(); }
  };
  const pay = (id) => act(() => request(`/payroll/${id}/pay`, { method: 'PATCH', token }), 'Marked as paid').then((ok) => ok && res.reload());

  const cols = [
    ...(canManage ? [{ key: 'e', label: 'Employee', render: (p) => <span className="font-medium text-slate-900">{empName(p)}</span> }] : []),
    { key: 'p', label: 'Period', render: (p) => `${MONTHS[(p.month || 1) - 1]} ${p.year}` },
    { key: 'g', label: 'Gross', render: (p) => money(p.grossSalary) },
    { key: 't', label: 'Tax', render: (p) => money(p.tax) },
    { key: 'n', label: 'Net salary', render: (p) => <span className="font-semibold text-slate-900">{money(p.netSalary)}</span> },
    { key: 's', label: 'Status', render: (p) => <Badge value={p.status} /> },
    ...(canManage ? [{ key: 'a', label: 'Action', right: true, render: (p) => p.status !== 'Paid' && <button className={`${btn} bg-teal-700 px-3 py-1 text-xs text-white hover:bg-teal-800`} onClick={() => pay(p._id)}>Mark paid</button> }] : []),
  ];

  return (
    <>
      <PageHead title="Payroll" sub={canManage && rows.length ? `${money(owed)} still to be paid` : 'Your salary slips.'}>
        {canManage && <button className={btnPrimary} onClick={() => setOpen(true)}>Generate payroll</button>}
      </PageHead>
      <DataTable columns={cols} rows={rows} loading={res.loading} error={res.error} onRetry={res.reload} rowKey={(p) => p._id} empty="No payroll slips yet." />
      {open && (
        <Modal title="Generate payroll" onClose={() => setOpen(false)}>
          <form onSubmit={submit} className="space-y-4">
            <Field label="Employee">
              <select className={input} value={f.emp} onChange={(e) => setF({ ...f, emp: e.target.value })}>
                <option value="all">All employees ({staff.length})</option>
                {staff.map((e) => <option key={e._id} value={e._id}>{e.user?.name} ({e.employeeCode})</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Month">
                <select className={input} value={f.month} onChange={(e) => setF({ ...f, month: e.target.value })}>{MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}</select>
              </Field>
              <Field label="Year"><input className={input} type="number" required value={f.year} onChange={(e) => setF({ ...f, year: e.target.value })} /></Field>
            </div>
            <p className="text-xs text-slate-500">Tax, unpaid leave and late deductions are calculated by the server. Existing slips are skipped.</p>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className={btnGhost} onClick={() => setOpen(false)}>Cancel</button>
              <button className={btnPrimary} disabled={!staff.length}>Generate</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
