# 数据层与 API

本项目现在包含完整数据层：

- `server/`：Node API 服务，使用 Node 内置 SQLite，把数据持久化到 `data/hangzhou.sqlite`。
- `src/services/api.ts`：前端 API 边界。设置 `VITE_API_BASE_URL` 时走后端；未设置时使用 `localStorage` 兜底。
- `database/schema.sql`：MySQL 8 建库脚本，用于数据库课程设计说明和后续迁移。

## 运行

```bash
npm install
npm run dev
```

前端 Vite 默认运行在 `http://localhost:5173`。

完整模式：

```bash
npm run dev:full
```

完整模式会同时启动前端和 `http://localhost:3001/api`，前端数据来自 SQLite 数据库。

## 技术点

- Vue 3 组合式 API：页面和组件使用 `<script setup>`、`ref`、`reactive`、`computed`、`watch` 和生命周期钩子。
- TypeScript：景点、票种、时段、订单、游客档案等核心数据都有类型定义。
- Vue Router：使用 hash 模式，包含静态路由、动态路由、重定向、编程式导航、路由元信息和 404 页面。
- Pinia：项目已接入 Pinia，并提供 `useCatalogStore` 作为目录数据仓库示例。
- Node API + SQLite：后台 CRUD、预约下单、订单核销、取消、账号维护、审计日志和重置会写入 SQLite。
- localStorage 兜底：无后端时仍能使用同一套前端页面和服务函数。

## 数据表

- `user_accounts`：后台管理员与普通用户账号，包含角色、状态和密码哈希。
- `scenic_spots`：景点主数据。
- `ticket_types`：景点票种和价格。
- `booking_slots`：可预约日期、时段、基础容量。
- `booking_orders`：用户提交的预约订单、核销码、状态。
- `audit_logs`：新增、修改、删除、核销、重置等关键写操作日志。

订单状态只允许：

- `待出行`
- `已完成`
- `已取消`

## API 函数

### 景点

- `fetchScenicSpots()`：景点列表。
- `fetchScenicSpot(id)`：单个景点详情。
- `createScenicSpot(input)`：新增景点。
- `updateScenicSpot(id, input)`：修改景点。
- `deleteScenicSpot(id)`：删除景点，存在未取消订单时会拒绝删除。

### 票种

- `fetchTicketTypes(scenicSpotId?)`：票种列表，可选景点过滤。
- `createTicketType(input)`：新增票种。
- `updateTicketType(id, input)`：修改票种。
- `deleteTicketType(id)`：删除票种。

### 预约时段

- `fetchBookingSlots(scenicSpotId?)`：返回实时余量，包含 `booked`、`localBooked`、`remaining`。
- `createBookingSlot(input)`：新增时段，同景点、同日期、同时段不能重复。
- `updateBookingSlot(id, input)`：调整日期、时段、容量、基础占用。
- `deleteBookingSlot(id)`：删除时段，存在未取消订单时会拒绝删除。

### 订单

- `fetchOrders()`：订单列表。
- `createBookingOrder(payload)`：提交预约，并自动校验、占用余量、计算金额。
- `updateOrderStatus(id, status)`：核销、取消或恢复订单。
- `deleteOrder(id)`：硬删除订单记录。

### 账号与审计

- `fetchUserAccounts()`：账号列表。
- `createUserAccount(input)`：新增账号。
- `updateUserAccount(id, input)`：修改账号角色、状态、联系方式或密码。
- `deleteUserAccount(id)`：删除账号，最后一个启用管理员不可删除。
- `fetchAuditLogs()`：最近操作日志。

### 运维

- `resetOrders()`：把订单表恢复为种子数据。
- `resetDatabase()`：把景点、票种、时段、订单、账号和审计日志恢复为种子数据。

## 后续接真实后端

当前完整模式已经具备后端 API 和 SQLite 数据库。后续如果接 Express、Spring Boot、MySQL 或 Supabase，建议保持 `src/services/api.ts` 的函数签名不变，只替换 API 地址和后端持久化实现。数据库逻辑和 MySQL 表结构见 [database-design.md](database-design.md) 与 [../database/schema.sql](../database/schema.sql)。
