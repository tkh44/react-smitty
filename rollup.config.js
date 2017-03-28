import buble from 'rollup-plugin-buble'

export default {
  useStrict: false,
  plugins: [buble()],
  globals: {
    react: 'React',
    smitty: 'smitty'
  }
}
