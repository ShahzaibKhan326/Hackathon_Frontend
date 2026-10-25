import React, { useState, useMemo } from 'react';
import { request } from '../api/client';
import { list } from '../utils/format';
import { input, btnPrimary, btnGhost } from '../components/styles';
import { Badge } from '../components/Badge';
import { Field } from '../components/Field';
import { Modal } from '../components/Modal';
import { DataTable } from '../components/DataTable';
import { PageHead } from '../components/PageHead';

export function Employees({ res, canManage, act, token }) {
  const [q, setQ] = useState('');
  const [role, setRole] = useState('all');
  const [open, setOpen] = useState(false);
  const [created, setCreated] = useState(null); // { email, password } shown once
  const blank = { name: '', email: '', employeeCode: '', role: 'employee', department: '', designation: '', basic: '', allowances: '' };
  const [f, setF] = useState(blank);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return list(res.data).filter((e) => (role === 'all' || e.user?.role === role) &&
      (!s || [e.user?.name, e.user?.email, e.employeeCode, e.department, e.designation].some((v) => v?.toLowerCase().includes(s))));
  }, [res.data, q, role]);

  const submit = async (e) => {
    e.preventDefault();
    const { basic, allowances, ...rest } = f;
    const r = await act(
      () => request('/employees', { method: 'POST', token, body: { ...rest, employeeCode: f.employeeCode.trim(), salary: { basic: Number(basic) || 0, allowances: Number(allowances) || 0 } } }),
      'Employee added'
    );
    if (r) {
      setCreated({ email: f.email, password: r.data?.temporaryPassword });
      setOpen(false); setF(blank); res.reload();
    }
  };

  const cols = [
    { key: 'n', label: 'Name', render: (e) => (
      <div className="flex items-center gap-3">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-teal-100 text-xs font-semibold text-teal-800">{(e.user?.name || '?').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}</span>
        <div><p className="font-medium text-slate-900">{e.user?.name}</p><p className="text-xs text-slate-500">{e.user?.email}</p></div>
      </div>) },
    { key: 'c', label: 'Code', render: (e) => <span className="font-mono text-xs text-slate-600">{e.employeeCode}</span> },
    { key: 'r', label: 'Role', render: (e) => <Badge value={e.user?.role || 'employee'} /> },
    { key: 'd', label: 'Department', render: (e) => <span className="text-slate-600">{e.department || '-'}</span> },
    { key: 'p', label: 'Designation', render: (e) => <span className="text-slate-600">{e.designation || '-'}</span> },
  ];

  return (
    <>
      <PageHead title="Employees" sub={`${rows.length} shown`}>
        {canManage && <button className={btnPrimary} onClick={() => setOpen(true)}>Add employee</button>}
      </PageHead>
      <div className="mb-4 flex flex-wrap gap-3">
        <input className={`${input} max-w-xs`} placeholder="Search name, email, code, department" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search employees" />
        <select className={`${input} w-auto`} value={role} onChange={(e) => setRole(e.target.value)} aria-label="Filter by role">
          <option value="all">All roles</option><option value="employee">Employee</option><option value="hr">HR</option><option value="admin">Admin</option>
        </select>
      </div>
      <DataTable columns={cols} rows={rows} loading={res.loading} error={res.error} onRetry={res.reload} rowKey={(e) => e._id} empty="No employees match your search." />

      {open && (
        <Modal title="Add employee" onClose={() => setOpen(false)}>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Full name"><input className={input} required value={f.name} onChange={set('name')} /></Field>
              <Field label="Employee code"><input className={`${input} uppercase`} required placeholder="EMP001" value={f.employeeCode} onChange={set('employeeCode')} /></Field>
            </div>
            <Field label="Work email"><input className={input} type="email" required value={f.email} onChange={set('email')} /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Role">
                <select className={input} value={f.role} onChange={set('role')}><option value="employee">Employee</option><option value="hr">HR</option><option value="admin">Admin</option></select>
              </Field>
              <Field label="Department"><input className={input} required value={f.department} onChange={set('department')} /></Field>
              <Field label="Designation"><input className={input} required value={f.designation} onChange={set('designation')} /></Field>
              <Field label="Basic salary (monthly)"><input className={input} type="number" min="0" required value={f.basic} onChange={set('basic')} /></Field>
              <Field label="Allowances (monthly)"><input className={input} type="number" min="0" value={f.allowances} onChange={set('allowances')} /></Field>
            </div>
            <p className="text-xs text-slate-500">A temporary password is generated for you to share after saving.</p>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className={btnGhost} onClick={() => setOpen(false)}>Cancel</button>
              <button className={btnPrimary}>Save employee</button>
            </div>
          </form>
        </Modal>
      )}

      {created && (
        <Modal title="Employee created" onClose={() => setCreated(null)}>
          <p className="text-sm text-slate-600">Share these sign-in details with the employee. The password is shown only once.</p>
          <div className="mt-4 rounded-lg bg-slate-50 p-4 font-mono text-sm">
            <p>{created.email}</p>
            <p className="mt-1 font-semibold text-slate-900">{created.password}</p>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button className={btnGhost} onClick={() => navigator.clipboard?.writeText(created.password || '')}>Copy password</button>
            <button className={btnPrimary} onClick={() => setCreated(null)}>Done</button>
          </div>
        </Modal>
      )}
    </>
  );
}
