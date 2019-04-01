<p align="center">
  <img src="./public/airdrop.png" width="200" alt="airdrop Logo" />
</p>

# airdrop

airdrop is a self-hosted native ES modules content delivery server for JavaScript packages from [npm](https://www.npmjs.com/).
Use it to load files from downloaded npm packages using the native browser ES module loader with no connection to npm needed at runtime:

```html
<script type="module">
  import { html, render } from '/-/lit-html/';
</script>
```

Or with the dynamic `import()`:

```html
<script type="module">
  import('/-/lit-html/')
    .then(({ html, render }) => {
      console.log(html, render);
    });
</script>
```

## URL Formats
- Fixed Version: `/-/package-name@exact-version(/file-path)?`
- Version Range: `/-/package-name@version-range(/file-path)?`
- Tagged version: `/-/package-name@version-tag(/file-path)?`
- Latest Version: `/-/package-name(/file-path)?`

Supported version ranges are [semver ranges](https://docs.npmjs.com/misc/semver) including partial version range such as`@X`, `@X.Y`, `@X.Y.Z` or the exact version.  If you omit the file path (i.e. use a “bare” URL), airdrop will serve the file specified by the `module` field in `package.json`, with fall back to `browser` or `main`.

### Examples
Using a fixed version and full path:

```
/-/lit-html@1.0.0/lit-html.js
```

You may omit the file path. In this case `lit-html.js` is specified in the `module` field in `package.json`.

```
/-/lit-html@1.0.0/
```

You may also use a [semver range](https://docs.npmjs.com/misc/semver) or a [tag](https://docs.npmjs.com/cli/dist-tag) instead of a fixed version number, or omit the version/tag entirely to use the latest tag.

```
/-/lit-html@1/
/-/lit-html@latest/
/-/lit-html/
```

## Bare imports

While most modern browsers include support for ES modules, bare package specifiers are explicitly forbidden.  In order to import bare package specifiers like `import "lit-html"` we need [import maps](https://github.com/WICG/import-maps).

> Note: Import maps are still an experimental specification.  Use [es-module-shims](https://github.com/guybedford/es-module-shims) to polyfill most of the newer modules specifications.  [SystemJS](https://github.com/systemjs/systemjs) also supports import maps loads only System.register modules or AMD modules via extras.

Import maps may be dynamically generated for a given entry point:

```
/importmap/?imports=lit-element@2.0.1
```

Imports listed in the query support the same version ranges listed above (fixed, range, tagged, and latest) as well as multiple imports:

```
/importmap/?imports=lit-element@0&imports=lit-html@latest
```

## Adding Packages

Packages served by `airdrop` are located in the `pkg` directory (configurable per env in `config/`, `pkg-test` for development).  At the root of `pkg` there should be a single `.json` file for each package name.  This file is the [package metadata document](https://github.com/npm/registry/blob/master/docs/responses/package-metadata.md) containing details on each available package version.

> Note: The package metadata documents here are typically a subset of the documents returned from npm's [package endpoints](https://github.com/npm/registry/blob/master/docs/REGISTRY-API.md#package-endpoints); containing only versions loaded locally.

In the same directory the package contents should be stored as a tarball (currently optional) or unpacked (currently required) into a directory with the fixed version name.  This needs to be done for each package, each version, and all dependencies and peer dependencies.

`airdrop` includes a cli for adding packages directly from npm (connection to npm required here for setup only).  For example the following command:

```bash
./bin/airdrop add lit-element
```

Will retrieve the metadata for `lit-element` (`latest` in this case), download the tarball, and uncompress it to the appropriate location.  The same will happen for each dependency and peer dependency of `lit-element` (in this case only `lit-html`).  The resulting `pkg` directory structure will be:

```
pkg
├── lit-element.json        // metadata for lit-element
├── lit-element-2.0.1.tgz   // package tarball (optional)
├── lit-element@2.0.1/      // package content
├── lit-html.json           // metadata for lit-html
├── lit-html-1.0.0.tgz      // package tarball (optional)
└── lit-element@1.0.0/      // package content
```

The cli supports the same version ranges discussed above.

## Installation

```bash
$ npm install
```

## Running the app

Before running in dev mode use the `airdrop` cli to setup test entry points:

```bash
npm run test:setup
```

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## License

  [MIT licensed](LICENSE).
