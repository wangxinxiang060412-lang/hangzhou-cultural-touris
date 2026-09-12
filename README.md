# 杭州文旅 · 前端展示站

一个基于 Vue 3、TypeScript、Vite、Vue Router 与 Pinia 的杭州城市文旅体验原型。

## 在线浏览

[打开 GitHub Pages 展示站](https://wangxinxiang060412-lang.github.io/hangzhou-cultural-touris/)

线上版本是纯前端静态站点，不上传或依赖任何后端、数据库与服务端密钥。景点、票务、天气、账号和预约使用内置演示数据；交互产生的数据只保存在访客自己的浏览器 `localStorage` 中。

演示账号：

- 管理员：`admin` / `123456`
- 普通游客：`traveler` / `123456`

## 本地开发

```bash
npm ci
npm run dev
```

## 构建

```bash
npm run build
npm run preview
```

推送到 `main` 后，GitHub Actions 会自动构建并发布 `dist/` 到 GitHub Pages。站点使用 Hash Router，因此二级页面刷新也能在 GitHub Pages 正常打开。

## 主要页面

- 首页：城市门户、四季内容、街区、活动与路线推荐
- 景点与城市通票：检索、筛选、详情与票务信息
- 预约与订单：演示登录、预约、取消与浏览器本地保存
- 运营管理：演示景点、票种、时段、账号及审计管理

> 本项目为杭州文旅形象与预约服务原型，价格、政策、天气与联系方式仅作界面演示。
