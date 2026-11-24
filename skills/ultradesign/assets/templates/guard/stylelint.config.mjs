const ruleName = 'ultradesign/token-styles';
const globalKeywords = new Set(['inherit', 'initial', 'unset', 'revert', 'revert-layer']);
const pixelSize = /^[+-]?(?:\d*\.?\d+)(?:e[+-]?\d+)?px$/i;

export function createStylelintConfig({
  stylelint, parseValue, fontFamilies, fontSizes, namespaces, fontFaces,
}) {
  const generatedName = (name) => name.startsWith('--') && namespaces.has(name.slice(2).split('-')[0]);
  const rule = (enabled) => (root, result) => {
    if (!stylelint.utils.validateOptions(result, ruleName, { actual: enabled, possible: [true] })) return;
    const reject = (node, message) => stylelint.utils.report({ ruleName, result, node, message });

    root.walkDecls((decl) => {
      if (generatedName(decl.prop)) {
        reject(decl, 'Do not redeclare generated token namespaces outside the configured tokens stylesheet.');
      }
    });
    root.walkAtRules(/^property$/i, (node) => {
      if (generatedName(node.params.trim())) {
        reject(node, 'Do not register generated token namespaces outside the configured tokens stylesheet.');
      }
    });

    root.walkDecls(/^(?:font|font-size|font-family)$/i, (decl) => {
      const property = decl.prop.toLowerCase();
      const lowerValue = decl.value.trim().toLowerCase();
      if (globalKeywords.has(lowerValue)) return;
      const value = parseValue(decl.value);

      if (property === 'font') {
        reject(decl, 'Use font longhands with generated typography tokens instead of the font shorthand.');
        return;
      }
      if (property === 'font-family') {
        const inFontFace = decl.parent.type === 'atrule' && decl.parent.name.toLowerCase() === 'font-face';
        if (inFontFace && fontFaces.has(lowerValue.replace(/^(['"])(.*)\1$/, '$2'))) return;
        const [token, ...rest] = value.nodes.filter((node) => node.type !== 'space' && node.type !== 'comment');
        if (token?.type === 'function' && token.value.toLowerCase() === 'var' && !rest.length
            && fontFamilies.has(parseValue.stringify(token.nodes).trim())) return;
        reject(decl, 'Use exactly one generated font-family token, without a custom fallback.');
        return;
      }
      value.walk((node) => {
        if (node.type === 'word' && pixelSize.test(node.value)) {
          reject(decl, 'Replace raw px font sizes with generated typography tokens.');
        }
        if (node.type === 'function' && node.value.toLowerCase() === 'var') {
          const variable = node.nodes.find((child) => child.type !== 'space' && child.type !== 'comment');
          if (!fontSizes.has(variable?.value)) reject(decl, 'Font size variables must come from the generated type scale.');
        }
      });
    });
  };

  return {
    plugins: [stylelint.createPlugin(ruleName, rule)],
    rules: {
      'color-no-hex': true,
      'function-disallowed-list': [/^rgba?$/i, /^hsla?$/i],
      [ruleName]: true,
    },
  };
}
