import {spawn} from 'node:child_process';
import {cp, mkdtemp, mkdir, rm, symlink, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {basename, dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

// Build fixtures in a disposable copy, never in publishable docs/ or blog/.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const site = await mkdtemp(join(tmpdir(), 'kuma-licensing-'));
const cli = join(root, 'node_modules/@docusaurus/core/bin/docusaurus.mjs');
const port = process.env.KUMA_LICENSE_PORT ?? '3107';
const url = `http://localhost:${port}`;
let server;

function run(command, args, options = {}) {
  return new Promise((resolveRun, reject) => {
    const child = spawn(command, args, {cwd: root, stdio: 'inherit', ...options});
    child.on('error', reject);
    child.on('exit', (code, signal) => code === 0
      ? resolveRun()
      : reject(new Error(`${command} exited with ${signal ?? code}`)));
  });
}

try {
  for (const path of [
    'src', 'docs', 'blog', 'plugins', 'static', 'LICENSE', 'LICENSE-CONTENT.md',
    'ATTRIBUTION.md', 'docusaurus.config.ts', 'sidebars.ts', 'tsconfig.json', 'package.json',
  ]) {
    await cp(join(root, path), join(site, path), {recursive: true});
  }
  await symlink(join(root, 'node_modules'), join(site, 'node_modules'), 'dir');
  for (const folder of ['docs', 'blog']) {
    await mkdir(join(site, folder), {recursive: true});
    await cp(join(root, 'e2e/fixtures/licensing', folder), join(site, folder), {recursive: true});
  }
  console.log(`Licensing fixture site: ${site}`);
  await run(process.execPath, [cli, 'build', site]);
  await writeFile(join(site, 'build/__licensing-fixtures.txt'), basename(site));
  server = spawn(process.execPath, [cli, 'serve', site, '--port', port, '--no-open'], {
    cwd: root, stdio: 'inherit',
  });
  let serverError;
  server.on('error', (error) => { serverError = error; });
  let ready = false;
  let readinessError = 'No response';
  for (let attempt = 0; attempt < 100; attempt++) {
    if (serverError) throw serverError;
    if (server.exitCode !== null) throw new Error(`Fixture server exited with ${server.exitCode}`);
    try {
      const response = await fetch(`${url}/__licensing-fixtures.txt`, {signal: AbortSignal.timeout(1000)});
      // Never test an unrelated or retained fixture build occupying the port.
      const marker = await response.text();
      if (response.ok && marker === basename(site)) {
        ready = true;
        break;
      }
      readinessError = `Unexpected marker (HTTP ${response.status})`;
    } catch (error) { readinessError = `${error.message}: ${error.cause ?? ''}`; }
    await new Promise((wait) => setTimeout(wait, 100));
  }
  if (!ready) throw new Error(`Fixture server not ready at ${url}: ${readinessError}`);
  await run(process.execPath, [join(root, 'node_modules/@playwright/test/cli.js'),
    'test', 'e2e/licensing-fixtures.spec.ts', ...process.argv.slice(2)], {
    env: {
      ...process.env,
      BASE_URL: url,
      KUMA_LICENSE_FIXTURES: '1',
      KUMA_TEST_SUITE: process.env.KUMA_TEST_SUITE ?? 'licensing-fixtures',
    },
  });
} finally {
  if (server?.pid && server.exitCode === null) {
    await new Promise((done) => { server.once('exit', done); server.kill(); });
  }
  // Set this only for a local debugging session or screenshot review.
  if (process.env.KUMA_KEEP_LICENSE_FIXTURES) console.log(`Retained fixture site: ${site}`);
  else await rm(site, {recursive: true, force: true});
}
