import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // 核心：告诉 Next.js 导出为纯静态文件
  basePath: '/CSSCIPushKING', // ⚠️警告：把 your-repo-name 换成你等下在 GitHub 上建的仓库名字！比如叫 my-os，就写 '/my-os'
  images: {
    unoptimized: true, // 静态导出不支持图片优化，必须关掉
  },
};

export default nextConfig;
