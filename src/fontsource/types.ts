export interface FontsourceFont {
  id: string;
  family: string;
  subsets: string[];
  weights: number[];
  styles: string[];
  defSubset: string;
  variable: boolean;
  lastModified: string;
  category: string;
  license: string;
  type: string;
}

export interface FontsourceFontDetail extends FontsourceFont {
  variants: Record<string, Record<string, Record<string, FontsourceVariant>>>;
  // variants[style][weight][subset] = variant
}

export interface FontsourceVariant {
  url: {
    woff2?: string;
    woff?: string;
    ttf?: string;
  };
}
