/// <reference path="index.d.ts" />

import * as createGraph from 'ngraph.graph';
import * as buildGraph from 'npmgraphbuilder';
import { manifest } from 'pacote';
import { stringify } from 'querystring';
import { join } from 'path';
import { get } from 'http';
import * as semver from 'semver';

import { print } from 'gluegun'; 

import { expandLocalVersion } from '../../lib/versions';

interface PackageNode {
  id: string;
  data: PackageInfo;
}

interface PackageLink {
  fromId: string;
  toId: string;
}

import { PackageInfo, Scopes, Imports, ImportMap, AirdropOptions } from '../../lib/';

export async function getMap(packages: string[], importmap: ImportMap, options: AirdropOptions) {
  const { createNpmDependenciesGraph } = buildGraph(httpClient, 'http://registry.npmjs.org/');

  const imports: Imports = {};
  const scopes: Scopes = {};

  const addScopes = packages.map(async (pkg) => {
    print.info(`Fetching package information for ${pkg}`);

    let pkgInfo: PackageInfo;
    try {
      pkgInfo = await manifest(pkg, {
        'full-metadata': true
      });      
    } catch (e) {
      print.warning(`Package ${pkg} not found, skipping`);
      return;
    }

    const pkgId = `${pkgInfo.name}@${pkgInfo.version}`;

    if (!options.force && importmap.imports[pkgId]) {
      print.warning(`Package ${pkgId} already exists, skipping`);
      return;
    }

    const entryPoint = pkgInfo.module || pkgInfo.main || 'index.js';
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

      scopes[n.id] = {};

      graph.forEachLinkedNode(n.id, (linkedNode: PackageNode, link: PackageLink) => {
        if (link.fromId === n.id) {
          const name = linkedNode.data.name;
          const ep = linkedNode.data.module || linkedNode.data.main || 'index.js';

          scopes[n.id][name] = join(options.package_root, link.toId, ep);
          scopes[n.id][name + '/'] = join(options.package_root, link.toId, '/');
        }
      });
    });
  });

  await Promise.all(addScopes);

  return {
    imports,
    scopes
  }
}

function httpClient(url: string, data: string) {
  return new Promise((resolve, reject) => {
    get(url + '?' + stringify(data), function (res) {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        body += chunk;
      }).on('end', () => {
        resolve({ data: JSON.parse(body) });
      }).on('error', reject);
    });
  });
}