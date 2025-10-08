// eslint.config.cjs
const tsPlugin = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");
const angularPlugin = require("@angular-eslint/eslint-plugin");
const angularTemplatePlugin = require("@angular-eslint/eslint-plugin-template");
const prettierPlugin = require("eslint-plugin-prettier");

module.exports = [
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ["tsconfig.app.json", "tsconfig.spec.json"], // <- use the real files
        tsconfigRootDir: process.cwd(),
        sourceType: "module"
      }
    },
    plugins: {
      "@angular-eslint": angularPlugin,
      "@typescript-eslint": tsPlugin,
      prettier: prettierPlugin
    },
    rules: {
      "@angular-eslint/component-selector": [
        "error",
        { type: "element", prefix: "app", style: "kebab-case" }
      ],
      "@angular-eslint/directive-selector": [
        "error",
        { type: "attribute", prefix: "app", style: "camelCase" }
      ],
      "@angular-eslint/no-empty-lifecycle-method": "warn",
      "@angular-eslint/use-lifecycle-interface": "warn",
      "@angular-eslint/use-pipe-transform-interface": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/explicit-function-return-type": "off",
      "prettier/prettier": ["error"]
    }
  },
  {
    files: ["**/*.html"],
    languageOptions: {
      parser: require("@angular-eslint/template-parser")
    },
    plugins: {
      "@angular-eslint/template": angularTemplatePlugin
    },
    rules: {
      "@angular-eslint/template/no-negated-async": "error"
    }
  }
];
