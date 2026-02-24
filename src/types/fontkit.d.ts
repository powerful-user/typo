declare module 'fontkit' {
  interface Font {
    familyName: string;
    unitsPerEm: number;
    ascent: number;
    descent: number;
    numGlyphs: number;
    variationAxes?: Record<string, {
      name: string;
      min: number;
      max: number;
      default: number;
    }>;
    'OS/2'?: {
      usWeightClass?: number;
    };
  }

  export function create(buffer: Buffer): Font;
  export function open(path: string): Promise<Font>;
  export function openSync(path: string): Font;
  export const defaultLanguage: string;
  export const logErrors: boolean;
  export function registerFormat(format: unknown): void;
  export function setDefaultLanguage(lang: string): void;
}
