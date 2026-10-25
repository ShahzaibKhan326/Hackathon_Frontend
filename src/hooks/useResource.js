import { useState, useEffect, useCallback } from 'react';
import { request, unwrap } from '../api/client';

/* Fetches a resource whenever `enabled` flips on; handles 401 and errors per-view */
export function useResource(path, token, enabled, onAuthFail) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    if (!enabled || !token) return;
    setLoading(true);
    setError('');
    try {
      setData(unwrap(await request(path, { token })));
    } catch (e) {
      if (e.status === 401) onAuthFail();
      else setError(e.message || 'Could not load data. The server may be waking up, try again.');
    } finally {
      setLoading(false);
    }
  }, [path, token, enabled, onAuthFail]);
  useEffect(() => { load(); }, [load]);
  return { data, loading, error, reload: load };
}
