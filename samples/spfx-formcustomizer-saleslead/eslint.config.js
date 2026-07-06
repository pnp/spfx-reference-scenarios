const spfxProfile = require('@microsoft/eslint-config-spfx/lib/flat-profiles/react');

module.exports = [
  ...spfxProfile,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: './tsconfig.json'
      }
    },
    rules: {
      // Allow `void somePromise()` to intentionally mark a floating promise as ignored,
      // which @typescript-eslint/no-floating-promises requires.
      'no-void': ['warn', { allowAsStatement: true }]
    }
  }
];
