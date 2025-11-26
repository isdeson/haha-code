declare module 'vite-plugin-semi-theme' {
  import { Plugin } from 'vite'

  interface SemiThemeOptions {
    theme?: string
  }

  function SemiPlugin(options?: SemiThemeOptions): Plugin

  export default SemiPlugin
}
