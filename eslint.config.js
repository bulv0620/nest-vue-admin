// @ts-check
import prettier from 'eslint-plugin-prettier'

export default [
  {
    ignores: [
      '.DS_Store',
      'node_modules/',
      'dist/',
      'dist-ssr/',
      'build/',
      '*.local',
      '.npmrc',
      'coverage/',
      '.nyc_output/',
      '.temp/',
      '.tmp/',
      'pnpm-lock.yaml',
    ],
  },
  {
    plugins: {
      prettier,
    },
    rules: {
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },
]
