import { createSandbox } from './cli.util';

const TIMEOUT = 100000;

describe('add', () => {
  let output: string;
  let sandbox: any;

  beforeAll(async () => {
    sandbox = await createSandbox();
    await sandbox.exec(`init -y --offline`);
    output = await sandbox.exec(`add lit-element@2.1.0 --clean`);
  }, TIMEOUT);

  afterAll(async () => {
    await sandbox.clean();
  });

  test('displays console messages', async () => {
    expect(output).toMatchSnapshot();
  });

  test('files exist', async () => {
    expect(await sandbox.exists('-/lit-element@2.1.0')).toBe('dir');
    expect(await sandbox.exists('-/lit-html@1.1.0')).toBe('dir');
    expect(await sandbox.exists('-/importmap.json')).toBe('file');
  });

  test('importmap', async () => {
    expect(await sandbox.read('-/importmap.json')).toMatchSnapshot();
  });

  test(`can't add again`, async () => {
    const out = await sandbox.exec(`add lit-element@2.1.0`);
    expect(out).toContain('Package lit-element@2.1.0 already exists, skipping');
  });

  test('can force', async () => {
    const out = await sandbox.exec(`add lit-element@2.1.0 --force`);
    expect(out).toMatchSnapshot();
  });

  test('fail on missing package', async () => {
    const code = process.exitCode;
    const out = await sandbox.exec(`add @swimlane/pkgdrop@0.0.0`);
    expect(out).toMatchSnapshot();
    expect(process.exitCode).toBe(1);
    process.exitCode = code;
  });

  test('can force skip on missing packages', async () => {
    const out = await sandbox.exec(`add @swimlane/pkgdrop@0.0.0 --force`);
    expect(out).toMatchSnapshot();
  });

  test('can clean', async () => {
    const out = await sandbox.exec(`add lit-html@1.1.0 --clean`);
    expect(out).toMatchSnapshot();
    expect(await sandbox.exists('-/lit-element@2.1.0')).toBe(false);
    expect(await sandbox.exists('-/lit-html@1.1.0')).toBe('dir');
    expect(await sandbox.exists('-/importmap.json')).toBe('file');
  });

  test('importmap should add latest as major', async () => {
    await sandbox.exec(`add lit-html@1.1.0 --clean`);
    await sandbox.exec(`add lit-html@1.0.0`);
    let importmap: any = await sandbox.read('-/importmap.json');
    importmap = JSON.parse(importmap);
    expect(importmap.imports['lit-html@1']).toBe('/-/lit-html@1.1.0/lit-html.js');
  }, TIMEOUT);

  test('prints messages for peers', async () => {
    const out = await sandbox.exec(`add @angular/core --clean --dry`);
    expect(out).toMatchSnapshot();
  });
});
