/**
 * Static check: node tests/design-system-preview.mjs
 * Build + browser tests: node tests/design-system-preview.mjs --app /path/to/dependencies --out /path/to/evidence
 * Installs nothing. The app supplies Storybook 10.6, React, Vite, Vitest 4 and Playwright.
 */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { constants } from 'node:fs';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

const root = fileURLToPath(new URL('..', import.meta.url));
const template = path.join(root, 'skills/ultradesign/assets/templates/storybook');
const { values } = parseArgs({ options: { app: { type: 'string' }, out: { type: 'string' } } });
assert.equal(Boolean(values.app), Boolean(values.out), 'Supply both --app and --out, or neither');
const source = (file) => readFile(path.join(template, file), 'utf8');
const main = await source('.storybook/main.ts');
for (const name of ['react-vite', 'addon-docs', 'addon-vitest', 'addon-a11y', 'addon-mcp']) {
  assert.ok(main.includes(`@storybook/${name}`), name);
}
assert.match(main, /componentsManifest:\s*true/);
assert.match(await source('.storybook/preview.ts'), /generated\/tokens\.css/);
assert.match(await source('.storybook/preview.ts'), /reducedMotion/);
assert.match(await source('stories/Tokens.mdx'), /catalog\.generated\.json/);
for (const name of ['Normal', 'Hover', 'Focus', 'Disabled', 'Loading', 'Empty', 'Error']) {
  assert.match(await source('stories/TaskAction.stories.tsx'), new RegExp(`export const ${name}: Story`));
}
for (const file of ['stories/Imagery.mdx', 'stories/Motion.mdx', 'vitest.config.ts']) {
  assert.ok((await source(file)).length > 0, file);
}
console.log('Storybook template static checks passed.');

if (values.app) {
  const app = path.resolve(values.app);
  const out = path.resolve(values.out);
  const scratch = path.join(homedir(), 'dev/scratch');
  await mkdir(scratch, { recursive: true });
  const fixture = await mkdtemp(path.join(scratch, 'ud-storybook-preview-'));
  await mkdir(out, { recursive: true });
  try {
    await cp(template, fixture, { recursive: true });
    // Browser-mode setup modules must resolve inside the fixture's Vite root.
    await cp(path.join(app, 'node_modules'), path.join(fixture, 'node_modules'), {
      recursive: true, dereference: true, mode: constants.COPYFILE_FICLONE,
    });
    const metadata = JSON.parse(await readFile(path.join(app, 'package.json'), 'utf8'));
    await writeFile(path.join(fixture, 'package.json'), JSON.stringify({ ...metadata, name: 'ud-system-fixture', type: 'module' }));
    const require = createRequire(path.join(fixture, 'package.json'));
    const generate = ['run', '--script', path.join(root, 'skills/ultradesign/scripts/design-tokens'),
      path.join(root, 'skills/ultradesign/assets/templates/design-contract.md'),
      '--out', path.join(fixture, 'generated/tokens.css'),
      '--catalog', path.join(fixture, 'generated/catalog.generated.json'),
      '--ts', path.join(fixture, 'generated/tokens.ts')];
    execFileSync('uv', generate, { stdio: 'inherit', timeout: 30000 });
    execFileSync('uv', [...generate, '--check'], { stdio: 'inherit', timeout: 30000 });
    const env = { ...process.env, STORYBOOK_DISABLE_TELEMETRY: '1', CI: '1' };
    const storybookPackage = require.resolve('storybook/package.json');
    const storybookBin = path.resolve(path.dirname(storybookPackage), require(storybookPackage).bin);
    execFileSync(process.execPath, [storybookBin, 'build', '--output-dir', path.join(out, 'system')],
      { cwd: fixture, env, stdio: 'inherit', timeout: 180000 });
    const index = JSON.parse(await readFile(path.join(out, 'system/index.json'), 'utf8'));
    for (const state of ['normal', 'hover', 'focus', 'disabled', 'loading', 'empty', 'error']) {
      assert.ok(index.entries[`system-taskaction--${state}`], `built story ${state}`);
    }
    assert.ok(Object.values(index.entries).some((entry) => entry.title === 'System/Tokens'));
    assert.ok(Object.values(index.entries).some((entry) => entry.title === 'System/Imagery'));
    execFileSync(process.execPath, [path.join(path.dirname(require.resolve('vitest/package.json')), 'vitest.mjs'),
      'run', '--project=storybook'], { cwd: fixture, env, stdio: 'inherit', timeout: 180000 });
    const { preview } = await import(pathToFileURL(require.resolve('vite')).href);
    const server = await preview({
      configFile: false, root: fixture, base: '/system/',
      build: { outDir: path.join(out, 'system') },
      preview: { host: '127.0.0.1', port: 0 },
    });
    let browser;
    const pageErrors = [];
    try {
      browser = await require('playwright').chromium.launch({ headless: true });
      const page = await browser.newPage();
      page.on('pageerror', (error) => pageErrors.push(error.message));
      const base = `http://127.0.0.1:${server.httpServer.address().port}/system/`;
      for (const width of [390, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        for (const title of ['Tokens', 'Imagery', 'Motion']) {
          const entry = Object.values(index.entries).find((item) => item.title === `System/${title}` && item.type === 'docs');
          assert.ok(entry, `docs entry for ${title}`);
          await page.goto(`${base}iframe.html?id=${entry.id}&viewMode=docs`);
          // Storybook's MDX heading includes an accessible permalink label.
          await page.getByRole('heading', { name: new RegExp(`${title}$`), level: 1 }).waitFor();
          if (title === 'Motion') {
            await page.waitForFunction(() => {
              const subjects = [...document.querySelectorAll('.ud-motion-subject')];
              return subjects.length === 2 && document.getAnimations().every((animation) => animation.playState === 'finished')
                && subjects.every((subject) => {
                  const bounds = subject.getBoundingClientRect();
                  for (let parent = subject.parentElement; parent; parent = parent.parentElement) {
                    if (['hidden', 'clip'].includes(getComputedStyle(parent).overflowY)
                        && parent.getBoundingClientRect().bottom < bounds.bottom) return false;
                  }
                  return bounds.height > 0;
                });
            }, undefined, { timeout: 30000 });
          }
          assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
            `${title} should fit the ${width}px viewport`);
          await page.screenshot({ path: path.join(out, `${title.toLowerCase()}-${width}.png`), fullPage: true });
        }
      }
      assert.deepEqual(pageErrors, [], 'published MDX pages should render without runtime errors');
    } finally {
      await browser?.close();
      await new Promise((resolve, reject) => server.httpServer.close((error) => error ? reject(error) : resolve()));
    }
    const packages = ['storybook', '@storybook/react-vite', '@storybook/addon-docs', '@storybook/addon-vitest',
      '@storybook/addon-a11y', '@storybook/addon-mcp', 'vitest', '@vitest/browser-playwright', 'playwright', 'react', 'vite'];
    const versions = Object.fromEntries(packages.map((name) => [name, require(`${name}/package.json`).version]));
    await writeFile(path.join(out, 'report.json'), JSON.stringify({
      versions, checks: ['static template', 'generated token freshness', 'storybook build', 'story index', 'Vitest browser interactions and a11y', 'MDX at /system/ at 390 and 1440'],
      pageErrors,
      shareDeployment: 'not performed', output: path.join(out, 'system'),
    }, null, 2) + '\n');
    console.log(`Storybook build and browser tests passed. Evidence: ${out}`);
  } finally {
    await rm(fixture, { recursive: true, force: true });
  }
}
