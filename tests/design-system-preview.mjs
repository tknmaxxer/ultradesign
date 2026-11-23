/**
 * Render the portable template against the actual research design and records.
 * No installs or changes to the research app. Usage:
 * node tests/design-system-preview.mjs --app /absolute/path/ds/app --out /tmp/system-preview
 * Requires that app's existing Vite, React, Base UI and Playwright dependencies.
 */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { cp, mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

const { values } = parseArgs({ options: { app: { type: 'string' }, out: { type: 'string' } } });
if (!values.app || !values.out) throw new Error('Use --app /absolute/path/ds/app --out /absolute/evidence/path');
const app = path.resolve(values.app);
const out = path.resolve(values.out);
const root = fileURLToPath(new URL('..', import.meta.url));
const require = createRequire(path.join(app, 'package.json'));
const { createServer } = await import(pathToFileURL(require.resolve('vite')));
const { default: react } = await import(pathToFileURL(require.resolve('@vitejs/plugin-react')));
const { chromium } = require('playwright');
const fixture = await mkdtemp(path.join(tmpdir(), 'ultradesign-system-'));
await mkdir(out, { recursive: true });
let server;
let browser;
try {
  await cp(path.join(root, 'skills/ultradesign/assets/templates/system-page/SystemPage.tsx'), path.join(fixture, 'SystemPage.tsx'));
  await cp(path.join(root, 'skills/ultradesign/assets/templates/system-page/SystemPage.module.css'), path.join(fixture, 'SystemPage.module.css'));
  await cp(path.join(app, 'src/lanes.json'), path.join(fixture, 'records.json'));
  await cp(path.join(app, 'src/icons.generated.json'), path.join(fixture, 'icons.json'));
  await symlink(path.join(app, 'node_modules'), path.join(fixture, 'node_modules'));
  await writeFile(path.join(fixture, 'package.json'), '{"type":"module"}');
  const generate = ['run', '--script', path.join(root, 'skills/ultradesign/scripts/design-tokens'), path.join(app, '../DESIGN.md'),
    '--out', path.join(fixture, 'tokens.css'), '--catalog', path.join(fixture, 'catalog.generated.json')];
  execFileSync('uv', generate, { stdio: 'inherit' });
  execFileSync('uv', [...generate, '--check'], { stdio: 'inherit' });
  await cp(path.join(fixture, 'tokens.css'), path.join(out, 'tokens.css'));
  await cp(path.join(fixture, 'catalog.generated.json'), path.join(out, 'catalog.generated.json'));
  await writeFile(path.join(fixture, 'index.html'), '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>System template research preview</title><body style="margin:0"><div id="root"></div><script type="module" src="/main.tsx"></script></body></html>');
  await writeFile(path.join(fixture, 'main.tsx'), `
import '@fontsource-variable/noto-sans/wght.css';
import '@fontsource-variable/noto-sans-mono/wght.css';
import '@fontsource/gothic-a1/korean-400.css';
import '@fontsource/gothic-a1/korean-600.css';
import '@fontsource/gothic-a1/korean-700.css';
import './tokens.css';
import { createRoot } from 'react-dom/client';
import { SystemPage, type SystemRoles, type SystemContent } from './SystemPage';
import catalog from './catalog.generated.json';
import records from './records.json';
import icons from './icons.json';
const roles: SystemRoles = {
  colors: { canvas: 'colors.bg.canvas', surface: 'colors.bg.surface', field: 'colors.bg.field', text: 'colors.fg.strong',
    muted: 'colors.fg.muted', border: 'colors.border.hairline', controlBorder: 'colors.border.control', focus: 'colors.focus' },
  typography: { body: 'typography.body', title: 'typography.title', label: 'typography.label', code: 'typography.mono' },
  spacing: { gap: 'spacing.scale.2', section: 'spacing.scale.8', gutter: 'spacing.phone.gutter', row: 'spacing.desktop.row', phoneRow: 'spacing.phone.row' },
  radius: 'rounded.md',
};
const stateMetadata = {
  working: ['진행 중', 'circle-dot'], paused: ['일시 정지', 'pause'], 'needs-report': ['보고 필요', 'clock'],
  done: ['완료', 'circle-check'], abandoned: ['중단', 'circle-close'], error: ['오류', 'triangle-warning'],
};
const content: SystemContent = {
  name: 'Cataly Ops / system template',
  summary: 'Actual research tokens and an approved local record excerpt, rendered by the reusable template.',
  task: 'Select a lane and read its last recorded report. Compare shapes, control states and generated foundations.',
  source: 'Local research snapshot: ' + records.observedAt,
  typeSample: '선택한 lane의 마지막 보고 / 23:18:01 / 0123456789',
  items: records.lanes.map(lane => ({
    id: lane.key, title: lane.title, status: lane.state,
    detail: lane.reports.at(-1)?.text ?? 'No report was present in the source snapshot.',
    metadata: lane.reports.at(-1)?.at ?? 'No source time',
  })),
  statuses: Object.entries(stateMetadata).map(([id, [label, icon]]) => ({
    id, label, description: id, colorToken: 'colors.status.' + id,
    glyph: <svg viewBox="0 0 24 24" dangerouslySetInnerHTML={{ __html: icons[icon] }} />,
  })),
};
createRoot(document.getElementById('root')!).render(<SystemPage catalog={catalog} roles={roles} content={content} />);
`);
  server = await createServer({ root: fixture, configFile: false, plugins: [react()],
    server: { host: '127.0.0.1', port: 0, fs: { allow: [fixture, app] } } });
  await server.listen();
  const address = server.httpServer.address();
  const url = `http://127.0.0.1:${address.port}/system`;
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const report = { url, widths: [], interactions: [] };
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.getByRole('heading', { level: 1 }).count(), 1);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    assert.equal(overflow, false, `${width}px horizontal overflow`);
    const screenshot = path.join(out, `system-${width}.png`);
    await page.screenshot({ path: screenshot, fullPage: true });
    report.widths.push({ width, horizontalOverflow: overflow, screenshot });
  }
  await page.getByRole('searchbox', { name: 'Filter specimen records' }).fill('not-a-source-lane');
  assert.equal(await page.getByRole('heading', { name: 'No matching records' }).count(), 1);
  await page.getByRole('button', { name: 'Clear filter', exact: true }).first().click();
  const rows = page.getByRole('list', { name: 'Specimen records' }).getByRole('button');
  await rows.nth(1).click();
  assert.equal(await rows.nth(1).getAttribute('aria-pressed'), 'true');
  const sort = page.getByRole('button', { name: 'Sort: source order' });
  await sort.focus();
  await page.keyboard.press('Enter');
  await page.getByRole('menuitemradio', { name: 'Title', exact: true }).click();
  await page.getByRole('button', { name: 'Sort: title' }).focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => document.activeElement?.textContent === 'Sort: title');
  const focusReturned = await page.getByRole('button', { name: 'Sort: title' }).evaluate(element => document.activeElement === element);
  assert.equal(focusReturned, true, 'Menu focus should return after Escape');
  await page.getByRole('button', { name: 'Save local note' }).click();
  assert.equal(await page.getByRole('alert').textContent(), 'Enter a review note before saving.');
  await page.getByRole('textbox', { name: 'Review note (required)' }).fill('Keyboard and row selection reviewed.');
  await page.getByRole('button', { name: 'Save local note' }).click();
  assert.equal(await page.getByText('Saved locally: Keyboard and row selection reviewed.').count(), 1);
  assert.equal(await page.getByRole('button', { name: 'Publish unavailable' }).isDisabled(), true);
  await page.getByRole('tab', { name: 'Feedback states' }).click();
  await page.getByRole('button', { name: 'loading', exact: true }).click();
  assert.equal(await page.getByText('Loading state specimen. No request is running.').count(), 1);
  await page.getByRole('button', { name: 'Close loading specimen' }).click();
  await page.getByRole('button', { name: 'error', exact: true }).click();
  assert.equal(await page.getByRole('heading', { name: 'Error state specimen' }).count(), 1);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('button', { name: 'Replay motion.state-change', exact: true }).click();
  const animation = await page.locator('[data-playing="true"]').evaluate(element => getComputedStyle(element).animationName);
  assert.equal(animation, 'none', 'Reduced motion removes replay animation');
  report.interactions.push('filter/clear', 'row selection', 'menu sort and Escape focus return', 'required-field validation',
    'local save', 'disabled state', 'tabs and explicit feedback states', 'reduced motion');
  assert.deepEqual(errors, []);
  report.pageErrors = errors;
  await writeFile(path.join(out, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser?.close();
  await server?.close();
  await rm(fixture, { recursive: true, force: true });
}
