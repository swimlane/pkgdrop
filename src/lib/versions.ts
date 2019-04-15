import * as npa from 'npm-package-arg';
import { satisfies, gt, major } from 'semver';

import { Imports } from './importmaps';

export function expandLocalVersion(pkg: string, imports: Imports): string {
  const parsed = npa(pkg);

  switch (parsed.type) {
    case 'version':
      return parsed.raw;
    case 'range':
      const range = parsed.saveSpec || parsed.fetchSpec || parsed.spec;
      for (const k in imports) {
        const spec = npa(k);
        if (spec.type === 'version' && spec.name === parsed.name) {
          if (satisfies(spec.saveSpec || spec.fetchSpec || spec.spec, range)) return k;
        }
      }
      return undefined;
    case 'tag':
      const parsedTag = parsed.saveSpec || parsed.fetchSpec || parsed.spec;
      if (parsedTag !== 'latest') return undefined;
      let version = null;
      for (const k in imports) {
        const spec = npa(k);
        if (spec.type === 'version' && spec.name === parsed.name) {
          if (!version || gt(spec, version)) version = (spec.saveSpec || spec.fetchSpec || spec.spec);
        }
      }
      return `${parsed.name}@${version}`;
  }

  return undefined;
}

// Check if installed version is latest matching major version,
// if so, add major version to the import map
export function addMajorVersions(imports: Imports) {
  imports = Object.assign({}, imports);

  for (const pkgId in imports) {
    const spec = npa(pkgId);
    if (spec.type === 'version') {
      const m = major(spec.saveSpec || spec.fetchSpec || spec.spec);
      const majorPkgId = `${spec.name}@${m}`;
      const expanedMajor = expandLocalVersion(majorPkgId, imports);
      if (pkgId === expanedMajor) {
        imports[majorPkgId] = imports[pkgId];
        imports[majorPkgId + '/'] = imports[pkgId + '/'];
      }
    }
  }

  return imports;
}