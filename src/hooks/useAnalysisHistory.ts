import { useState, useEffect } from 'react';
import type { AnalysisHistory, AnalysisRecord } from '@/lib/data';

const BASE_URL = import.meta.env.BASE_URL || '/';

export function useAnalysisHistory() {
  const [history, setHistory] = useState<AnalysisHistory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${BASE_URL}data/analysis-history.json`);
        if (res.ok) {
          const data = await res.json();
          setHistory(data);
        }
      } catch {
        // Optional data
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const latestRun: AnalysisRecord | null = history?.runs?.length
    ? history.runs[history.runs.length - 1]
    : null;

  return { history, latestRun, loading };
}
