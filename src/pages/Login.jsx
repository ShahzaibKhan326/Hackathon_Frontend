import React, { useState } from 'react';
import { request } from '../api/client';
import { input, btnPrimary } from '../components/styles';
import { Field } from '../components/Field';

export function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const data = await request('/auth/login', { method: 'POST', body: { email: email.trim(), password } });
      onLogin(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-teal-950 p-12 text-teal-50 lg:flex">
        <div className="text-lg font-semibold tracking-tight">HCM Lite</div>
        <div>
          <h1 className="max-w-md text-4xl font-semibold leading-tight">Your people, their time, their pay: in one place.</h1>
          <p className="mt-4 max-w-sm text-teal-200/80">Track attendance, approve leave and run payroll without switching tools.</p>
        </div>
        <p className="text-sm text-teal-200/60">The server may take up to 30 seconds to wake on first sign in.</p>
      </div>
      <div className="flex items-center justify-center bg-slate-50 p-6">
        <form onSubmit={submit} className="w-full max-w-sm space-y-5">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Sign in</h2>
            <p className="mt-1 text-sm text-slate-500">Use your work email and password.</p>
          </div>
          {error && <div role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">{error}</div>}
          <Field label="Email">
            <input className={input} type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
          </Field>
          <Field label="Password">
            <div className="relative">
              <input className={`${input} pr-16`} type={show ? 'text' : 'password'} required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="button" onClick={() => setShow(!show)} className="absolute inset-y-0 right-3 text-xs font-medium text-slate-500 hover:text-slate-800">{show ? 'Hide' : 'Show'}</button>
            </div>
          </Field>
          <button className={`${btnPrimary} w-full py-2.5`} disabled={busy}>{busy ? 'Signing in… server may be waking up' : 'Sign in'}</button>
        </form>
      </div>
    </div>
  );
}
