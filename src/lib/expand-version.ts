import * as npa from 'npm-package-arg';
import { satisfies, gt } from 'semver';

import { Imports } from './importmaps';

export async function expandLocalVersion(pkg: string, imports: Imports): Promise<string> {
  const parsed = npa(pkg);

  switch (parsed.type) {
    case 'version':
      return parsed.raw;
    case 'range':
      const range = parsed.saveSpec || parsed.fetchSpec;
      for (const k in imports) {
        const spec = npa(k);
        if (spec.type === 'version' && spec.name === parsed.name) {
          if (satisfies(spec.saveSpec || spec.fetchSpec, range)) return k;
        }
      }
      return undefined;
    case 'tag':
      const parsedTag = parsed.saveSpec || parsed.fetchSpec;
      if (parsedTag !== 'latest') return undefined;
      let version = null;
      for (const k in imports) {
        const spec = npa(k);
        if (spec.type === 'version' && spec.name === parsed.name) {
          if (!version || gt(spec, version)) version = spec.fetchSpec;
        }
      }
      return `${parsed.name}@${version}`;
  }

  return undefined;
}