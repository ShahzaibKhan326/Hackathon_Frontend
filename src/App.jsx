import React, { useState, useEffect, useCallback } from 'react';
import { request, TOKEN_KEY } from './api/client';
import { useResource } from './hooks/useResource';
import { Toast } from './components/Toast';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Employees } from './pages/Employees';
import { Attendance } from './pages/Attendance';
import { Leaves } from './pages/Leaves';
import { Payroll } from './pages/Payroll';

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '');
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('attendance');
  const [toast, setToast] = useState(null);
  const [menu, setMenu] = useState(false);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(''); setUser(null); setTab('attendance');
  }, []);

  const onLogin = (t, u) => {
    localStorage.setItem(TOKEN_KEY, t);
    setToken(t); setUser(u || null);
    setTab(u?.role === 'admin' || u?.role === 'hr' ? 'dashboard' : 'attendance');
  };

  // Restore session on reload
  useEffect(() => {
    if (!token || user) return;
    request('/auth/me', { token })
      .then((d) => {
        const u = d.data || d.user;
        setUser(u);
        if (u?.role === 'admin' || u?.role === 'hr') setTab('dashboard');
      })
      .catch((e) => { if (e.status === 401) logout(); });
  }, [token, user, logout]);

  const canManage = user?.role === 'admin' || user?.role === 'hr';

  const dash = useResource('/reports/dashboard', token, tab === 'dashboard' && canManage, logout);
  const emps = useResource('/employees?limit=100', token, tab === 'employees' || tab === 'payroll', logout);
  const att = useResource('/attendance?limit=100', token, tab === 'attendance', logout);
  const leaves = useResource('/leaves?limit=100', token, tab === 'leaves', logout);
  const pay = useResource('/payroll?limit=100', token, tab === 'payroll', logout);

  // Runs a mutation, shows a toast, returns true on success
  const act = useCallback(async (fn, successMsg) => {
    try {
      const r = await fn();
      setToast({ type: 'ok', msg: typeof successMsg === 'function' ? successMsg(r) : successMsg });
      return r || true;
    } catch (e) {
      if (e.status === 401) logout();
      else setToast({ type: 'error', msg: e.message });
      return false;
    }
  }, [logout]);

  if (!token) return <Login onLogin={onLogin} />;

  const nav = [
    ...(canManage ? [{ id: 'dashboard', label: 'Overview' }] : []),
    { id: 'employees', label: 'Employees' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'leaves', label: 'Leave' },
    { id: 'payroll', label: 'Payroll' },
  ];
  const go = (id) => { setTab(id); setMenu(false); };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 lg:flex">
      {/* mobile top bar */}
      <div className="flex items-center justify-between bg-teal-950 px-4 py-3 text-white lg:hidden">
        <span className="font-semibold">HCM Lite</span>
        <button onClick={() => setMenu(!menu)} aria-label="Toggle menu" className="rounded px-2 py-1 ring-1 ring-white/30">{menu ? 'Close' : 'Menu'}</button>
      </div>

      <aside className={`${menu ? 'block' : 'hidden'} w-full flex-col bg-teal-950 text-teal-100 lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-60`}>
        <div className="hidden px-6 py-6 text-lg font-semibold tracking-tight text-white lg:block">HCM Lite</div>
        <nav className="flex-1 space-y-1 px-3 py-2">
          {nav.map((n) => (
            <button key={n.id} onClick={() => go(n.id)} aria-current={tab === n.id ? 'page' : undefined}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition ${tab === n.id ? 'bg-teal-800 text-white' : 'hover:bg-teal-900'}`}>
              {n.label}
            </button>
          ))}
        </nav>
        <div className="border-t border-teal-900 p-4">
          <p className="truncate text-sm font-medium text-white">{user?.name || 'Loading…'}</p>
          <p className="truncate text-xs text-teal-300">{user?.email} {user?.role && `· ${user.role}`}</p>
          <button onClick={logout} className="mt-3 w-full rounded-lg border border-teal-800 py-2 text-sm hover:bg-teal-900">Sign out</button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-4 sm:p-8">
        {tab === 'dashboard' && canManage && <Dashboard res={dash} setTab={go} />}
        {tab === 'employees' && <Employees res={emps} canManage={canManage} act={act} token={token} />}
        {tab === 'attendance' && <Attendance res={att} canManage={canManage} myId={user?.id ?? user?._id} act={act} token={token} />}
        {tab === 'leaves' && <Leaves res={leaves} canManage={canManage} act={act} token={token} />}
        {tab === 'payroll' && <Payroll res={pay} employees={emps.data} canManage={canManage} act={act} token={token} />}
      </main>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
