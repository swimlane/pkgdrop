import { createSandbox, execPkgdrop } from './cli.util';

const TIMEOUT = 100000;

describe('pack', () => {
  let sandbox: any;
  let output: string;

  beforeAll(async () => {
    sandbox = await createSandbox();
    await execPkgdrop(`init -y --offline`);
    await execPkgdrop(`add lit-element@2.0.0 --clean`);
    output = await execPkgdrop(`pack pkgdrop-pack-test.tgz`);
  }, TIMEOUT);

  afterAll(async () => {
    sandbox.clean();
  }, TIMEOUT);

  test('displays console messages', () => {
    expect(output).toMatchSnapshot();
  });

  test('files exist', async () => {
    expect(await sandbox.exists('pkgdrop-pack-test.tgz')).toBe('file');
  });

  test('importmap', async () => {
    expect(await sandbox.read('-/importmap.json')).toMatchSnapshot();
  });

  describe('merge', () => {
    beforeAll(async () => {
      await execPkgdrop(`add lit-element@2.1.0 --clean`);
      output = await execPkgdrop(`merge pkgdrop-pack-test.tgz`);
    }, TIMEOUT);

    test('displays console messages', () => {
      expect(output).toMatchSnapshot();
    });

    test('files', async () => {
      expect(await sandbox.exists('-/lit-element@2.1.0')).toBe('dir');
      expect(await sandbox.exists('-/lit-element@2.0.0')).toBe('dir');
    });

    test('importmap', async () => {
      expect(await sandbox.read('-/importmap.json')).toMatchSnapshot();
    });
  });
});