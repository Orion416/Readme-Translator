# README 翻译器

> AI 驱动的 Markdown 翻译工具，完美保留文档结构与格式

[English](docs/README_EN.md) | 简体中文

## 产品简介

README 翻译器是一款使用大模型的文档翻译工具，能够将 GitHub 项目的 README 文档翻译成多种语言，同时**完整保留**原文的 Markdown 格式、代码块、链接和引用结构。

---

## 界面预览

![UI 界面](docs/images/UI.png)

---

## 使用案例

![图片1](docs/images/example_1.png)

![图片2](docs/images/example_2.png)

![图片3](docs/images/example_3.png)

---

## 功能特性

| 特性 | 说明 |
|------|------|
| 多模型支持 | OpenAI、Anthropic Claude、智谱 AI、OpenRouter、Ollama（本地） |
| 结构保留 | 标题层级、代码块、表格、链接、图片等格式完整保留 |
| 引用保护 | 学术引用如 `[1]`、`[Smith et al., 2020]` 保持不变 |
| GitHub 集成 | 直接输入 GitHub 链接即可获取 README |
| 实时预览 | 原文与译文并排对比，实时查看翻译进度 |
| 主题切换 | 支持浅色/深色主题，自动跟随系统设置 |
| 多语言界面 | 支持中文和英文界面 |

## 支持的翻译语言

简体中文、繁体中文、日语、韩语、西班牙语、法语、德语、葡萄牙语、俄语、阿拉伯语

---

## 快速开始

### 1. 安装依赖

```bash
git clone https://github.com/Orion416/Readme-Translator.git
cd Readme-Translator
npm install
```

### 2. 配置环境变量

复制环境变量模板并填入你的 API 密钥：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# 至少配置一个 AI 提供商
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
ZHIPU_API_KEY=...
OPENROUTER_API_KEY=sk-or-...
OLLAMA_BASE_URL=http://127.0.0.1:11434

# 可选：提高 GitHub API 请求限制
GITHUB_TOKEN=ghp_...

```

### 3. 启动服务

```bash
npm run dev
```

打开浏览器访问 http://localhost:3000

---

## 使用指南

### 方式一：翻译 GitHub 项目 README

1. 选择 **GitHub 链接** 标签页
2. 输入 GitHub 仓库地址，例如：
   - 仓库首页：`https://github.com/vercel/next.js`
   - 指定文件：`https://github.com/vercel/next.js/blob/canary/readme.md`
3. 点击 **获取** 按钮拉取 README 内容
4. 选择**目标语言**和 **AI 提供商**
5. 点击 **AI 翻译** 开始翻译

### 方式二：粘贴文本翻译

1. 选择 **粘贴文本** 标签页
2. 将 Markdown 内容粘贴到文本框
3. 选择**目标语言**和 **AI 提供商**
4. 点击 **AI 翻译** 开始翻译

### 导出翻译结果

- **下载**：将译文保存为 `.md` 文件
- **复制**：一键复制到剪贴板

---

## 项目结构

```
src/
├── app/                    # Next.js 页面与 API
│   ├── api/
│   │   ├── fetch-readme/   # GitHub README 获取
│   │   ├── providers/      # 提供商状态检查
│   │   ├── translate/      # 翻译接口（流式）
│   │   └── validate/       # 结构验证
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                 # 基础 UI 组件
│   ├── layout/             # 布局组件
│   └── features/           # 功能组件
├── lib/
│   ├── github/             # GitHub API 封装
│   ├── i18n/               # 国际化
│   ├── markdown/           # Markdown 处理
│   ├── translation/        # 翻译引擎
│   └── validation/         # 结构验证
└── types/                  # TypeScript 类型定义
```

---

## 翻译保护机制

翻译过程中，以下元素会被保护，确保不被翻译或破坏：

| 元素 | 示例 | 保护方式 |
|------|------|----------|
| 代码块 | ` ```python ... ``` ` | 替换为占位符 |
| 行内代码 | `` `code` `` | 替换为占位符 |
| 链接 | `[text](url)` | 替换为占位符 |
| 图片 | `![alt](url)` | 替换为占位符 |
| 数字引用 | `[1]`, `[2,3,4]` | 保持不变 |
| 学术引用 | `[Smith et al., 2020]` | 保持不变 |

---

## 常用命令

```bash
npm run dev      # 启动开发服务器
npm run build    # 构建生产版本
npm run start    # 启动生产服务器
npm run lint     # 代码检查
```

---

## 许可证

MIT License
