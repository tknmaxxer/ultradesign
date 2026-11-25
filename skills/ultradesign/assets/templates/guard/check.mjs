import { readFile, readdir, realpath, stat } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { extname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createEslintConfig } from './eslint.config.mjs';
import { createStylelintConfig } from './stylelint.config.mjs';

const scripts = new Set(['.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx', '.mts', '.cts']);
const typescript = new Set(['.ts', '.tsx', '.mts', '.cts']);
const unsupported = new Set(['.scss', '.sass', '.less', '.styl', '.vue', '.svelte', '.astro', '.mdx']);

async function check(app) {
  const cwd = await realpath(app);
  const config = JSON.parse(await readFile(join(cwd, 'ud-guard.config.json'), 'utf8'));
  if (!config || typeof config !== 'object' || Array.isArray(config)
      || typeof config.tokens !== 'string' || !config.tokens.trim()
      || typeof config.sources !== 'string' || !config.sources.trim()
      || !Array.isArray(config.systemEntries) || !config.systemEntries.length
      || config.systemEntries.some((entry) => typeof entry !== 'string' || !entry.trim())
      || ['motionEntries', 'sceneEntries'].some((key) => config[key] !== undefined
        && (!Array.isArray(config[key]) || config[key].some((entry) => typeof entry !== 'string' || !entry.trim())))
      || !Array.isArray(config.fontFaces)
      || config.fontFaces.some((font) => typeof font !== 'string' || !font.trim())) {
    throw new Error('ud-guard.config.json requires tokens, sources, systemEntries and fontFaces; see guard/README.md.');
  }

  const inside = (root, file) => {
    const path = relative(root, file);
    return !isAbsolute(path) && path !== '..' && !path.startsWith(`..${sep}`);
  };
  const localPath = async (path) => {
    const absolute = resolve(cwd, path);
    if (isAbsolute(path) || !inside(cwd, absolute) || await realpath(absolute) !== absolute) {
      throw new Error(`Guard paths must be real, app-relative paths without symlinks: ${path}`);
    }
    return absolute;
  };
  const sourceRoot = await localPath(config.sources);
  const tokensFile = await localPath(config.tokens);
  if (!(await stat(sourceRoot)).isDirectory() || extname(tokensFile) !== '.css'
      || !(await stat(tokensFile)).isFile()) {
    throw new Error('sources must name a directory and tokens must name a CSS file.');
  }
  const entries = { systemEntries: [], motionEntries: [], sceneEntries: [] };
  for (const key of Object.keys(entries)) {
    for (const entry of config[key] ?? []) {
      const path = await localPath(entry);
      const info = await stat(path);
      if (!inside(sourceRoot, path) || (!info.isDirectory() && !scripts.has(extname(path)))) {
        throw new Error(`${key} must be JS/TS files or directories inside sources: ${entry}`);
      }
      entries[key].push({ path, directory: info.isDirectory() });
    }
  }

  const sourceFiles = [];
  async function collect(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isSymbolicLink()) throw new Error(`Source symlinks are not supported: ${path}`);
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === '.git') continue;
        await collect(path);
      } else if (entry.isFile()) {
        if (unsupported.has(extname(path))) throw new Error(`Uncovered source type: ${path}`);
        sourceFiles.push(path);
      }
    }
  }
  await collect(sourceRoot);
  const scriptFiles = sourceFiles.filter((file) => scripts.has(extname(file)));
  if (!scriptFiles.length) throw new Error('No JS/TS application sources were found.');
  const cssFiles = sourceFiles.filter((file) => extname(file) === '.css' && file !== tokensFile);
  const generated = await readFile(tokensFile, 'utf8');
  const tokenNames = new Set([...generated.matchAll(/(--[\w-]+)\s*:/g)].map((match) => match[1]));
  if (!tokenNames.size) throw new Error('The generated tokens stylesheet contains no custom properties.');
  const fontFamilies = new Set([...tokenNames].filter((name) => name.endsWith('-font-family')));
  const fontSizes = new Set([...tokenNames].filter((name) => name.endsWith('-font-size')));
  const namespaces = new Set(['color', 'type', 'space', 'radius', 'motion', 'component']);
  for (const name of tokenNames) namespaces.add(name.slice(2).split('-')[0]);

  const require = createRequire(join(cwd, 'package.json'));
  const load = (name) => import(pathToFileURL(require.resolve(name)).href);
  const stylelintPackage = require.resolve('stylelint/package.json');
  const stylelintMetadata = JSON.parse(await readFile(stylelintPackage, 'utf8'));
  const stylelintEntry = new URL(stylelintMetadata.exports['.'].import.default, pathToFileURL(stylelintPackage));
  const [{ default: stylelint }, { default: parseValue }, eslintApi] =
    await Promise.all([import(stylelintEntry.href), load('postcss-value-parser'), load('eslint')]);
  const tsParser = scriptFiles.some((file) => typescript.has(extname(file)))
    ? (await load('@typescript-eslint/parser')).default : undefined;

  let cssFailed = false;
  if (cssFiles.length) {
    const style = await stylelint.lint({
      cwd,
      files: cssFiles,
      config: createStylelintConfig({
        stylelint, parseValue, fontFamilies, fontSizes, namespaces,
        fontFaces: new Set(config.fontFaces.map((font) => font.trim().toLowerCase())),
      }),
      ignoreDisables: true,
      ignorePath: [],
      ignoreFiles: [],
      formatter: 'string',
    });
    if (style.results.filter((file) => !file.ignored).length !== cssFiles.length) {
      throw new Error('Stylelint did not check every application stylesheet.');
    }
    if (style.report) process.stderr.write(style.report);
    cssFailed = style.errored || style.results.some((file) => file.warnings.length);
  }

  const eslint = new eslintApi.ESLint({
    cwd,
    overrideConfigFile: true,
    ignore: false,
    overrideConfig: createEslintConfig({ ...entries, sourceFiles, tokenNames, tsParser }),
  });
  const results = await eslint.lintFiles(scriptFiles);
  const output = (await eslint.loadFormatter('stylish')).format(results);
  if (output) process.stderr.write(output);
  return cssFailed || results.some((result) => result.errorCount || result.warningCount);
}

try {
  const app = process.argv[2];
  if (!app || process.argv.length !== 3) throw new Error('Usage: node guard/check.mjs <app-dir>');
  if (await check(resolve(app))) process.exitCode = 1;
} catch (error) {
  console.error(error.message);
  process.exitCode = 2;
}
