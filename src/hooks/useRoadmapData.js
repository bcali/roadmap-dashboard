import { useState, useEffect } from 'react';
import { loadCSV } from '../utils/csvParser';
import { buildHierarchy, calculateProgress } from '../utils/dataTransforms';

/**
 * Custom hook for loading and managing roadmap data
 * @param {string} csvPath - Path to CSV file
 * @returns {Object} - { data, loading, error, lastModified, reload }
 */
export function useRoadmapData(csvPath = './sample-roadmap-data.csv') {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastModified, setLastModified] = useState(null);

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

      // Check for critical errors
      if (result.errors.length > 0) {
        console.warn('CSV parsing/validation errors:', result.errors);

        // Only fail if we have no data at all
        if (result.data.length === 0) {
          throw new Error(`Failed to parse CSV: ${result.errors[0].message}`);
        }
      }

      // Calculate progress for all items
      const dataWithProgress = result.data.map(item => ({
        ...item,
        progress: calculateProgress(item, result.data),
      }));

      setData(dataWithProgress);
      setLastModified(result.lastModified);
      setError(null);
    } catch (err) {
      console.error('Error loading roadmap data:', err);
      setError(err.message || 'Failed to load roadmap data');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [csvPath]);

  // Reload function for manual refresh
  const reload = () => {
    loadData();
  };

  return {
    data,
    loading,
    error,
    lastModified,
    reload,
  };
}

/**
 * Hook for building hierarchical structure from flat data
 * @param {Array} flatData - Flat array of tasks
 * @returns {Array} - Hierarchical tree
 */
export function useHierarchy(flatData) {
  const [hierarchy, setHierarchy] = useState([]);

  useEffect(() => {
    if (flatData && flatData.length > 0) {
      const tree = buildHierarchy(flatData);
      setHierarchy(tree);
    } else {
      setHierarchy([]);
    }
  }, [flatData]);

  return hierarchy;
}
