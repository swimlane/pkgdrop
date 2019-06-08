import { createSandbox, execPkgdrop } from './cli.util';

const TIMEOUT = 100000;

describe('add --bundle', () => {
  let output: string;
  let sandbox: any;

  beforeAll(async () => {
    sandbox = await createSandbox();
    await execPkgdrop(`init -y --offline`);
    output = await execPkgdrop(`add lit-element@2.1.0 --clean --bundle`);
  }, TIMEOUT);

  afterAll(async () => {
    sandbox.clean();
  });

  test('displays console messages', () => {
    expect(output).toMatchSnapshot();
  });

  test('files exist', async () => {
    expect(await sandbox.exists('-/lit-element@2.1.0.bundle.js')).toBe('file');
    expect(await sandbox.exists('-/importmap.json')).toBe('file');
  });

  test('importmap', async () => {
    expect(await sandbox.read('-/importmap.json')).toMatchSnapshot();
  });

  test('can\'t bundle again', async () => {
    const out = await execPkgdrop(`bundle lit-element@2.1.0 --offline`);
    expect(out).toContain('Bundle already exists');
    expect(out).toContain('skipping');
  }, 30000);

  test('can force', async () => {
    const out = await execPkgdrop(`bundle lit-element@2.1.0 --force --offline`);
    expect(out).toMatchSnapshot();
  }, TIMEOUT);
});
