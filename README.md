# DingLab气象研究中心综合信息服务平台

基于 React + Vite + TypeScript 重建的气象信息集成系统。

## 技术栈

- React 18
- Vite 5
- TypeScript
- react-router-dom

## 功能特性

- 顶部 Header 显示标题和实时时间
- 左侧导航菜单（支持折叠/展开）
- 右侧 iframe 内容区域
- 本地页面和外部网站混合导航
- 外部链接在新标签页打开
- 管理员后台（导航管理）
- 密码修改功能

## 后台修改分类及链接后的同步说明

导航数据有两套并行的展示通道，后台修改后需按以下规则同步：

### 数据流

```
src/data/navData.json（运行时数据源，后台编辑）
        ↓
   ┌────────────────────┴─────────────────────┐
   ↓ React 动态 Sidebar                     ↓ 静态 HTML
src/components/Sidebar.tsx              public/wap.html
   （实时读取，无需手动同步）              （需手动同步）
```

### 需要关注的文件

| 文件 | 是否需同步 | 说明 |
|---|---|---|
| `src/data/navData.json` | — | 后台编辑的数据源，修改起点 |
| `public/wap.html` | ✅ 需要 | 静态菜单页，需同步分类与链接 |
| `public/pc.html` | ❌ 无需 | 通过 `<frame>` 引用 wap.html，自动同步 |
| `public/dh.html` | ❌ 无需 | 页头，不含分类链接 |
| `dist/wap.html` | ❌ 无需 | 构建产物，已被 .gitignore 排除 |
| `public/` 子目录下其他 HTML | ❌ 无需 | 具体内容页，不含导航菜单 |

### 同步步骤

1. **新增分类或新增链接**：运行同步脚本即可
   ```bash
   npm run sync-wap
   ```
   脚本（`scripts/sync-wap-html.mjs`）会按分类名匹配合并，保留 wap.html 原有链接，追加 navData.json 中的新内容，并备份原文件为 `wap.html.bak`。

2. **修改已有链接的 URL**：脚本不会更新（只追加不覆盖），需手动编辑 `public/wap.html` 中对应行的 `href`。

3. **删除分类或删除链接**：脚本不会删除（只追加不删减），需手动编辑 `public/wap.html` 删除对应行。

> 简而言之：`npm run sync-wap` 只能处理"新增"场景；"修改 URL"和"删除项"必须手动编辑 `public/wap.html`。

## 安装步骤

```bash
npm install
npm run dev
```

## 构建命令

```bash
npm run build
```

## 预览命令

```bash
npm run preview
```