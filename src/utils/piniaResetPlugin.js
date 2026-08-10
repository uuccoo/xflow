/**
 * Pinia 插件：自动为每个 store 注入 $reset() 方法
 * 在 store 初始化时快照初始 $state，调用 $reset() 即可恢复所有属性到默认值
 */
export default ({ store }) => {
  // 深拷贝保存初始状态
  const initialState = JSON.parse(JSON.stringify(store.$state))

  // 使用函数式 $patch，通过直接赋值保持响应式代理引用不变
  store.$reset = () => {
    store.$patch((state) => {
      const snapshot = JSON.parse(JSON.stringify(initialState))
      for (const key in snapshot) {
        state[key] = snapshot[key]
      }
    })
  }
}
