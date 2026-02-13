import { useState, useEffect } from 'react';
import type { KpiData } from '@/lib/data';

const BASE_URL = import.meta.env.BASE_URL || '/';

export function useKpiData() {
  const [kpiData, setKpiData] = useState<KpiData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${BASE_URL}data/kpis.json`);
        if (res.ok) {
          const data = await res.json();
          setKpiData(data);
        }
      } catch {
        // KPI data is optional — dashboard works without it
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const latest = kpiData?.history?.length
    ? kpiData.history[kpiData.history.length - 1]
    : null;

  return { kpiData, latest, loading };
}
