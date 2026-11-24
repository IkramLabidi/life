import { useCallback, useEffect, useMemo, useState } from 'react';
import api, { getErrorMessage } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';

/**
 * Generic collection hook: fetches a list endpoint and exposes
 * optimistic create / update / remove helpers with toast feedback.
 */
export const useCollection = (endpoint, params) => {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const paramsKey = useMemo(() => JSON.stringify(params || {}), [params]);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(endpoint, { params: JSON.parse(paramsKey) });
      setItems(Array.isArray(res.data) ? res.data : res.data.items || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [endpoint, paramsKey]);

  useEffect(() => {
    reload();
  }, [reload]);

  const create = useCallback(
    async (payload, message = 'Added successfully') => {
      try {
        const res = await api.post(endpoint, payload);
        setItems((prev) => [...prev, res.data]);
        toast.success(message);
        return res.data;
      } catch (err) {
        toast.error(getErrorMessage(err));
        throw err;
      }
    },
    [endpoint, toast]
  );

  const update = useCallback(
    async (id, payload, message = 'Updated successfully') => {
      try {
        const res = await api.put(`${endpoint}/${id}`, payload);
        setItems((prev) => prev.map((it) => (it._id === id ? res.data : it)));
        toast.success(message);
        return res.data;
      } catch (err) {
        toast.error(getErrorMessage(err));
        throw err;
      }
    },
    [endpoint, toast]
  );

  const remove = useCallback(
    async (id, message = 'Deleted successfully') => {
      try {
        await api.delete(`${endpoint}/${id}`);
        setItems((prev) => prev.filter((it) => it._id !== id));
        toast.success(message);
      } catch (err) {
        toast.error(getErrorMessage(err));
        throw err;
      }
    },
    [endpoint, toast]
  );

  return { items, setItems, loading, error, reload, create, update, remove };
};

export default useCollection;
