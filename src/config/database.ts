export const databaseMeta = {
  name: 'Hangzhou Cultural Tourism Ticketing DB',
  version: 'static-demo-v2',
  persistence: import.meta.env.VITE_API_BASE_URL ? 'Remote API' : 'Browser localStorage',
  storageKey: import.meta.env.VITE_API_BASE_URL ? 'API-managed storage' : 'hangzhou-static-v2:*',
  note: import.meta.env.VITE_API_BASE_URL
    ? '当前前端已连接通过 VITE_API_BASE_URL 配置的远程服务。'
    : 'GitHub Pages 使用纯前端演示数据，修改只保存在当前浏览器。',
}
