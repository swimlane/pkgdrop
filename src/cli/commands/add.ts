import { GluegunToolbox } from 'gluegun';
import { manifest, extract } from 'pacote';
import { get } from 'http';
import { stringify } from 'querystring';
import { join } from 'path';
import * as createGraph from 'ngraph.graph';
import * as buildGraph from 'npmgraphbuilder';

import {
  AirdropOptions, PackageInfo, Scopes, Imports, ImportMap,
  readImportmap, writeImportmap
} from '../../utils/';

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
  run: async (toolbox: GluegunToolbox) => {
    const { parameters, print, config: { airdrop }, filesystem, timer } = toolbox;
    const time = timer.start();

    const config: AirdropOptions = airdrop;

    const packages = parameters.array.filter(Boolean);

    print.info(`Reading existing importmap`);
    const importmap = await readImportmap(config);

    const { createNpmDependenciesGraph } = buildGraph(httpClient, 'http://registry.npmjs.org/');

    const imports: Imports = {};
    const scopes: Scopes = {};

    const addScopes = packages.map(async (pkg) => {
      print.info(`Fetching package information for ${pkg}`);

      const pkgInfo: PackageInfo = await manifest(pkg, {
        'full-metadata': true
      });

      const pkgId = `${pkgInfo.name}@${pkgInfo.version}`;

      if (!config.force && importmap.imports[pkgId]) {
        print.warning(`Package ${pkgId} already exists, skipping`);
        return;
      }

      const entryPoint = pkgInfo.module || pkgInfo.main || 'index.js';
      const outputPath = join(config.package_root, pkgId, entryPoint);

      imports[pkgId] = outputPath;

      print.info(`Fetching dependecy tree for ${pkgId}`);

      const graph = await createNpmDependenciesGraph(pkgInfo.name, (createGraph as any)(), pkgInfo.version);

      graph.forEachNode((n: PackageNode) => {
        if (!config.force && importmap.scopes[n.id]) {
          print.warning(`Scopes for ${n.id} already exists, skipping`);
          return;
        }

        scopes[n.id] = {};

        graph.forEachLinkedNode(n.id, (linkedNode: PackageNode, link: PackageLink) => {
          if (link.fromId === n.id) {
            const name = linkedNode.data.name;
            const ep = linkedNode.data.module || linkedNode.data.main || 'index.js';

            scopes[n.id][name] = join(config.package_root, link.toId, ep);
            scopes[n.id][name + '/'] = join(config.package_root, link.toId, '/');
          }
        });
      });
    });

    await Promise.all(addScopes);

    const extractPackages = Object.keys(scopes).map(async (pkg: string): Promise<void> => {
      const packagePath = filesystem.path(config.package_path, pkg);

      print.info(`Extracting tarball for ${pkg} to ${packagePath}`);
      return extract(pkg, packagePath);
    });

    await Promise.all(extractPackages);

    const map: ImportMap = {
      imports: {
        ...importmap.imports,
        ...imports
      },
      scopes: {
        ...importmap.scopes,
        ...scopes
      }
    };

    print.success(`Writing importmap`);
    await writeImportmap(map, config);

    time.done();
  }
};

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
