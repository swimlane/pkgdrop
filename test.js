(async function () {
const Resolver = require('resolve-npm-dependency-graph');
const Loader = require('resolve-npm-dependency-graph/dist/npmLoader');
const Optimizer = require('resolve-npm-dependency-graph/dist/optimizer');

const packageMetadataLoader = Loader.createLoader();
const client = new Resolver.Client({ packageMetadataLoader });

// Load the dependency graph of npm@5 and hapi@17
const npmPkg = await client.load('npm@5');
const hapiPkg = await client.load('hapi@17');

// Now flatten the dependency graphs of these two modules into an optimized,
// deduplicated tree
const root = Optimizer.flatten([npmPkg, hapiPkg]);

console.log(root);
})();