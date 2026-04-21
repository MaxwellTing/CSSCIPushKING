# Research & Life OS

一个结合了"科研管理、压力激励、生活习惯跟踪"的个人门户，设计风格遵循 iOS/macOS 毛玻璃极简风。

## 功能特性

### 📚 科研冲刺区 (Academic Widget)
- 今日学术任务清单 + 进度条
- 博士申请/毕业倒计时
- 字数计数器
- 文献阅读记录
- 早中晚三段式学习时间记录

### 💧 健康状态区 (Vitality Widget)
- 八杯水追踪（上午4杯 + 下午4杯）
- Apple Watch 风格健身圆环
- 预设生活标签（#力量训练、#有氧、#羽毛球等）

### 💡 科研灵感区 (Mind Flow)
- 毛玻璃浮窗快速记录学术闪念
- 预设科研标签（#文献阅读、#田野调查等）

### ⏱️ 番茄钟
- 45分钟专注计时
- 到时提醒喝水/拉伸

### ✨ 视觉效果
- 动态流体背景（根据科研进度变色）
- 达成目标时粒子喷泉特效
- 深色/浅色模式切换
- iOS/macOS 毛玻璃极简风格

### ☁️ 数据同步
- LocalStorage 本地缓存
- GitHub API 跨设备同步

## 快速开始

### 1. 安装依赖

```bash
bun install
# 或
npm install
```

### 2. 启动开发服务器

```bash
bun run dev
# 或
npm run dev
```

### 3. 构建生产版本

```bash
bun run build
# 或
npm run build
```

## GitHub 同步配置

1. **创建 GitHub Personal Access Token**
   - 访问 https://github.com/settings/tokens/new
   - 勾选 `repo` 权限
   - 生成并复制 Token

2. **在应用中配置**
   - 点击右上角设置按钮
   - 输入 Token 和仓库地址（格式：`username/repo`）
   - 保存配置

3. **数据将自动同步到 `data.json` 文件**

## GitHub Pages 部署

### 方法一：GitHub Actions 自动部署

1. 在仓库中创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
      
      - name: Install dependencies
        run: bun install
      
      - name: Build
        run: bun run build
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./out

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

2. 修改 `next.config.ts`：

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/your-repo-name', // 替换为你的仓库名
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

3. 在 GitHub 仓库设置中启用 GitHub Pages，选择 "GitHub Actions" 作为源。

### 方法二：手动部署

```bash
# 构建
bun run build

# 将 out 目录内容推送到 gh-pages 分支
```

## 技术栈

- **框架**: Next.js 16 + React 19
- **样式**: Tailwind CSS 4
- **动画**: Framer Motion
- **图标**: Lucide Icons
- **状态管理**: Zustand
- **UI组件**: shadcn/ui

## 项目结构

```
src/
├── app/
│   ├── api/sync/route.ts    # GitHub API 同步路由
│   ├── page.tsx             # 主页面
│   ├── layout.tsx           # 布局文件
│   └── globals.css          # 全局样式
├── components/
│   ├── features/
│   │   ├── FluidBackground.tsx   # 动态流体背景
│   │   ├── ParticleFountain.tsx  # 粒子喷泉特效
│   │   ├── AcademicWidget.tsx    # 科研冲刺区
│   │   ├── VitalityWidget.tsx    # 健康状态区
│   │   ├── MindFlowWidget.tsx    # 科研灵感区
│   │   ├── PomodoroTimer.tsx     # 番茄钟
│   │   └── SettingsPanel.tsx     # 设置面板
│   └── ui/                       # shadcn/ui 组件
└── store/
    └── useAppStore.ts            # Zustand 状态管理
```

## 许可证

MIT License
