<p align="center">
  <img src="./airdrop.png" width="200" alt="airdrop Logo" />
</p>

airdrop-cli
===========

airdrop-cli is a package delivery tool for ES modules from [npm](https://www.npmjs.com/) packages.
Use it to download packages from npm to be loaded in the browser with no external connection needed at runtime.

## Installation

```bash
$ npm @swimlane/airdrop-cli -g
```

> Or use `npx @swimlane/airdrop-cli`

## CLI Usage

### Adding Packages

```bash
airdrop <package> [<package>] [--force] [--bundle] [--optimize] [--clean]
```

* `<package>`: npm package(s) (with optional version or tag) to add.
* `--force`: force add package(s) that have already been added.
* `--bundle`: bundle the added package(s).
* `--optimize`: minify the generated bundle(s).
* `--clean`: clean output directory before adding new packages.
* `--no-color`: disable CLI colors.

> The cli supports multiple packages and semver ranges.  For example `airdrop add lit-element es-module-shims@0.2.3` will install the latest version of `lit-element` and an exact version of `es-module-shims`.

Packages added using `airdrop <package>` will be downloaded into a `<package_path>/<name>@<version/` directory.  The same will happen for each dependency of `<package>`.  An [import-map](https://github.com/WICG/import-maps) in the `<package_path>` directory will also be added or updated.

For example, running `airdrop lit-element@2.0.1` will result in a `<package_path>` directory structure of:

```
<package_path>
├── lit-element@2.0.1/
├── lit-html@1.0.0/
└── importmap.json
```

> The `<package_path>` directory is configurable via the `package_path` property in `airdrop.config.js`, the default is `./-/`.  In the generated import-maps, the package address is configurable via the `package_root` property, the default is `/-/`.  This value must start with `/`, `../`, or `./`, or be an absolute URL.

The `--bundle` flag will add and bundle each `<package>` (and dependencies) into a esm bundle at `<package_path>/<name>@<version>.bundle.js`.  The import-map will be updated to resolve `<name>@<version>` to the bundle.

For example, running `airdrop d3d3@5.9.2 --bundle` will result in a root directory structure of:

```
<package_path>
├── <d3 deps>
├── d3d3@5.9.2/
├── d3d3@5.9.2.bundle.js
└── importmap.json
```

### Airdropping packages

Adding packages requires a connection to the npm registry.  Once added an external connection is no longer required.  The `<package_path>` can be deployed with other assets or manually copied to a server.

The following commands will help moving content from one system to another:

- `airdrop pack` - Create a tarball from the `<package_path>` directory.
- `airdrop merge <filename>` - Unpacks a tarball to the `<package_path>` directory, merging the packed import-map with the existing import-map.

### Other commands

- `airdrop init` - Adds an `airdrop.config.js` to the current directory.
- `airdrop version` - Output the version number.
- `airdrop config` - Displays current configuration.
- `airdrop clean` - Cleans the output directory.
- `airdrop resolve <package>` - Prints the resolved url for package(s).
- `airdrop bundle <package>` - Bundles existing package(s).

## In browser usage

### Fixed Versions

The added ES modules can be loaded in the browser using a absolute path and full version.

- `/<package_root>/<name>@<version>[/file-path]`

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
<script type="module" src="/-/es-module-shims@0.2.3/dist/es-module-shims.js"></script>
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

Bundles can also be imported using fixed versions or bare imports.

```html
<script type="module">
  import * as d3 from '/-/d3d3@5.9.2.bundle.js';
  d3.select('#hello').text('Hello World!!');
</script>
```

```html
<script type="module" src="/-/es-module-shims@0.2.3/dist/es-module-shims.js"></script>
<script type="importmap-shim" src="/-/importmap.json"></script>
<script type="module-shim">
    import * as d3 from 'd3@5.9.2';
    d3.select('#hello').text('Hello World!!');
</script>
```

## Credits

`airdrop` is a [Swimlane](http://swimlane.com) open-source project; we believe in giving back to the open-source community by sharing some of the projects we build for our application. Swimlane is an automated cyber security operations and incident response platform that enables cyber security teams to leverage threat intelligence, speed up incident response and automate security operations.

## License

  [MIT licensed](LICENSE).
