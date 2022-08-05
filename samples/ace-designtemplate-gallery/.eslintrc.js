require('@rushstack/eslint-config/patch/modern-module-resolution');
  module.exports = {
    extends: ['@microsoft/eslint-config-spfx/lib/profiles/react'],
    parserOptions: { tsconfigRootDir: __dirname },
    rules: {
      "@microsoft/spfx/no-async-await": 0,
      "@typescript-eslint/naming-convention": 0,
      "@typescript-eslint/typedef": 0,
      "@typescript-eslint/no-parameter-properties": [1, {
        allows: ["public"]
      }],
      "accessor-pairs": 0,
      "eqeqeq": 0,
      "@typescript-eslint/consistent-type-assertions": 0,
      "promise/param-names": 0,
      "@typescript-eslint/explicit-member-accessibility": 0,
      "@typescript-eslint/explicit-function-return-type": 0,
      "@typescript-eslint/no-explicit-any": 0,
      "@typescript-eslint/no-floating-promises": 0,
      "react/jsx-no-bind": 0,
      "@typescript-eslint/no-non-null-assertion": 0,
      "@typescript-eslint/no-var-requires": 0,
    }
  };
