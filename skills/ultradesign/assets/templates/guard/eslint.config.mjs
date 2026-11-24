import { dirname, extname, isAbsolute, relative, resolve, sep } from 'node:path';

const controls = new Set(['button', 'input', 'select', 'textarea', 'summary']);
const paint = new Set([
  'color', 'fill', 'stroke', 'stopColor', 'floodColor', 'lightingColor',
  'stop-color', 'flood-color', 'lighting-color', 'background', 'backgroundColor', 'borderColor',
]);
const paintKeywords = new Set(['none', 'currentColor', 'transparent', 'inherit']);
const reactPrimitives = new Set(['Fragment', 'StrictMode', 'Suspense', 'Profiler', 'Activity', 'ViewTransition']);
const extensions = ['.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx', '.mts', '.cts'];

function binding(scope, name) {
  for (; scope; scope = scope.upper) {
    const variable = scope.set.get(name);
    if (variable) return variable.defs[0];
  }
}

export function createEslintConfig({ systemEntries, sourceFiles, tokenNames, tsParser }) {
  const files = new Set(sourceFiles);
  const contains = (entry, filename) => {
    if (!entry.directory) return filename === entry.path;
    const path = relative(entry.path, filename);
    return !isAbsolute(path) && path !== '..' && !path.startsWith(`..${sep}`);
  };
  const resolveLocal = (filename, specifier) => {
    if (!specifier.startsWith('.')) return undefined;
    const path = resolve(dirname(filename), specifier);
    const candidates = [path, ...extensions.map((ext) => path + ext),
      ...extensions.map((ext) => resolve(path, `index${ext}`))];
    const extension = extname(path);
    if (['.js', '.jsx', '.mjs', '.cjs'].includes(extension)) {
      const stem = path.slice(0, -extension.length);
      candidates.push(stem + ({ '.js': '.ts', '.jsx': '.tsx', '.mjs': '.mts', '.cjs': '.cts' })[extension]);
    }
    return candidates.find((candidate) => files.has(candidate));
  };
  const systemRule = {
    meta: { schema: [] },
    create(context) {
      const filename = context.filename;
      const inSystem = systemEntries.some((entry) => contains(entry, filename));
      const report = (node, message) => context.report({ node, message });

      return {
        JSXOpeningElement(node) {
          const tag = node.name;
          if (tag.type === 'JSXIdentifier' && tag.name === 'style') {
            report(tag, 'Move embedded styles to a linted CSS file.');
            return;
          }
          if (inSystem) return;
          if (tag.type === 'JSXIdentifier' && /^[a-z]/.test(tag.name)) {
            if (controls.has(tag.name)) report(tag, 'Import controls from a configured system entry.');
            if (tag.name.includes('-')) report(tag, 'Import reusable UI from a configured system entry.');
            return;
          }

          let root = tag;
          const members = [];
          while (root.type === 'JSXMemberExpression') {
            members.unshift(root.property.name);
            root = root.object;
          }
          const def = root.type === 'JSXIdentifier'
            ? binding(context.sourceCode.getScope(node), root.name) : undefined;
          let specifier;
          let imported;
          let namespace = false;
          let defaultImport = false;
          if (def?.type === 'ImportBinding') {
            const moduleReference = def.node.moduleReference ?? def.parent?.moduleReference;
            specifier = def.parent?.source?.value ?? moduleReference?.expression?.value;
            if (typeof specifier !== 'string') return;
            imported = def.node.imported?.name ?? def.node.imported?.value;
            namespace = def.node.type === 'ImportNamespaceSpecifier'
              || moduleReference?.type === 'TSExternalModuleReference';
            defaultImport = def.node.type === 'ImportDefaultSpecifier';
          } else if (def?.type === 'Variable') {
            let init = def.node.init;
            if (init?.type === 'MemberExpression') {
              imported = init.computed ? init.property.value : init.property.name;
              init = init.object;
            }
            if (init?.type !== 'CallExpression' || init.callee.name !== 'require'
                || typeof init.arguments[0]?.value !== 'string') return;
            specifier = init.arguments[0].value;
            if (def.node.id.type === 'ObjectPattern') {
              const property = def.node.id.properties.find((prop) => prop.value?.name === root.name);
              imported = property?.key?.name ?? property?.key?.value;
            } else {
              namespace = !imported;
            }
          } else {
            return;
          }
          const name = members.length ? members[0] : imported;
          if (specifier === 'react' && reactPrimitives.has(name)
              && (members.length === 0 || ((namespace || defaultImport) && members.length === 1))) return;
          if (specifier === '@a2ui/react' && name === 'A2uiSurface'
              && ((!members.length && imported === 'A2uiSurface') || (namespace && members.length === 1))) return;
          const target = resolveLocal(filename, specifier);
          if (target && systemEntries.some((entry) => contains(entry, target))) return;
          report(tag, 'Import reusable UI directly from a configured system entry.');
        },
        JSXAttribute(node) {
          if (node.name.type !== 'JSXIdentifier') return;
          const name = node.name.name;
          if (name === 'style' || name === 'fontSize' || name === 'fontFamily'
              || name === 'font-size' || name === 'font-family') {
            report(node, 'Move typography and inline styles to linted, tokenized CSS.');
            return;
          }
          if (!paint.has(name)) return;
          const value = node.value?.type === 'JSXExpressionContainer' ? node.value.expression : node.value;
          const text = typeof value?.value === 'string' ? value.value.trim() : undefined;
          if (text && (paintKeywords.has(text) || /^url\(#[\w-]+\)$/.test(text))) return;
          const token = text?.match(/^var\(\s*(--color-[\w-]+)\s*\)$/)?.[1];
          if (token && tokenNames.has(token)) return;
          report(node, 'Use a generated color token or currentColor for JSX paint.');
        },
        JSXSpreadAttribute(node) {
          if (!inSystem) report(node, 'Pass props explicitly so inline styling can be checked.');
        },
        MemberExpression(node) {
          const name = node.computed ? node.property.value : node.property.name;
          if (name === 'style') report(node, 'Use CSS classes instead of reading or writing inline styles.');
        },
        CallExpression(node) {
          const callee = node.callee;
          if (callee.name === 'createElement'
              || (callee.type === 'MemberExpression' && (callee.property.name ?? callee.property.value) === 'createElement')) {
            report(node, 'Use JSX so imports and styling can be checked.');
          }
        },
      };
    },
  };

  return [{
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    linterOptions: { noInlineConfig: true },
    plugins: { ultradesign: { rules: { 'system-components': systemRule } } },
    rules: { 'ultradesign/system-components': 'error' },
  }, {
    files: ['**/*.{cjs,cts}'],
    languageOptions: { sourceType: 'commonjs' },
  }, ...(tsParser ? [{
    files: ['**/*.{ts,tsx,mts,cts}'],
    languageOptions: { parser: tsParser },
  }] : [])];
}
