/* eslint-disable */

/// <reference types="vite/client" />

// Mocks all files ending in `.vue` showing them as plain Vue instances
declare module "*.vue" {
  import type { DefineComponent } from "vue"
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Make $t globally available in Vue components
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $t: (key: string, params?: any) => string
  }
}

// Global $t function
declare global {
  var $t: (key: string, params?: any) => string
}
