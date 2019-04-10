import { Imports } from './importmaps';

export function createResolver(scope: Imports) {
  const paths = Object.keys(scope).sort((a, b) => b.length - a.length);
  return function resolveId(id: string) {
    for (const s of paths) {
      if (id.startsWith(s)) {
        return id.replace(s, scope[s]);
      }
    }
  }
}