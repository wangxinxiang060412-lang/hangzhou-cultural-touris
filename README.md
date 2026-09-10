# 杭州文旅

杭州文旅是一个基于 Vue 3、TypeScript、Vite、Vue Router、Pinia、Node API 和 SQLite 的杭州城市文旅票务预约系统，包含景点导览、票务预约、城市通票、活动日历、街区探索、路线规划、订单中心、后台管理、账号权限、操作审计与数据恢复等模块。

项目支持两种运行方式：

- 完整模式：前端连接 `server/` 中的 Node API，数据写入 `data/hangzhou.sqlite`。
- 兜底模式：只运行前端时，`src/services/api.ts` 会使用 `localStorage` 模拟同一套接口，方便快速预览和静态部署。

## 本地开发

```bash
npm install
npm run dev
```

前端默认运行在 `http://localhost:5173`。

## 完整项目运行

```bash
npm run dev:full
```

该命令会同时启动：

- 前端：`http://localhost:5173/hangzhou-cultural-touris/`
- 后端 API：`http://localhost:3001/api`
- SQLite 数据库：`data/hangzhou.sqlite`

也可以单独启动后端：

```bash
npm run server
```

## 构建

```bash
npm run build
```

## 主要功能

- 首页：杭州文旅门户、季节推荐、实时天气摘要、活动与预约入口。
- 景点：检索、分类筛选、详情页、运行状态、收藏与想去/已去标记。
- 预约：景点/城市通票选择、时段余量校验、游客信息校验、支付方式选择、核销码生成。
- 订单：预约记录查看、取消、恢复、服务信息与凭证展示。
- 发现：街区、活动日历、主题路线、出行指南。
- 后台：订单核销、景点 CRUD、票种 CRUD、时段 CRUD、账号权限、操作审计、数据恢复。
- 数据库：SQLite 本地数据库、MySQL 建库脚本、主外键/唯一/检查约束、时段余量视图设计。

## 课程技术点

- Vue 3 组合式 API 与 `<script setup>`。
- `ref`、`reactive`、`computed`、`watch`、生命周期钩子。
- Vue Router 静态路由、动态路由、重定向、编程式导航和路由元信息。
- Pinia 状态管理，目录数据通过 `useCatalogStore` 提供仓库示例。
- TypeScript 类型建模与异步 API 封装。
- Node API + SQLite 数据库，保留 MySQL 迁移脚本。

更多数据模型说明见 [docs/backend-api.md](docs/backend-api.md) 和 [docs/database-design.md](docs/database-design.md)。MySQL 建库脚本见 [database/schema.sql](database/schema.sql)。
