import * as npa from 'npm-package-arg';
import { maxVersion, major, maxSatisfying } from 'semver';

import { Imports } from './importmaps';

function getVersions(name: string, imports: Imports) {
  const versions = [];
  for (const k in imports) {
    const spec = npa(k);
    if (spec.type === 'version' && spec.name === name) {
      versions.push(spec.saveSpec || spec.fetchSpec || spec.spec);
    }
  }
  return versions;
}

export function expandLocalVersion(pkg: string, imports: Imports): string {
  const parsed = npa(pkg);

  switch (parsed.type) {
    case 'version':
      return parsed.raw;
    case 'tag': {
      const range = parsed.saveSpec || parsed.fetchSpec || parsed.spec;
      if (range !== 'latest') return undefined;
      const versions = getVersions(parsed.name, imports);
      const max = maxVersion(versions);
      return max === null ? undefined : `${parsed.name}@${max}`;
    }
    case 'range': {
      const range = parsed.saveSpec || parsed.fetchSpec || parsed.spec;
      const versions = getVersions(parsed.name, imports);
      const max = maxSatisfying(versions, range);
      return max === null ? undefined : `${parsed.name}@${max}`;     
    }
  }

  return undefined;
}

// Get Import map of latest major versions for each package in an import map.
export function getMajorVersions(imports: Imports) {
  const majorVersionsMap: Imports = {};
  imports = Object.assign({}, imports);

  for (const pkgId in imports) {
    const spec = npa(pkgId);
    if (spec.type === 'version') {
      const range = major(spec.saveSpec || spec.fetchSpec || spec.spec);
      const versions = getVersions(spec.name, imports);
      const max = maxSatisfying(versions, `^${range}`);
      const majorPkgId = `${spec.name}@${range}`;
      const latestPkgId = `${spec.name}@${max}`;
      majorVersionsMap[majorPkgId] = imports[latestPkgId];
      majorVersionsMap[majorPkgId + '/'] = imports[latestPkgId + '/'];
    }
  }

  return majorVersionsMap;
}