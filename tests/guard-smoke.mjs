/** Run: node tests/guard-smoke.mjs --app /path/to/app-with-guard-dependencies */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const { values } = parseArgs({ options: { app: { type: 'string' } } });
if (!values.app) throw new Error('Use --app /path/to/app-with-guard-dependencies');
const check = fileURLToPath(new URL('../skills/ultradesign/assets/templates/guard/check.mjs', import.meta.url));
const root = await mkdtemp(path.join(tmpdir(), 'ud-guard-'));
let cases = 0;
try {
  for (const dir of ['src/system', 'src/motion', 'src/scenes', 'generated']) {
    await mkdir(path.join(root, dir), { recursive: true });
  }
  await symlink(path.resolve(values.app, 'node_modules'), path.join(root, 'node_modules'));
  await writeFile(path.join(root, 'package.json'), '{"type":"module"}');
  await writeFile(path.join(root, 'generated/tokens.css'), ':root { --color-action: #174ea6; }');
  await writeFile(path.join(root, 'generated/tokens.ts'), 'export const tokens = { colors: { action: "#174ea6" } } as const;');
  const config = {
    sources: 'src', tokens: 'generated/tokens.css',
    systemEntries: ['src/system'], motionEntries: ['src/motion'], sceneEntries: ['src/scenes'],
    fontFaces: [],
  };
  const configure = async () => writeFile(path.join(root, 'ud-guard.config.json'), JSON.stringify(config));
  await configure();
  const motion = `import { animate } from 'motion';
import { gsap } from 'gsap';
import { tokens } from '../../generated/tokens';
export function animateElement(element) {
  element.style.color = tokens.colors.action;
  element.style.transform = 'translateX(0)';
  requestAnimationFrame(() => gsap.to(element, { opacity: 1 }));
  return animate(element, { opacity: 1 });
}`;
  const scene = `import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { tokens } from '../../generated/tokens';
export const material = new THREE.MeshBasicMaterial({ color: tokens.colors.action });
export function Scene() { return <Canvas><mesh><meshBasicMaterial color={tokens.colors.action} /></mesh></Canvas>; }`;
  const system = `import { Scene } from '../scenes/Scene';
export function Hero() { return <Scene />; }`;
  const product = `import { Hero } from './system/Hero';
export function App() { return <main><Hero /></main>; }`;
  const put = (name, content) => writeFile(path.join(root, name), content);
  await put('src/motion/entrance.ts', motion);
  await put('src/scenes/Scene.tsx', scene);
  await put('src/system/Hero.tsx', system);
  await put('src/App.tsx', product);
  const run = (expected, label) => {
    const result = spawnSync(process.execPath, [check, root], { encoding: 'utf8', timeout: 30000 });
    assert.equal(result.status, expected, `${label}\n${result.stdout}\n${result.stderr}`);
    cases += 1;
  };
  run(0, 'sanctioned motion and scene implementations compose through system');
  for (const literal of ['"#ff00aa"', '"rgb(1, 2, 3)"', '`#ff00aa`', '0xff00aa']) {
    await put('src/motion/entrance.ts', motion + `\nexport const badColor = ${literal};`);
    run(1, 'literal motion color rejected');
    await put('src/motion/entrance.ts', motion);
    await put('src/scenes/Scene.tsx', scene + `\nexport const badColor = ${literal};`);
    run(1, 'literal scene color rejected');
    await put('src/scenes/Scene.tsx', scene);
  }
  await put('src/App.tsx', `import { Scene } from './scenes/Scene'; export function App() { return <Scene />; }`);
  run(1, 'product cannot import scene implementation directly');
  await put('src/App.tsx', product);
  for (const forbidden of [
    "import { animate } from 'motion';",
    "export { Canvas } from '@react-three/fiber';",
    "const scene = import('three');",
    "const gsap = require('gsap');",
    'requestAnimationFrame(() => {});',
    'window.requestAnimationFrame(() => {});',
    "document.body.style.opacity = '1';",
  ]) {
    await put('src/system/Hero.tsx', system + '\n' + forbidden);
    run(1, 'ordinary system entry has no visual permissions');
  }
  await put('src/system/Hero.tsx', system);
  config.motionEntries = 'src/motion';
  await configure();
  run(2, 'invalid optional entry shape rejected');
  config.motionEntries = ['src/motion'];
  config.sceneEntries = ['generated'];
  await configure();
  run(2, 'visual entries must remain inside sources');
  delete config.motionEntries;
  delete config.sceneEntries;
  await configure();
  await put('src/motion/entrance.ts', 'export const available = true;');
  await put('src/scenes/Scene.tsx', 'export const Scene = () => <div />;');
  run(0, 'optional entries preserve old config');
  console.log(`Guard fixture: ${cases} cases passed.`);
} finally {
  await rm(root, { recursive: true, force: true });
}
