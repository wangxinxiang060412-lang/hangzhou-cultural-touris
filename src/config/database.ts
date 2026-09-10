export const databaseMeta = {
  name: 'Hangzhou Cultural Tourism Ticketing DB',
  version: 'schema-v3',
  persistence: 'SQLite API',
  storageKey: 'data/hangzhou.sqlite',
  note: '完整模式使用 Node API + SQLite 本地数据库。前端不再保存业务种子数据，MySQL 迁移脚本位于 database/schema.sql。',
}
