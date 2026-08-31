文档待完善

项目地址：<https://github.com/wallleap/timelynotify-server>

## 部署文件

本项目的部署产物位于 `deploy/` 目录，均已改为独立命名、不依赖原项目：

| 文件 | 说明 |
| --- | --- |
| `deploy/Dockerfile` | 构建镜像（二进制 `timelynotify-server`） |
| `deploy/docker-compose.yaml` | Docker Compose 部署（远程镜像 `wallleap/timelynotify-server`） |
| `deploy/docker-compose.local.yaml` | Docker Compose 部署（本地构建镜像，`bin/up` 默认使用） |
| `deploy/timelynotify-server.service` | systemd 服务 |
| `deploy/entrypoint.sh` | 容器入口，设置时区 |
| `deploy/helm-chart/` | Kubernetes Helm Chart |

## Docker

```sh
docker run -dt --name timelynotify-server --restart unless-stopped \
  -p 18080:8080 \
  -v `pwd`/bark-data:/data \
  -e BARK_SERVER_GOTIFY_CLIENT_TOKEN="your-gotify-client-token" \
  -e BARK_SERVER_BASIC_AUTH_USER="admin" \
  -e BARK_SERVER_BASIC_AUTH_PASSWORD="secret" \
  wallleap/timelynotify-server
```

> 容器以非 root 用户 `app`（uid 1000）运行，首次挂载 host 数据目录时需把属主改为该 uid，否则报 `permission denied`：
>
> ```sh
> sudo chown -R 1000:1000 `pwd`/bark-data
> ```
>
> 用 Docker 命名卷（`docker volume create` + `-v <volume>:/data`）可免去手动 chown。

使用 docker-compose：

```sh
# 复制本项目 deploy/docker-compose.yaml 到任意目录
mkdir timelynotify-server && cd timelynotify-server
curl -sL https://raw.githubusercontent.com/wallleap/timelynotify-server/master/deploy/docker-compose.yaml -o docker-compose.yaml
# 提前赋权避免容器权限报错
sudo chown -R 1000:1000 ./data
# 后台启动
docker compose up -d
```

`deploy/docker-compose.yaml` 已内置注释的环境变量入口，按需取消注释即可。

> **本地开发**：`bin/up` / `bin/down` 默认使用 `deploy/docker-compose.local.yaml`（本地构建镜像，不拉远程），`bin/up` 会自动 `--build`。
> 如需用远程镜像可运行 `COMPOSE_FILE=deploy/docker-compose.yaml bin/up`。

## systemd

这个没有测试，如果有问题请反馈。

```sh
# 1. 安装二进制
install -m 755 timelynotify-server /usr/local/bin/timelynotify-server

# 2. 复制服务文件
cp deploy/timelynotify-server.service /etc/systemd/system/

# 3. 创建参数环境文件（修改后的参数放在这里）
cat > /etc/timelynotify-server.env <<'EOF'
BARK_SERVER_GOTIFY_CLIENT_TOKEN=your-gotify-client-token
BARK_SERVER_BASIC_AUTH_USER=admin
BARK_SERVER_BASIC_AUTH_PASSWORD=secret
EOF

# 4. 启动
systemctl daemon-reload
systemctl enable --now timelynotify-server
```

## 直接运行

