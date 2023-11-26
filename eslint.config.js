// noinspection JSUnusedGlobalSymbols

import antfu from '@antfu/eslint-config'

export default await antfu(
  {},
  {
    files: ['**/*.js', '**/*.ts', '**/*.vue'],
    rules: {
      'import/order': [
        'error',
        {
          'groups': [
            'index',
            'sibling',
            'parent',
            'internal',
            'external',
            'builtin',
            'object',
            'unknown',
            'type',
          ],
          'newlines-between': 'always',
          'alphabetize': {
            order: 'asc',
          },
        },
      ],
    },
  },
  {
    files: ['**/*.vue'],
    rules: {
      'vue/max-attributes-per-line': [
        'error',
        {
          singleline: 1,
          multiline: 1,
        },
      ],
    },
  },
)
