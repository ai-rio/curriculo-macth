/** @type {import("prettier").Config} */
const config = {
  plugins: ['prettier-plugin-tailwindcss'],
  singleQuote: true,
  jsxSingleQuote: true,
  semi: true,
  tabWidth: 2,
  bracketSpacing: true,
  jsxBracketSameLine: false,
  arrowParens: 'always',
  printWidth: 120,
  trailingComma: 'es5',
  endOfLine: 'lf',
};

module.exports = config;