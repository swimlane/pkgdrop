import { createSandbox, execPkgdrop } from './cli.util';

describe('init', () => {
  let output: string;
  let sandbox: any;

  beforeAll(async () => {
    sandbox = await createSandbox();
    output = await execPkgdrop(`init -y --offline`);
  });

  afterAll(async () => {
    sandbox.clean();
  });

  test('displays console messages', () => {
    expect(output).toMatchSnapshot();
  });

  test('files exist', async () => {
    expect(await sandbox.exists('pkgdrop.config.js')).toBe('file');
    expect(await sandbox.exists('-/')).toBe('dir');
    expect(await sandbox.exists('-/importmap.json')).toBe('file');
  });

  test('file content', async () => {
    expect(await sandbox.read('-/importmap.json')).toMatchSnapshot();
    expect(await sandbox.read('pkgdrop.config.js')).toMatchSnapshot();
  });
});
