import { createSandbox } from './cli.util';

const TIMEOUT = 100000;

describe('add --bundle', () => {
  let output: string;
  let sandbox: any;

  beforeAll(async () => {
    sandbox = await createSandbox();
    await sandbox.exec(`init -y --offline`);
    output = await sandbox.exec(`add lit-element@2.1.0 --clean --bundle`);
  }, TIMEOUT);

  afterAll(async () => {
    await sandbox.clean();
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
    const out = await sandbox.exec(`bundle lit-element@2.1.0 --offline`);
    expect(out).toContain('Bundle already exists');
    expect(out).toContain('skipping');
  }, 30000);

  test.skip('can force', async () => {
    const out = await sandbox.exec(`bundle lit-element@2.1.0 --force --offline`);
    expect(out).toMatchSnapshot();
  }, TIMEOUT);
});
