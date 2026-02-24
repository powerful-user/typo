import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { dirname } from 'node:path';

export async function ensureDir(dirPath: string): Promise<void> {
  await mkdir(dirPath, { recursive: true });
}

export async function atomicWrite(filePath: string, data: string): Promise<void> {
  await ensureDir(dirname(filePath));
  await writeFile(filePath, data, 'utf-8');
}

export async function readJson<T>(filePath: string): Promise<T | null> {
  try {
    const content = await readFile(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

export async function writeJson(filePath: string, data: unknown): Promise<void> {
  await atomicWrite(filePath, JSON.stringify(data, null, 2) + '\n');
}
