import * as jetpack from 'fs-jetpack';

export interface Imports {
  [key: string]: string;
}

export interface Scopes {
  [key: string]: Imports;
}

export interface ImportMap {
  imports: Imports;
  scopes: Scopes;
}

export async function readImportmap(options: { package_path: string }): Promise<ImportMap> {
  const importmapPath = jetpack.path(options.package_path, 'importmap.json');
  const importmap = (await jetpack.readAsync(importmapPath, 'json')) || {};

  importmap.imports = importmap.imports || {};
  importmap.scopes = importmap.scopes || {};

  return importmap;
}

export async function writeImportmap(map: ImportMap, options: { package_path: string }): Promise<void> {
  const importmapPath = jetpack.path(options.package_path, 'importmap.json');
  await jetpack.writeAsync(importmapPath, map);
}

export function mergeImportmaps(...maps: ImportMap[]) {
  const imports = Object.assign({}, ...maps.map(m => m.imports));
  const scopes = Object.assign({}, ...maps.map(m => m.scopes));
  return {
    imports,
    scopes
  }
}