import { GluegunToolbox } from 'gluegun';
import * as pacote from 'pacote';
import * as http from 'http';
import * as querystring from 'querystring';
import * as q from 'q';
import { join } from 'path';

import * as createGraph from 'ngraph.graph';
import * as buildGraph from 'npmgraphbuilder';

export default {
  name: 'add',
  alias: ['a'],
  description: 'Adds a new package',
  hidden: false,
  dashed: false,
  run: async (toolbox: GluegunToolbox) => {
    const { parameters, print, config, filesystem } = toolbox;

    const packages = parameters.string.split(' ');

    const importmapPath = filesystem.path(config.package_path, 'importmap.json');
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

    while (packages.length > 0) {
      const pkg = packages.shift();

      print.info(`Fetching package information for ${pkg}`);
      const pkgInfo = await pacote.manifest(pkg, {
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
    }

    const dependecies = Object.keys(scopes);

    while (dependecies.length > 0) {
      const pkg = dependecies.shift();
      const packagePath = filesystem.path(config.package_path, pkg);
      print.info(`Extracting tarball for ${pkg} to ${packagePath}`);
      await pacote.extract(pkg, packagePath);
    }

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

    print.info(`Writing importmap`);
    await filesystem.writeAsync(importmapPath, map);
  }
};

function httpClient(url: string, data: string) {
  var defer = q.defer();
  http.get(url + '?' + querystring.stringify(data), function (res) {
    var body = '';
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      body += chunk;
    }).on('end', function () {
      defer.resolve({ data: JSON.parse(body) });
    });
  });

  return defer.promise;
}
