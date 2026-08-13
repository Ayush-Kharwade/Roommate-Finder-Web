import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

// Flat config for ESLint 8.57 (the version pinned in client/package.json).
// The previous version imported `defineConfig`/`globalIgnores` from
// 'eslint/config', which only exists in ESLint 9 — `npm run lint` crashed
// before linting a single file.
export default [
  {
    ignores: ['**/dist/**', '**/node_modules/**', 'client/public/**', 'public/**'],
  },

  // ---- browser code: the React client ----
  {
    files: ['client/src/**/*.{js,jsx}'],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // The new JSX transform means React need not be in scope, and prop-types
      // are not used anywhere in this codebase.
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',

      // Apostrophes in ordinary prose ("You're offline") are fine in JSX text;
      // this rule only produces noise here.
      'react/no-unescaped-entities': 'off',

      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', args: 'after-used' }],
    },
  },

  // ---- Node code: the Express server and its scripts ----
  {
    files: ['server/**/*.js'],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node,
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', args: 'after-used' }],
    },
  },
]
