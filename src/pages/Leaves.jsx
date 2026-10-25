import React, { useState } from 'react';
import { request } from '../api/client';
import { fmtDate, dayCount, empName } from '../utils/format';
import { input, btn, btnPrimary, btnGhost } from '../components/styles';
import { Badge } from '../components/Badge';
import { Field } from '../components/Field';
import { Modal } from '../components/Modal';
import { DataTable } from '../components/DataTable';
import { PageHead } from '../components/PageHead';

export function Leaves({ res, canManage, act, token }) {
  const [open, setOpen] = useState(false);
  const blank = { leaveType: 'annual', startDate: '', endDate: '', reason: '' };
  const [f, setF] = useState(blank);
  const [filter, setFilter] = useState('all');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const rows = (Array.isArray(res.data) ? res.data : []).filter((l) => filter === 'all' || l.status === filter);
  const invalidRange = f.startDate && f.endDate && f.endDate < f.startDate;

  const submit = async (e) => {
    e.preventDefault();
    if (invalidRange) return;
    const ok = await act(() => request('/leaves', { method: 'POST', token, body: f }), 'Leave request submitted');
    if (ok) { setOpen(false); setF(blank); res.reload(); }
  };
  const decide = (id, status) => act(() => request(`/leaves/${id}/status`, { method: 'PATCH', token, body: { status } }), `Leave ${status}`).then((ok) => ok && res.reload());

  const cols = [
    ...(canManage ? [{ key: 'e', label: 'Employee', render: (l) => <span className="font-medium text-slate-900">{empName(l)}</span> }] : []),
    { key: 't', label: 'Type', render: (l) => <span className="capitalize">{l.leaveType}</span> },
    { key: 'p', label: 'Dates', render: (l) => <span>{fmtDate(l.startDate)} to {fmtDate(l.endDate)} <span className="text-slate-400">({l.totalDays}d)</span></span> },
    { key: 'r', label: 'Reason', render: (l) => <span className="block max-w-xs truncate text-slate-600" title={l.reason}>{l.reason}</span> },
    { key: 's', label: 'Status', render: (l) => <Badge value={l.status} /> },
    ...(canManage ? [{ key: 'a', label: 'Actions', right: true, render: (l) => l.status === 'Pending' && (
      <div className="flex justify-end gap-2">
        <button className={`${btn} bg-teal-700 px-3 py-1 text-xs text-white hover:bg-teal-800`} onClick={() => decide(l._id, 'Approved')}>Approve</button>
        <button className={`${btn} border border-rose-300 px-3 py-1 text-xs text-rose-700 hover:bg-rose-50`} onClick={() => decide(l._id, 'Rejected')}>Reject</button>
      </div>) }] : []),
  ];

  return (
    <>
      <PageHead title="Leave" sub={canManage ? 'Review and decide on requests.' : 'Your leave requests.'}>
        <button className={btnPrimary} onClick={() => setOpen(true)}>Request leave</button>
      </PageHead>
      <div className="mb-4 flex gap-2">
        {['all', 'Pending', 'Approved', 'Rejected'].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${filter === s ? 'bg-teal-700 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-300 hover:bg-slate-50'}`}>{s}</button>
        ))}
      </div>
      <DataTable columns={cols} rows={rows} loading={res.loading} error={res.error} onRetry={res.reload} rowKey={(l) => l._id} empty="No leave requests here." />
      {open && (
        <Modal title="Request leave" onClose={() => setOpen(false)}>
          <form onSubmit={submit} className="space-y-4">
            <Field label="Leave type">
              <select className={input} value={f.leaveType} onChange={set('leaveType')}><option value="annual">Annual</option><option value="sick">Sick</option><option value="casual">Casual</option><option value="unpaid">Unpaid</option></select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="From"><input className={input} type="date" required value={f.startDate} onChange={set('startDate')} /></Field>
              <Field label="To"><input className={input} type="date" required min={f.startDate} value={f.endDate} onChange={set('endDate')} /></Field>
            </div>
            {invalidRange && <p className="text-xs text-rose-600">The end date must be on or after the start date.</p>}
            {f.startDate && f.endDate && !invalidRange && <p className="text-xs text-slate-500">Up to {dayCount(f.startDate, f.endDate)} day(s); weekends are not counted.</p>}
            <Field label="Reason"><textarea className={input} rows={3} required value={f.reason} onChange={set('reason')} /></Field>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className={btnGhost} onClick={() => setOpen(false)}>Cancel</button>
              <button className={btnPrimary} disabled={invalidRange}>Submit request</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
