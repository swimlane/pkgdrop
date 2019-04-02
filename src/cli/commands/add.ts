import { GluegunToolbox } from 'gluegun';
import { manifest, extract } from 'pacote';
import { get } from 'http';
import { stringify } from 'querystring';
import { join } from 'path';

import * as createGraph from 'ngraph.graph';
import * as buildGraph from 'npmgraphbuilder';

import * as cosmiconfig from 'cosmiconfig'

export default {
  name: 'add',
  alias: ['a'],
  description: 'Adds a new package',
  hidden: false,
  dashed: false,
  run: async (toolbox: GluegunToolbox) => {
    const { parameters, print, config: { loadConfig, airdrop }, filesystem, runtime: { brand } } = toolbox;

    const config = {
      ...airdrop,
      ...loadConfig(brand, filesystem.cwd())
    };

    const packages = parameters.string.split(' ');

    const importmapPath = filesystem.path(config.package_path, 'importmap.json');

    print.info(`Reading existing importmap from${importmapPath}`);
    let importmap = await filesystem.readAsync(importmapPath, 'json');

    if (!importmap) {
      importmap = {
        imports: {},
        scopes: {}
      };
    }

    const graphBuilder = buildGraph(httpClient, 'http://registry.npmjs.org/');

    // TODO: Load existing import map
    const imports = {};
    const scopes = {};

    const addScopes = packages.map(async (pkg) => {
      print.info(`Fetching package information for ${pkg}`);

      // TODO: Cache these calls?
      const pkgInfo = await manifest(pkg, {
        'full-metadata': true
      });

      const pkgId = `${pkgInfo.name}@${pkgInfo.version}`;
      const entryPoint = pkgInfo.module || pkgInfo.main || 'index.js';
      const outputPath = join(config.package_root, pkgId, entryPoint);

      imports[pkgId] = outputPath;

      print.info(`Fetching dependecy tree for ${pkgId}`);

      const graph = await graphBuilder.createNpmDependenciesGraph(pkgInfo.name, (createGraph as any)(), pkgInfo.version);

      graph.forEachNode((n: any) => {
        scopes[n.id] = {};
        graph.forEachLinkedNode(n.id, (l: any, link: any) => {
          if (link.fromId === n.id) {
            const name = l.data.name;
            const entryPoint = l.data.module || l.data.main || 'index.js';

            // Re rely on the less generic version first... TODO: fix this
            scopes[n.id][name + '/'] = join(config.package_root, link.toId, '/');
            scopes[n.id][name] = join(config.package_root, link.toId, entryPoint);
          }
        });
      });
    });

    await Promise.all(addScopes);

    const extractPackages = Object.keys(scopes).map((pkg: string) => {
      // TODO: Skip this for packages that already exist (with --force option)
      const packagePath = filesystem.path(config.package_path, pkg);
      print.info(`Extracting tarball for ${pkg} to ${packagePath}`);
      return extract(pkg, packagePath);
    });

    await Promise.all(extractPackages);

    const map = {
      imports: {
        ...importmap.imports,
        ...imports
      },
      scopes: {
        ...importmap.scopes,
        ...scopes
      }
    };

    print.info(`Writing importmap to ${importmapPath}`);
    await filesystem.writeAsync(importmapPath, map);
  }
};

function httpClient(url: string, data: string) {
  return new Promise((resolve, reject) => {
    get(url + '?' + stringify(data), function (res) {
      var body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        body += chunk;
      }).on('end', () => {
        resolve({ data: JSON.parse(body) });
      }).on('error', reject);
    });
  });
}
