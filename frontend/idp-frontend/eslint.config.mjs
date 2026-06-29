// @ts-check
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import angularPlugin from '@angular-eslint/eslint-plugin';
import angularTemplatePlugin from '@angular-eslint/eslint-plugin-template';
import angularTemplateParser from '@angular-eslint/template-parser';
import boundariesPlugin from 'eslint-plugin-boundaries';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Boundary rules enforce the clean layered architecture:
 *   core    → nothing internal
 *   shared  → core only
 *   features → core + shared only
 */
const ELEMENTS = [
  { type: 'core', pattern: 'src/app/core/**' },
  { type: 'shared', pattern: 'src/app/shared/**' },
  { type: 'features', pattern: 'src/app/features/**/*' },
  { type: 'layout', pattern: 'src/app/layout/**' },
  { type: 'pages', pattern: 'src/app/pages/**' },
];

export default [
  // ── TypeScript source files ──────────────────────────────────────────────
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ['./tsconfig.app.json', './tsconfig.spec.json'],
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      '@angular-eslint': angularPlugin,
      'boundaries': boundariesPlugin,
    },
    settings: {
      'boundaries/elements': ELEMENTS,
      'boundaries/include': ['src/**/*'],
    },
    rules: {
      // TypeScript recommended rules (subset — avoid strict overrides)
      'no-console': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-non-null-assertion': 'warn',

      // Angular rules
      '@angular-eslint/prefer-standalone': 'error',
      '@angular-eslint/no-empty-lifecycle-method': 'error',
      '@angular-eslint/use-lifecycle-interface': 'error',
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'idp', style: 'kebab-case' }
      ],
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'idp', style: 'camelCase' }
      ],

      // Boundaries — enforce layered architecture
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            { from: 'core', allow: [] },
            { from: 'shared', allow: ['core'] },
            { from: 'features', allow: ['core', 'shared'] },
            { from: 'layout', allow: ['core', 'shared'] },
            { from: 'pages', allow: ['core', 'shared'] },
          ],
        },
      ],
    },
  },

  // ── Angular HTML templates ────────────────────────────────────────────────
  {
    files: ['src/**/*.html'],
    languageOptions: {
      parser: angularTemplateParser,
    },
    plugins: {
      '@angular-eslint/template': angularTemplatePlugin,
    },
    rules: {
      '@angular-eslint/template/banana-in-box': 'error',
      '@angular-eslint/template/no-negated-async': 'error',
    },
  },

  // ── Test files — relax some rules ─────────────────────────────────────────
  {
    files: ['src/**/*.spec.ts', 'setup-jest.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'boundaries/element-types': 'off',
    },
  },

  // ── Ignored paths ─────────────────────────────────────────────────────────
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', '*.js', '*.mjs'],
  },
];
