// Public API exports
export type { GlobalConfig, ProjectConfig, ProjectFont, FrameworkId } from './types/config.js';
export type { Manifest, ManifestEntry, FontFileEntry, FontSource } from './types/manifest.js';
export type { FontMetadata, DiscoveredFont } from './types/font.js';

export { readGlobalConfig, writeGlobalConfig, createDefaultGlobalConfig } from './config/global.js';
export { readProjectConfig, writeProjectConfig, createDefaultProjectConfig } from './config/project.js';
export { readManifest, writeManifest, getManifestEntry, setManifestEntry, listManifestEntries } from './config/manifest.js';
export * from './config/paths.js';

export { detectFramework } from './detect/framework.js';
export { readFontMetadata } from './fonts/metadata.js';
export { isFontFile, getFormat, FONT_EXTENSIONS } from './fonts/formats.js';
export { createGenerator, createGeneratorForFramework } from './generators/index.js';
