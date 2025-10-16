declare module '*.vue' {
  import type { DefineComponent } from '@vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// declare module '@vue/runtime-core' {
//   export interface ComponentCustomProperties {
//     $t: (key: string, ...args: any[]) => string
//   }
// }

// 添加Vue模块的类型声明
// declare module 'vue' {
//   export * from '@vue/runtime-core'
//   export * from '@vue/reactivity'
// }