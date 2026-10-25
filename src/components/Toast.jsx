import React, { useEffect } from 'react';

export function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [toast, onClose]);
  if (!toast) return null;
  const tone = toast.type === 'error' ? 'bg-rose-600' : 'bg-teal-700';
  return (
    <div role="status" className={`fixed bottom-5 right-5 z-[60] flex max-w-sm items-start gap-3 rounded-xl px-4 py-3 text-sm text-white shadow-lg ${tone}`}>
      <span>{toast.msg}</span>
      <button onClick={onClose} aria-label="Dismiss" className="opacity-80 hover:opacity-100">✕</button>
    </div>
  );
}
