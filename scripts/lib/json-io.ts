import { readFile, writeFile, mkdir } from 'fs/promises';
import { dirname } from 'path';
import type {
  RoadmapData,
  KpiData,
  AnalysisHistory,
  InputIndex,
} from './types.js';

/**
 * Read a JSON file with type safety. Returns null if file doesn't exist.
 */
async function readJson<T>(filePath: string): Promise<T | null> {
  try {
    const text = await readFile(filePath, 'utf-8');
    return JSON.parse(text) as T;
  } catch (err: any) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
}

/**
 * Write a JSON file with pretty formatting.
 */
async function writeJson<T>(filePath: string, data: T): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

// ============================================================
// Typed readers/writers
// ============================================================

export async function loadRoadmapJson(filePath: string): Promise<RoadmapData | null> {
  return readJson<RoadmapData>(filePath);
}

export async function saveRoadmapJson(filePath: string, data: RoadmapData): Promise<void> {
  return writeJson(filePath, data);
}

export async function loadKpiData(filePath: string): Promise<KpiData | null> {
  return readJson<KpiData>(filePath);
}

export async function saveKpiData(filePath: string, data: KpiData): Promise<void> {
  return writeJson(filePath, data);
}

export async function loadAnalysisHistory(filePath: string): Promise<AnalysisHistory | null> {
  return readJson<AnalysisHistory>(filePath);
}

export async function saveAnalysisHistory(filePath: string, data: AnalysisHistory): Promise<void> {
  return writeJson(filePath, data);
}

export async function loadInputIndex(filePath: string): Promise<InputIndex | null> {
  return readJson<InputIndex>(filePath);
}

export async function saveInputIndex(filePath: string, data: InputIndex): Promise<void> {
  return writeJson(filePath, data);
}
