import neostandard, { plugins } from 'neostandard'

export default [
  ...neostandard(),
  plugins.n.configs['flat/recommended'],
  {
    rules: {
      'object-shorthand': 'off'
    }
  }
]