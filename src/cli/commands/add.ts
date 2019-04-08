import { manifest, extract } from 'pacote';
import { get } from 'http';
import { stringify } from 'querystring';
import { join } from 'path';
import * as createGraph from 'ngraph.graph';
import * as buildGraph from 'npmgraphbuilder';

import {
  PackageInfo, Scopes, Imports, ImportMap,
  readImportmap, writeImportmap
} from '../../lib/';
import { AirdropToolbox } from '../extensions/load-location-config';

interface PackageNode {
  id: string;
  data: PackageInfo;
}

interface PackageLink {
  fromId: string;
  toId: string;
}

export default {
  name: 'add',
  alias: ['a'],
  description: 'Adds a new package',
  hidden: false,
  dashed: false,
  run: async (toolbox: AirdropToolbox) => {
    const { parameters, print, airdrop, filesystem, timer } = toolbox;
    const time = timer.start();

    const packages = parameters.array.filter(Boolean);

    print.info(`Reading existing importmap`);
    const importmap = await readImportmap(airdrop);

    const _importMap = await addPackages(packages, importmap, toolbox);

    const map: ImportMap = {
      imports: {
        ...importmap.imports,
        ..._importMap.imports
      },
      scopes: {
        ...importmap.scopes,
        ..._importMap.scopes
      }
    };

    print.success(`Writing importmap`);
    await writeImportmap(map, airdrop);

    time.done();
  }
};

export async function addPackages(packages: string[], importmap: ImportMap, toolbox: AirdropToolbox) {
  const { print, airdrop, filesystem } = toolbox;

  const { createNpmDependenciesGraph } = buildGraph(httpClient, 'http://registry.npmjs.org/');

  const imports: Imports = {};
  const scopes: Scopes = {};

  const addScopes = packages.map(async (pkg) => {
    print.info(`Fetching package information for ${pkg}`);

    const pkgInfo: PackageInfo = await manifest(pkg, {
      'full-metadata': true
    });

    const pkgId = `${pkgInfo.name}@${pkgInfo.version}`;

    if (!airdrop.force && importmap.imports[pkgId]) {
      print.warning(`Package ${pkgId} already exists, skipping`);
      return;
    }

    const entryPoint = pkgInfo.module || pkgInfo.main || 'index.js';
    const outputPath = join(airdrop.package_root, pkgId, '/');
    const entryPath = join(outputPath, entryPoint);

    imports[pkgId] = entryPath;
    imports[pkgId + '/'] = outputPath;

    print.info(`Fetching dependecy tree for ${pkgId}`);

    const graph = await createNpmDependenciesGraph(pkgInfo.name, (createGraph as any)(), pkgInfo.version);

    graph.forEachNode((n: PackageNode) => {
      if (!airdrop.force && importmap.scopes[n.id]) {
        print.warning(`Scopes for ${n.id} already exists, skipping`);
        return;
      }

      scopes[n.id] = {};

      graph.forEachLinkedNode(n.id, (linkedNode: PackageNode, link: PackageLink) => {
        if (link.fromId === n.id) {
          const name = linkedNode.data.name;
          const ep = linkedNode.data.module || linkedNode.data.main || 'index.js';

          scopes[n.id][name] = join(airdrop.package_root, link.toId, ep);
          scopes[n.id][name + '/'] = join(airdrop.package_root, link.toId, '/');
        }
      });
    });
  });

  await Promise.all(addScopes);

  const extractPackages = Object.keys(scopes).map(async (pkg: string): Promise<void> => {
    const packagePath = filesystem.path(airdrop.package_path, pkg);

    print.info(`Extracting tarball for ${pkg} to ${packagePath}`);
    return extract(pkg, packagePath);
  });

  await Promise.all(extractPackages);

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
