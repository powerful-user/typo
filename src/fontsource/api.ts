import { httpGet } from '../utils/http.js';
import type { FontsourceFont, FontsourceFontDetail } from './types.js';

const API_BASE = 'https://api.fontsource.org/v1';

export async function listAllFonts(): Promise<FontsourceFont[]> {
  return httpGet<FontsourceFont[]>(`${API_BASE}/fonts`);
}

export async function getFontDetail(id: string): Promise<FontsourceFontDetail> {
  return httpGet<FontsourceFontDetail>(`${API_BASE}/fonts/${id}`);
}

export async function searchFontsAPI(query: string): Promise<FontsourceFont[]> {
  const fonts = await listAllFonts();
  const q = query.toLowerCase();
  return fonts.filter(f =>
    f.family.toLowerCase().includes(q) ||
    f.id.toLowerCase().includes(q)
  );
}
