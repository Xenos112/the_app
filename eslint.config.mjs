import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: {
    tsconfigPath: 'tsconfig.json',
  },
  rules: {
    'node/prefer-global/process': 'off',
    'ts/no-unsafe-call': 'off',
    'ts/no-unsafe-member-access': 'off',
    'no-console': 'warn',
    'ts/no-unsafe-argument': 'off',
    'test/consistent-test-it': 'off',
  },
})
