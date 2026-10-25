import React from 'react';
import { request } from '../api/client';
import { fmtDate, fmtTime, todayUTC, empName, list } from '../utils/format';
import { btnPrimary, btnGhost } from '../components/styles';
import { Badge } from '../components/Badge';
import { DataTable } from '../components/DataTable';
import { PageHead } from '../components/PageHead';

export function Attendance({ res, canManage, myId, act, token }) {
  const rows = list(res.data);
  const today = rows.find((a) => a.date === todayUTC() && String(a.user?._id ?? a.user) === String(myId));
  const clockedIn = !!today;
  const clockedOut = today?.status === 'Checked-Out';
  const hrs = (a) => (a.checkOut?.totalHours ? `${a.checkOut.totalHours} h` : '-');
  const punch = (kind) => act(() => request(`/attendance/${kind}`, { method: 'POST', token }), (r) => r?.message || 'Done').then((ok) => ok && res.reload());

  const cols = [
    ...(canManage ? [{ key: 'e', label: 'Employee', render: (a) => <span className="font-medium text-slate-900">{empName(a)}</span> }] : []),
    { key: 'd', label: 'Date', render: (a) => <span className="font-medium text-slate-900">{fmtDate(a.date)}</span> },
    { key: 'i', label: 'Clock in', render: (a) => fmtTime(a.checkIn?.time) },
    { key: 'o', label: 'Clock out', render: (a) => fmtTime(a.checkOut?.time) },
    { key: 'h', label: 'Hours', render: hrs },
    { key: 's', label: 'Status', render: (a) => <Badge value={a.checkIn?.status || a.status} /> },
  ];
  return (
    <>
      <PageHead title="Attendance" sub={canManage ? 'Everyone’s clock in and clock out history.' : 'Your clock in and clock out history.'} />
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5">
        <div>
          <p className="text-sm text-slate-500">Today</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">
            {!clockedIn ? 'Not clocked in yet' : clockedOut ? `Done for the day (${hrs(today)})` : `Clocked in at ${fmtTime(today.checkIn?.time)}`}
          </p>
        </div>
        <div className="flex gap-2">
          <button className={btnPrimary} disabled={clockedIn} onClick={() => punch('check-in')}>Clock in</button>
          <button className={btnGhost} disabled={!clockedIn || clockedOut} onClick={() => punch('check-out')}>Clock out</button>
        </div>
      </div>
      <DataTable columns={cols} rows={rows} loading={res.loading} error={res.error} onRetry={res.reload} rowKey={(a) => a._id} empty="No attendance recorded yet. Clock in to start." />
    </>
  );
}
