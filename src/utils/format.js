export const money = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(n) || 0);
export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '-');
export const fmtTime = (d) => (d ? new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-');
export const dayCount = (a, b) => Math.max(1, Math.round((new Date(b) - new Date(a)) / 86400000) + 1);
export const hoursBetween = (a, b) => (a && b ? ((new Date(b) - new Date(a)) / 3600000).toFixed(1) + ' h' : '-');
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const isToday = (d) => d && new Date(d).toDateString() === new Date().toDateString();
export const todayUTC = () => new Date().toISOString().split('T')[0]; // the API stamps attendance with the UTC date
export const empName = (r) => r?.employee?.user?.name || r?.user?.name || '-';
export const list = (d) => (Array.isArray(d) ? d.filter(Boolean) : []);
