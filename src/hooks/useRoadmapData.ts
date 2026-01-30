import { useState, useEffect } from 'react';
import { loadCSV, CSVRow } from '@/lib/csvParser';
import { csvToSwimlanes } from '@/lib/csvToSwimlane';
import { Swimlane } from '@/lib/data';

interface UseRoadmapDataResult {
  data: Swimlane[];
  csvData: CSVRow[];
  loading: boolean;
  error: string | null;
  lastModified: Date | null;
  reload: () => void;
  setData: (data: Swimlane[]) => void;
}

/**
 * Custom hook for loading and managing roadmap data
 */
export function useRoadmapData(csvPath: string = './sample-roadmap-data.csv'): UseRoadmapDataResult {
  const [data, setData] = useState<Swimlane[]>([]);
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastModified, setLastModified] = useState<Date | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Loading CSV from:', csvPath);

      const result = await loadCSV(csvPath);

      console.log('CSV loaded:', {
        rows: result.data.length,
        errors: result.errors.length,
        lastModified: result.lastModified,
      });

      if (result.errors.length > 0) {
        console.warn('CSV parsing/validation errors:', result.errors);

        if (result.data.length === 0) {
          throw new Error(`Failed to parse CSV: ${result.errors[0].message}`);
        }
      }

      // Store raw CSV data
      setCsvData(result.data);

      // Convert to swimlane format
      const swimlanes = csvToSwimlanes(result.data);
      setData(swimlanes);

      setLastModified(result.lastModified);
      setError(null);
    } catch (err: any) {
      console.error('Error loading roadmap data:', err);
      setError(err.message || 'Failed to load roadmap data');
      setData([]);
      setCsvData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [csvPath]);

  const reload = () => {
    loadData();
  };

  return {
    data,
    csvData,
    loading,
    error,
    lastModified,
    reload,
    setData,
  };
}
