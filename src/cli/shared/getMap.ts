/// <reference path="index.d.ts" />

import * as createGraph from 'ngraph.graph';
import * as buildGraph from 'npmgraphbuilder';
import { manifest, packument } from 'pacote';
import { join } from 'path';
import { read } from 'libnpmconfig';
import { expandLocalVersion } from '../../lib';

import { print } from 'gluegun'; 

interface PackageNode {
  id: string;
  data: PackageInfo;
}

interface PackageLink {
  fromId: string;
  toId: string;
}

import { PackageInfo, Scopes, Imports, ImportMap, PkgdropOptions } from '../../lib/';

export async function getMap(packages: string[], importmap: ImportMap, options: PkgdropOptions): Promise<ImportMap> {
  const registry = 'http://registry.npmjs.org/';
  const npmconfig = read().concat({
    fullMetadata: true,
    cache: false
  });
  
  const { createNpmDependenciesGraph } = buildGraph(httpClient, registry);

  const imports: Imports = {};
  const scopes: Scopes = {};

  const peers = new Map<string, Set<string>>();

  // await clearMemoized();

  const addScopes = packages.map(async (pkg) => {
    print.info(`Fetching package information for ${pkg}`);

    let pkgInfo: PackageInfo;
    try {
      pkgInfo = await manifest(pkg, npmconfig);
    } catch (e) {
      if (options.force) {
        print.warning(`Package ${pkg} not found, skipping`);
        return;
      }
      throw new Error(`Package ${pkg} not found\n\tpackage may be private\n\tuse --force to skip missing packages`);
    }

    const pkgId = `${pkgInfo.name}@${pkgInfo.version}`;

    if (!options.force && importmap.imports[pkgId]) {
      print.warning(`Package ${pkgId} already exists, skipping`);
      return;
    }

    const entryPoint = /* istanbul ignore next */ pkgInfo.module || pkgInfo.main || 'index.js';
    const outputPath = join(options.package_root, pkgId, '/');
    const entryPath = join(outputPath, entryPoint);

    imports[pkgId] = entryPath;
    imports[pkgId + '/'] = outputPath;

    print.info(`Fetching dependecy tree for ${pkgId}`);

    const graph = await createNpmDependenciesGraph(pkgInfo.name, (createGraph as any)(), pkgInfo.version);

    graph.forEachNode((n: PackageNode) => {
      if (!options.force && importmap.scopes[n.id]) {
        print.warning(`Scopes for ${n.id} already exists, skipping`);
        return;
      }

      if (n.data.peerDependencies) {
        const peerSet = new Set<string>([]);
        for (const k in n.data.peerDependencies) {
          peerSet.add(`${k}@${n.data.peerDependencies[k]}`)
        }
        peers.set(pkgId, peerSet);
      }

      scopes[n.id] = {};

      graph.forEachLinkedNode(n.id, (linkedNode: PackageNode, link: PackageLink) => {
        if (link.fromId === n.id) {
          const name = linkedNode.data.name;
          const ep = /* istanbul ignore next */ linkedNode.data.module || linkedNode.data.main || 'index.js';

          scopes[n.id][name] = join(options.package_root, link.toId, ep);
          scopes[n.id][name + '/'] = join(options.package_root, link.toId, '/');
        }
      });
    });
  });

  await Promise.all(addScopes);

  peers.forEach((peerSet,pkg) => {
    peerSet.forEach((peer: string) => {
      const e = expandLocalVersion(peer, imports);
      if (!e) {
        print.warning(`${pkg} requires a peer of ${peer} but none is installed. You must pkgdrop peer dependencies yourself.`);
      }
    });
  });

  return {
    imports,
    scopes
  }

  function httpClient(url: string, data: string) {
    url = url.replace(registry, '').replace('?', '').replace('%2f', '/');
    return packument(url, npmconfig)
      .then((d: any) => {
        Object.keys(d.versions).forEach(k => {
          const v = d.versions[k];
          v._id = v._id /* istanbul ignore next */ || `${v.name}@${v.version}`;  // For some reason this is missing on private packages.
        });
        return { data: d };
      });
  }
}
