import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api.jsx';

/**
 * useApiWidget — generic hook for widget-level API calls.
 *
 * Each widget can fetch independently with:
 * - Loading state
 * - Error handling with retry
 * - In-memory caching with TTL
 * - Empty state detection
 *
 * @param {string} endpoint - API endpoint (e.g., '/ai/job-readiness')
 * @param {object} options
 * @param {boolean} options.enabled - Whether to auto-fetch (default: true)
 * @param {number}  options.cacheTTL - Cache duration in ms (default: 5 minutes)
 * @param {*}       options.fallback - Fallback data when API fails
 * @param {function} options.transform - Transform response data
 * @param {function} options.isEmpty - Custom check for empty data
 */

const cache = new Map();

export default function useApiWidget(endpoint, options = {}) {
  const {
    enabled = true,
    cacheTTL = 5 * 60 * 1000,
    fallback = null,
    transform = (d) => d,
    isEmpty: isEmptyCheck = (d) => !d || (Array.isArray(d) && d.length === 0),
  } = options;

  const [data, setData] = useState(() => {
    const cached = cache.get(endpoint);
    if (cached && Date.now() - cached.timestamp < cacheTTL) {
      return cached.data;
    }
    return fallback;
  });
  const [loading, setLoading] = useState(() => {
    const cached = cache.get(endpoint);
    return !(cached && Date.now() - cached.timestamp < cacheTTL);
  });
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const fetchData = useCallback(async () => {
    if (!endpoint) return;

    // Check cache first
    const cached = cache.get(endpoint);
    if (cached && Date.now() - cached.timestamp < cacheTTL) {
      setData(cached.data);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: responseData } = await api.get(endpoint);
      const transformed = transform(responseData);

      if (mountedRef.current) {
        setData(transformed);
        setLoading(false);
        cache.set(endpoint, { data: transformed, timestamp: Date.now() });
      }
    } catch (err) {
      console.error(`[useApiWidget] ${endpoint} failed:`, err);
      if (mountedRef.current) {
        setError(err.response?.data?.message || err.message || 'Something went wrong');
        setLoading(false);
        if (fallback !== null) setData(fallback);
      }
    }
  }, [endpoint, cacheTTL, fallback, transform]);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (enabled) fetchData();
  }, [enabled, fetchData]);

  const retry = useCallback(() => {
    // Clear cache and re-fetch
    cache.delete(endpoint);
    fetchData();
  }, [endpoint, fetchData]);

  return {
    data,
    loading,
    error,
    retry,
    isEmpty: isEmptyCheck(data),
  };
}
