<p align="center">
  <img src="./pkgdrop.png" width="200" alt="pkgdrop Logo" />
</p>

pkgdrop
===========

`pkgdrop` is a package delivery tool for ES modules from [npm](https://www.npmjs.com/) packages.
Use it to deliver packages from npm to the browser with no external connection needed at runtime.

## Summary

- Downloads and extracts packages from npm, including dependencies, into a flat file structure.
- Optionally bundles packages, and dependencies, into a single ES module.
- Generates a import-map compatible with the [WICG import-maps](https://github.com/WICG/import-maps) proposal (and shims).
- Provides a method to archive and merge downloaded packages and import-maps between systems.

## Installation

```bash
$ npm install @swimlane/pkgdrop -g
```

> Or use `npx @swimlane/pkgdrop` in place of `pkgdrop` in the examples below.

## CLI Usage

### Adding Packages

```bash
pkgdrop add <package> [<package>] [--force] [--bundle] [--optimize] [--clean]
```

> The `add` command is optional; the default `pkgdrop` command is `add`.

* `<package>`: npm package(s) (with optional version or tag) to add
* `--force`: force add package(s) that have already been added
* `--bundle`: bundle the added package(s)
* `--optimize`: minify the generated bundle(s)
* `--clean`: clean output directory before adding new packages
* `--no-color`: disable CLI colors

> The cli supports multiple packages and semantic version ranges.  For example `pkgdrop add lit-element es-module-shims@0.4.6` will install the latest version of `lit-element` and an exact version of `es-module-shims`.

Packages added using `pkgdrop <package>` are downloaded into a `<package_path>/<name>@<version>/` directory.  The same happens for each dependency of `<package>`.  An [import-map](https://github.com/WICG/import-maps) in the `<package_path>` directory is added or updated.

For example, running `pkgdrop lit-element@2.0.1` results in a `<package_path>` directory structure of:

```
<package_path>
├── lit-element@2.0.1/
├── lit-html@1.0.0/
└── importmap.json
```

and an import-map of:

```json
{
  "imports": {
    "lit-element@2.0.1": "<package_root>lit-element@2.0.1/lit-element.js",
    "lit-element@2.0.1/": "<package_root>lit-element@2.0.1/",
    "lit-element@2": "<package_root>lit-element@2.0.1/lit-element.js",
    "lit-element@2/": "<package_root>lit-element@2.0.1/"
  },
  "scopes": {
    "lit-element@2.0.1": {
      "lit-html": "<package_root>lit-html@1.0.0/lit-html.js",
      "lit-html/": "<package_root>lit-html@1.0.0/"
    },
    "lit-html@1.0.0": {}
  }
}
```

> The `<package_path>` directory is configurable via the `package_path` property in `pkgdrop.config.js`, the default is `./-/`.  In the generated import-maps, the package address is configurable via the `package_root` property, the default is `/-/`.  This value must start with `/`, `../`, or `./`, or be an absolute URL.

The `--bundle` flag adds and bundles each `<package>` into a esm bundle (and with inlined dependencies) at `<package_path>/<name>@<version>.bundle.js`.  The import-map is updated to resolve `<name>@<version>` to the bundle.

For example, running `pkgdrop d3@5.9.2 --bundle` results in a root directory structure of:

```
<package_path>
├── <d3 deps>
├── d3@5.9.2/
├── d3@5.9.2.bundle.js
└── importmap.json
```

and an import-map of:

```json
{
  "imports": {
    "d3@5.9.2": "<package_root>d3@5.9.2.bundle.js",
    "d3@5": "<package_root>d3@5.9.2.bundle.js"
  },
  "scopes": {}
}
```

> Note that `pkgdrop` adds an import of the form `<name>@<major-version>` that resolves to the latest local version of the package.

### Moving packages

Adding packages requires a connection to the npm registry.  Once added an external connection is no longer required.  The `<package_path>` directory can be deployed with other static assets or just manually copied between systems.

The following commands help move content from one system to another:

- `pkgdrop pack [<filename>]` - Creates a tarball from the `<package_path>` directory.  The `<filename>` is optional and defaults to using a timestamp.
- `pkgdrop merge <filename>` - Unpacks a tarball to the `<package_path>` directory, merging the packed import-map with the existing import-map.

### Other commands

- `pkgdrop init` - Adds an `pkgdrop.config.js` to the current directory and an empty import-map.
- `pkgdrop version` - Outputs the version number.
- `pkgdrop config` - Displays current configuration.
- `pkgdrop clean` - Cleans the output directory.
- `pkgdrop resolve <package>` - Prints the resolved url for package(s).

## In browser usage

### Fixed Versions

The added ES modules can be loaded in the browser using a absolute path and full version.

- `/<package_root>/<name>@<version>[/file-path]`

> Use `pkgdrop resolve <package>` to find the resolved path.

```html
<script type="module">
  import { html, render } from '/-/lit-html@1.0.0/lit-html.js';
</script>
```

Or with the dynamic `import()`:

```html
<script type="module">
  import('/-/lit-html@.1.0.0/lit-html.js')
    .then(({ html, render }) => {
      console.log(html, render);
    });
</script>
```

### Bare imports

While most modern browsers include support for ES modules, bare package specifiers are explicitly forbidden.  In order to import bare package specifiers like `import "lit-html"` we need [import-maps](https://github.com/WICG/import-maps).

> Note: import-maps are still an experimental specification.  Use [es-module-shims](https://github.com/guybedford/es-module-shims) to polyfill most of the newer modules specifications.  [SystemJS](https://github.com/systemjs/systemjs) also supports import-maps.  However, `SystemJS` only loads `System.register` modules or AMD modules via extras.

```html
<script type="module" src="/-/es-module-shims@0.4.6/dist/es-module-shims.js"></script>
<script type="importmap-shim" src="/-/importmap.json"></script>
<script type="module-shim">
  import { LitElement, css } from 'lit-element@2.1.0';
  import { html } from 'lit-html@1.0.0';

  class MyElement extends LitElement {
  
    static get properties() {
      return {
        mood: {type: String}
      }
    }
    
    static get styles() {
      return css`.mood { color: green; }`;
    }
  
    render() {
      return html`Web Components are <span class="mood">${this.mood}</span>!`;
    }
  }

  customElements.define('my-element', MyElement);
</script>
```

### Bundles

Bundles can also be imported using fixed versions or bare imports when combined with the import-map.

```html
<script type="module">
  import * as d3 from '/-/d3d3@5.9.2.bundle.js';
  d3.select('#hello').text('Hello World!!');
</script>
```

```html
<script type="module" src="/-/es-module-shims@0.4.6/dist/es-module-shims.js"></script>
<script type="importmap-shim" src="/-/importmap.json"></script>
<script type="module-shim">
    import * as d3 from 'd3@5.9.2';
    d3.select('#hello').text('Hello World!!');
</script>
```

## Examples

- [lit-element](https://lit-element.polymer-project.org/) project (with shims and import-map): https://gist.github.com/Hypercubed/6a2c7e5c21355bc109f0c06e6a5a62c8
- [d3](https://d3js.org/) project (bundled, no shims or import-map necessary): https://gist.github.com/Hypercubed/e6f198ff61f5d2d9ec3a540a0ac3b9ca

## Credits

`pkgdrop` is a [Swimlane](http://swimlane.com) open-source project; we believe in giving back to the open-source community by sharing some of the projects we build for our application. Swimlane is an automated cyber security operations and incident response platform that enables cyber security teams to leverage threat intelligence, speed up incident response and automate security operations.

## License

  [MIT licensed](LICENSE).
