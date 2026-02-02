import { useState, useEffect, useCallback } from 'react';
import { loadCSV, CSVRow } from '@/lib/csvParser';
import { csvToSwimlanes } from '@/lib/csvToSwimlane';
import { Swimlane } from '@/lib/data';
import { demoSwimlanes } from '@/lib/demoData';
import logger from '@/lib/logger';

interface UseRoadmapDataResult {
  data: Swimlane[];
  csvData: CSVRow[];
  loading: boolean;
  error: string | null;
  lastModified: Date | null;
  reload: () => void;
  setData: (data: Swimlane[]) => void;
  isDemo: boolean;
}

/**
 * Error messages with helpful context for users
 */
const getErrorMessage = (error: any, csvPath: string): string => {
  const errorStr = error?.message || String(error);

  // Network errors
  if (errorStr.includes('Failed to fetch') || errorStr.includes('NetworkError')) {
    return `Could not connect to load the roadmap data. Please check your internet connection and try again.`;
  }

  // 404 errors
  if (errorStr.includes('404') || errorStr.includes('Not Found')) {
    return `CSV file not found at "${csvPath}". Make sure the file exists in the public folder.`;
  }

  // CORS errors
  if (errorStr.includes('CORS') || errorStr.includes('cross-origin')) {
    return `Access blocked due to security restrictions. The CSV file must be hosted on the same domain or have CORS enabled.`;
  }

  // Parse errors
  if (errorStr.includes('parse') || errorStr.includes('Parse')) {
    return `The CSV file format is invalid. Please check that the file uses the correct column headers and formatting.`;
  }

  // Generic error with original message
  return `Failed to load roadmap data: ${errorStr}`;
};

/**
 * Custom hook for loading and managing roadmap data
 *
 * Features:
 * - Loads CSV from configurable path
 * - Falls back to demo data if loading fails
 * - Provides helpful error messages
 * - Supports reload functionality
 */
export function useRoadmapData(csvPath?: string): UseRoadmapDataResult {
  // Use environment variable or prop or default path
  const resolvedPath = csvPath ||
    import.meta.env.VITE_CSV_URL ||
    `${import.meta.env.BASE_URL}sample-roadmap-data.csv`;

  const [data, setData] = useState<Swimlane[]>([]);
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastModified, setLastModified] = useState<Date | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIsDemo(false);

    try {
      logger.log('Loading CSV from:', resolvedPath);

      const result = await loadCSV(resolvedPath);

      logger.log('CSV loaded:', {
        rows: result.data.length,
        errors: result.errors.length,
        lastModified: result.lastModified,
      });

      if (result.errors.length > 0) {
        logger.warn('CSV parsing/validation errors:', result.errors);

        if (result.data.length === 0) {
          throw new Error(`Failed to parse CSV: ${result.errors[0].message}`);
        }
      }

      // Store raw CSV data
      setCsvData(result.data);

      // Convert to swimlane format
      const swimlanes = csvToSwimlanes(result.data);
      logger.log('Swimlanes created:', swimlanes.length, swimlanes.map(s => ({
        id: s.id,
        title: s.title,
        itemCount: s.items.length
      })));

      setData(swimlanes);
      setLastModified(result.lastModified);
      setError(null);
    } catch (err: any) {
      logger.error('Error loading roadmap data:', err);

      const friendlyError = getErrorMessage(err, resolvedPath);
      setError(friendlyError);

      // Fall back to demo data
      logger.log('Falling back to demo data');
      setData(demoSwimlanes);
      setCsvData([]);
      setIsDemo(true);
      setLastModified(new Date());
    } finally {
      setLoading(false);
    }
  }, [resolvedPath]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const reload = useCallback(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    csvData,
    loading,
    error,
    lastModified,
    reload,
    setData,
    isDemo,
  };
}