1. 自行编译或从 [releases](https://github.com/wallleap/timelynotify-server/releases) 下载预编译二进制
2. 添加执行权限：`chmod +x timelynotify-server`
3. 启动（含修改后的参数）：

    ```sh
    ./timelynotify-server --addr 0.0.0.0:8080 --data ./bark-data \
    --gotify-client-token your-gotify-client-token \
    --user admin --password secret
    ```

4. 测试：`curl localhost:8080/ping`

**注意：服务端默认使用 `/data` 目录存储数据，请确保有写权限，否则用 `--data` 指定目录。**

## 主要参数（相对上游新增/常用）

| 参数 / 环境变量 | 说明 |
| --- | --- |
| `--addr` / `BARK_SERVER_ADDRESS` | 监听地址，默认 `0.0.0.0:8080` |
| `--data` / `BARK_SERVER_DATA_DIR` | 数据目录（bbolt + gotify.db），默认 `/data` |
| `--gotify-client-token` / `BARK_SERVER_GOTIFY_CLIENT_TOKEN` | Gotify 兼容监控客户端 token，自动生成并持久化。**hotify-bridge 需用它当作 `gotify_token`**（依赖见下文） |
| `--gotify-max-messages` / `BARK_SERVER_GOTIFY_MAX_MESSAGES` | Gotify 监控消息保留上限，默认 `0`（使用内置默认 `1000`） |
| `--user` / `--password` / `BARK_SERVER_BASIC_AUTH_{USER,PASSWORD}` | 可选 Basic Auth，同时设置后开启，所有非白名单路径请求头要带 `Authorization: Basic base64(user:password)` |
| `--dsn` / `BARK_SERVER_DSN` | 改用 MySQL 替代 Bbolt |
| `--mysql-tls` `--mysql-ca` `--mysql-client-cert` `--mysql-client-key` `--mysql-tls-name` `--mysql-tls-skip-verify` | MySQL TLS 相关 |
| `--max-batch-push-count` / `BARK_SERVER_MAX_BATCH_PUSH_COUNT` | 批量推送上限，默认 `-1` 不限 |
| `--max-apns-client-count` | APNs 客户端连接数 |
| `--rate-limit-ip` / `BARK_SERVER_RATE_LIMIT_IP` | 按来源 IP 对 `/register` `/mcp*` 限流（请求/秒），默认 `0` 关闭 |
| `--rate-limit-burst` / `BARK_SERVER_RATE_LIMIT_BURST` | IP 限流突发窗口 token 数，默认等于 `rate-limit-ip` |
| `--rate-limit-push` / `BARK_SERVER_RATE_LIMIT_PUSH` | 额外把限流应用到推送端点 `/push` 与 `/:device_key`（默认关闭，推送默认不限流） |
| `--log-level` / `BARK_SERVER_LOG_LEVEL` | 日志级别 `debug` \| `info` \| `warn` \| `error`，默认 `info` |
| `--log-format` / `BARK_SERVER_LOG_FORMAT` | 日志格式 `console` \| `json`，默认 `console` |
| `--unix-socket`、`--url-prefix`、`--cert`/`--key` | 监听方式 / 前缀 / TLS |

完整参数见 `./timelynotify-server --help`。

## 安全建议（公网部署必备）

> **默认无鉴权**：未配置 Basic Auth 时，`/push`、`/register`、`/mcp*` 与 `/:device_key` 对全网开放（启动日志会给出醒目警告）。

**公网部署务必**：

1. 开启 Basic Auth：`BARK_SERVER_BASIC_AUTH_USER` / `BARK_SERVER_BASIC_AUTH_PASSWORD`（`/push`、`/mcp*`、`/:device_key` 受保护；白名单路径 `/ping /register /healthz /info` + 设备级 `/:device_key/version /:device_key/message /:device_key/stream` 仍开放——其中 `/:device_key/message` `/:device_key/stream` 走 gotify token 鉴权，`/info` 无凭据返回基础信息、带有效 Basic Auth 才返回设备数）。
2. 配置限流：`BARK_SERVER_RATE_LIMIT_IP=10`（每秒每 IP 最多 10 次）可缓解 CC / 刷注册。推送端点 `/push`、`/:device_key` 默认不限流（避免误伤正常推送），确需限制时再加 `BARK_SERVER_RATE_LIMIT_PUSH=true`。
3. 建议前置 **HTTPS 反向代理**（如 Caddy / Nginx），并限制其仅转发到 `addr`。
4. 数据目录 `data` 收紧为服务运行用户可读写。
