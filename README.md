# 杭州文旅

杭州文旅是一个基于 Vue 3、TypeScript、Vite 和 Express 的杭州城市文旅门户示例，包含景点导览、票务预约、城市活动、街区探索与后台管理等模块。

## 本地开发

```bash
npm install
npm run dev:full
```

前端默认运行在 `http://localhost:5173`，后端接口默认运行在 `http://localhost:4174`。

## 构建

```bash
npm run build
```

## Render 部署

仓库根目录包含 `render.yaml`，可直接作为 Render Blueprint 使用。部署前请在 Render 中补齐需要的环境变量，例如 `CORS_ORIGINS`。
