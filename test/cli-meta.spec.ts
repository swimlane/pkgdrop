import { createSandbox } from './cli.util';
import * as nock from 'nock';

import * as pkg from '../package.json';

nock.disableNetConnect();

describe('meta commands', () => {
  let sandbox: any;

  beforeAll(async () => {
    sandbox = await createSandbox();
  });

  afterAll(async () => {
    await sandbox.clean();
  });

  test('displays the version number', async () => {
    const out = await sandbox.exec(`version`);
    expect(out).toBe(pkg.version);
  });

  test('displays help', async () => {
    const out = await sandbox.exec(`help`);
    expect(out).toContain(`pkgdrop version ${pkg.version}`);
  });

  test('--clean', async () => {
    const out = await sandbox.exec(`--clean`);
    expect(out).toContain('Cleaning output directory');
    expect(out).toContain('No packages specified');
    expect(await sandbox.exists('-/importmap.json')).toBe(false);
  });
});
