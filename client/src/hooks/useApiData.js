import { useCallback, useEffect, useMemo, useState } from 'react';
import api, { getErrorMessage } from '../services/api.js';

/** Fetch a single object endpoint (dashboard, finance summary, reports…). */
export const useApiData = (endpoint, params, { auto = true } = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(auto);
  const [error, setError] = useState(null);
  const paramsKey = useMemo(() => JSON.stringify(params || {}), [params]);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(endpoint, { params: JSON.parse(paramsKey) });
      setData(res.data);
      return res.data;
    } catch (err) {
      setError(getErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, [endpoint, paramsKey]);

  useEffect(() => {
    if (auto) reload();
  }, [auto, reload]);

  return { data, setData, loading, error, reload };
};

export default useApiData;
