<p align="center">
  <img src="./airdrop.png" width="200" alt="airdrop Logo" />
</p>

airdrop-cli
===========

airdrop-cli is a package delivery tool for [npm](https://www.npmjs.com/) packages.
Use it to download packages from npm to be loaded in the browser using native browser ES module loader with no connection to npm needed at runtime.

## Installation

```bash
$ npm airdrop -g
```

> Or use `npx airdrop`

## CLI Usage

### Adding Packages

```bash
airdrop add <package> [--force]
```

* `<package>`: npm package (with optional version or tag) to add.
* `--force`: force airdrop to add packages that have already been added.

> The cli supports multiple packages and semver ranges.  For example `airdrop add lit-element es-module-shims@0.2.3` will install the latest version of `lit-element` and an exact version `es-module-shims`.

Packages added using `airdrop add <package>` will be downloaded into a `/<path>/<name>@<version/` directory.  The same will happen for each dependency of `<package>`.  An [import map](https://github.com/WICG/import-maps) will also be added or updated.

For example, running `airdrop add lit-element@2.0.1` will result in a root directory structure of:

```
<path>
├── lit-element@2.0.1/
├── lit-html@1.0.0/
└── importmap.json
```

> The `<path>` directory is configurable via the `package_path` property in `airdrop.config.js`, the default is `./-/`.  In the generated import maps the address `<root>` path is configurable via the `package_root` property, the default is `/-/`.  This value must start with `/`, `../`, or `./`, or be an absolute URL.

### Bundling

```bash
airdrop bundle <package> [--force] [--optimize]
```

* `--force`: force airdrop to bundle packages that have already been bundle.
* `--optimize`: minify the generated bundle.

The command will add and bundle the `<package>` package (and dependencies) into a esm bundle named `<name>@<version>.bundle.js` located in the `<path>` directory.  The import-map will be updated to import resolve `<name>@<version>` to the bundle.

For example, running `airdrop bundle d3d3@5.9.2` will result in a root directory structure of:

```
<path>
├── <d3 deps>
├── d3d3@5.9.2/
├── d3d3@5.9.2.bundle.js
└── importmap.json
```

## In browser usage

### Fixed Versions

The added ES modules can be loaded in the browser using a absolute path and full version.

- `/<root>/<name>@<version>(/file-path)?`

```html
<script type="module">
  import { html, render } from '/-/lit-html@.1.0.0/lit-html.js';
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

While most modern browsers include support for ES modules, bare package specifiers are explicitly forbidden.  In order to import bare package specifiers like `import "lit-html"` we need [import maps](https://github.com/WICG/import-maps).

> Note: Import maps are still an experimental specification.  Use [es-module-shims](https://github.com/guybedford/es-module-shims) to polyfill most of the newer modules specifications.  [SystemJS](https://github.com/systemjs/systemjs) also supports import maps.  However, `SystemJS` only loads `System.register` modules or AMD modules via extras.

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

Bundles can also be imported using bare imports.

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
