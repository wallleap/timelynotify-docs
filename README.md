# TimelyNotify 文档站

基于 [VitePress](https://vitepress.dev/) 构建的产品文档站点。

## 快速开始

```bash
npm install        # 安装依赖
npm run docs:dev   # 本地开发，默认 http://localhost:5173
```

## 目录结构

```
docs/
├── .vitepress/
│   ├── config.mjs      # 站点配置（侧边栏、favicon 等）
│   └── theme/          # 自定义主题样式（主题色 #ff5a16 等）
├── public/             # 静态资源（favicon.ico、apple-touch-icon.png）
├── index.md            # 使用文档（首页）
├── api/index.md       # API 文档
├── deploy/index.md     # 服务端自部署
├── faq/index.md        # 常见问答
└── examples/           # 旧文档（不在侧边栏显示）
```

新增页面：在 `docs/` 下创建 `.md` 文件，并在 `docs/.vitepress/config.mjs` 的 `sidebar` 中登记。

## 构建与部署

### 本地构建

```bash
npm run docs:build    # 输出到 docs/.vitepress/dist/
npm run docs:preview  # 本地预览构建产物
```

### 部署到服务器

服务器采用密码认证，通过 `bin/build` 脚本一键完成「构建 + 上传」：

```bash
cp .deploy.sample.env .deploy.env   # 首次使用：复制示例配置
# 编辑 .deploy.env，填入服务器地址和目标目录
npm run build                       # 构建并上传，按提示输入 SSH 密码
```

`.deploy.env` 支持的配置项：

| 变量          | 说明                     | 默认值                    |
| ------------- | ------------------------ | ------------------------- |
| `SERVER`      | SSH 用户@主机            | `user@example.com`        |
| `SERVER_PORT` | SSH 端口                 | `22`                      |
| `SERVER_PATH` | 远端目标目录             | `/var/www/timelynotify-doc` |

说明：

- `.deploy.env` 已被 `.gitignore` 忽略，不会提交到仓库
- 部署通过单次 SSH 连接（`tar | ssh`）完成，全程只需输入一次密码
- 若配置了 SSH 免密登录（`ssh-copy-id`），则无需输入密码
