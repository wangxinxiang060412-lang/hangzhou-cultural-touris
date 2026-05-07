# 后端数据库与 API

本项目已经从纯前端 mock 预约，升级为可落地的后端 API + SQLite 持久化结构。

## 运行

```bash
npm run dev:full
```

该命令会同时启动：

- 前端 Vite：`http://localhost:5173`
- 后端 API：`http://localhost:4174`
- SQLite 数据库文件：`data/west-lake.sqlite`

如需只启动后端：

```bash
npm run dev:api
```

可选安全配置：

- `ADMIN_TOKEN`：设置后，景点、票种、时段、硬删除、重置等后台写接口必须携带 `x-admin-token`；用户取消订单仍可走公开取消流程。
- `CORS_ORIGINS`：逗号分隔的允许来源，例如 `https://travel.example.gov.cn,https://admin.example.gov.cn`。未设置时保持本地开发友好。
- `VITE_ADMIN_TOKEN`：本地管理端调试时可配置同一个值，前端请求会自动带上 `x-admin-token`。

## 数据表

- `scenic_spots`：景点主数据。
- `ticket_types`：景点票种和价格。
- `booking_slots`：可预约日期、时段、基础容量。
- `booking_orders`：用户提交的预约订单、核销码、状态。

订单状态只允许：

- `待出行`
- `已完成`
- `已取消`

## API

### 基础

- `GET /api/health`：健康检查。
- `GET /api/weather/hangzhou`：杭州天气缓存接口。
- `GET /api/operations/hangzhou`：后端聚合的实时运行状态、客流、临时管制、演出/游船、节假日与天气提醒。

### 景点 `scenic_spots`

- `GET /api/scenic-spots`：景点列表。
- `GET /api/scenic-spots/:id`：单个景点详情。
- `POST /api/scenic-spots`：新增景点（`nameZh` / `nameEn` / `area` / `category` 必填，支持 `tags` 数组、`reservationRequired` / `paid` / `featured`）。
- `PATCH /api/scenic-spots/:id`：部分更新，未提交字段保持原值。
- `DELETE /api/scenic-spots/:id`：删除景点，存在未完成预约时会被拒绝；无活跃订单时会级联删除该景点的票种和时段。

### 票种 `ticket_types`

- `GET /api/ticket-types?scenicSpotId=...`：票种列表，可选景点过滤。
- `POST /api/ticket-types`：新增票种，必须关联存在的景点。
- `PATCH /api/ticket-types/:id`：部分更新价格、名称、适用人群、归属景点。
- `DELETE /api/ticket-types/:id`：删除票种。

### 预约时段 `booking_slots`

- `GET /api/booking-slots?scenicSpotId=...`：返回时段实时余量（包含 `booked`、`localBooked`、`remaining`）。
- `POST /api/booking-slots`：新增时段（同景点 + 日期 + 时段存在时返回 409）。
- `PATCH /api/booking-slots/:id`：调整日期 / 时段 / 容量 / 基础占用。
- `DELETE /api/booking-slots/:id`：删除时段，存在未取消订单时会被拒绝。

### 订单 `booking_orders`

- `GET /api/orders`：订单列表。
- `POST /api/orders`：提交预约，自动计算余量占用。
- `PATCH /api/orders/:id`：在 `待出行 / 已完成 / 已取消` 之间流转状态。
- `DELETE /api/orders/:id`：硬删除订单记录。

### 运维

- `POST /api/admin/reset-orders`：把订单表恢复为种子数据。
- `POST /api/admin/reset-database`：清空并重新写入全部种子（景点 / 票种 / 时段 / 订单）。

## 后续接真实线上数据库

当前 SQLite 方案适合本地演示、作品集部署和小流量原型。后续如果接 Supabase、Neon 或自建 PostgreSQL，建议保持前端 `src/services/api.ts` 与 `src/stores/catalog.ts` 不变，只替换 `server/db.ts` 的数据库驱动和 SQL 方言。
