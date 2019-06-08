import { createSandbox, execPkgdrop } from './cli.util';

import * as pkg from '../package.json';

describe('meta commands', () => {
  let sandbox: any;

  beforeAll(async () => {
    sandbox = await createSandbox();
  });

  afterAll(async () => {
    sandbox.clean();
  });

  test('displays the version number', async () => {
    const out = await execPkgdrop(`version --offline`);
    expect(out).toBe(pkg.version);
  });

  test('displays help', async () => {
    const out = await execPkgdrop(`help --offline`);
    expect(out).toContain(`pkgdrop version ${pkg.version}`);
  });

  test('--clean', async () => {
    const out = await execPkgdrop(`--clean --offline`);
    expect(out).toContain('Cleaning output directory');
    expect(out).toContain('No packages specified');
    expect(await sandbox.exists('-/importmap.json')).toBe(false);
  });
});
