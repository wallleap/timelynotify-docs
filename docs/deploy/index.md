文档待完善

项目地址：<https://github.com/wallleap/timelynotify-server>

## 部署文件

本项目的部署产物位于 `deploy/` 目录

| 文件 | 说明 |
| --- | --- |
| `deploy/Dockerfile` | 构建镜像（二进制 `timelynotify-server`） |
| `deploy/docker-compose.yaml` | Docker Compose 部署（远程镜像 `wallleap/timelynotify-server`） |
| `deploy/docker-compose.local.yaml` | Docker Compose 部署（本地构建镜像，`bin/up` 默认使用） |
| `deploy/timelynotify-server.service` | systemd 服务 |
| `deploy/entrypoint.sh` | 容器入口，设置时区 |
| `deploy/helm-chart/` | Kubernetes Helm Chart |

## 部署方式

### Docker

国内直接拉取 Docker Hub 镜像较慢，建议先配置镜像加速。在 Docker 的 `daemon.json` 中加入以下内容：

```json
{
  "registry-mirrors": [
    "https://docker.m.daocloud.io",
    "https://docker.jiaxin.site",
    "https://docker.1ms.run"
  ]
}
```

**Linux** 运行命令

```bash
# 写入（或新建）配置文件
sudo mkdir -p /etc/docker

echo '{
  "registry-mirrors": [
    "https://docker.m.daocloud.io",
    "https://docker.jiaxin.site",
    "https://docker.1ms.run"
  ]
}' | sudo tee /etc/docker/daemon.json

# 重启 Docker 生效
sudo systemctl daemon-reload

sudo systemctl restart docker

# 验证是否生效
docker info | grep -A 3 "Registry Mirrors"
```

**Windows** 推荐下载 Docker Desktop 商店版本

![](https://cdn.wallleap.cn/img/pic/illustration/20260831224858310.png?imageSlim)

安装后打开 Docker Desktop → Settings → Docker Engine，在右侧 JSON 编辑框中合并加入上面的 `registry-mirrors` 配置，点击 **Apply & Restart** 生效。

**macOS** 推荐下载 OrbStack

安装后打开 OrbStack → Settings → Docker - Engine，在配置中加入上面的 `registry-mirrors` 字段（也可直接编辑 `~/.orbstack/config/docker.json`），保存后重启 OrbStack 生效。若使用 Docker Desktop for Mac，配置方式与 Windows 相同。

---

Docker 部署**方式一**：修改 `your-gotify-client-token` 为你想设置的客户端 token 后运行命令

```sh
docker run -dt --name timelynotify-server --restart unless-stopped \
  -p 18080:8080 \
  -v timelynotify-data:/data \
  -e BARK_SERVER_GOTIFY_CLIENT_TOKEN="your-gotify-client-token" \
  wallleap/timelynotify-server
```

> 数据使用 Docker 命名卷 `timelynotify-data`（首次运行自动创建），权限由 Docker 管理，无需手动 chown。如需查看数据位置可执行 `docker volume inspect timelynotify-data`。

Docker 部署**方式二**：使用 docker-compose 部署

运行命令

```sh
# 复制本项目 deploy/docker-compose.yaml 到任意目录
mkdir timelynotify-server && cd timelynotify-server
curl -sL https://gh-proxy.com/https://raw.githubusercontent.com/wallleap/timelynotify-server/master/deploy/docker-compose.yaml -o docker-compose.yaml
# 提前赋权避免容器权限报错
sudo chown -R 1000:1000 ./data
# 后台启动
docker compose up -d
```

`deploy/docker-compose.yaml` 已内置注释的环境变量入口，按需取消注释即可，如果没有指定 `client_token`，会自动生成

可以运行 `docker logs timelynotify-server` 查看容器日志

找到日志中的 client token 行，例如下方 `P29PO93tezRgMgKIiRuDoKlOwWLVJ43zT2AkrzbyP-U` 为 `client_token`（客户端 token）

```bash
2026-08-31 23:06:52    INFO    Gotify-compatible stream ready. Generated client token (set bridge gotify_token to this): P29PO93tezRgMgKIiRuDoKlOwWLVJ43zT2AkrzbyP-U
```

注意：自动生成的 `client_token` 仅在第一次运行时打印，后续运行时不会打印，如果错过了首启日志且容器已重启过，就需要清空数据重新初始化

```sh
# 删除容器和数据卷后，重新执行上面的 docker run 命令（带上 BARK_SERVER_GOTIFY_CLIENT_TOKEN）
docker rm -f timelynotify-server && docker volume rm timelynotify-data
```

Docker 部署**方式三**：可以 clone 项目到本地，然后运行：`bin/up` / `bin/down` 默认使用 `deploy/docker-compose.local.yaml`（本地构建镜像，不拉远程），`bin/up` 会自动 `--build`。

如需用远程镜像可运行 `COMPOSE_FILE=deploy/docker-compose.yaml bin/up`。

### systemd

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

### 直接运行

1. 自行编译或从 [releases](https://github.com/wallleap/timelynotify-server/releases) 下载预编译二进制（等 1.0.0 发布后将加上）
2. 添加执行权限：`chmod +x timelynotify-server`
3. 启动（含修改后的参数）：

    ```sh
    ./timelynotify-server --addr 0.0.0.0:18080 --data ./bark-data \
    --gotify-client-token your-gotify-client-token \
    --user admin --password secret
    ```

4. 测试：`curl localhost:18080/ping`

**注意：服务端默认使用 `/data` 目录存储数据，请确保有写权限，否则用 `--data` 指定目录。**

## client_token

`client_token` 在部署时通过环境变量 `BARK_SERVER_GOTIFY_CLIENT_TOKEN` 或 `--gotify-client-token` 指定

如果没有指定，会自动生成，且仅在第一次运行时打印，后续运行时不会打印，可以看上方查找日志中的 `client_token`（客户端 token）

## 主要参数（相对上游新增/常用）

| 参数 / 环境变量 | 说明 |
| --- | --- |
| `--addr` / `BARK_SERVER_ADDRESS` | 监听地址，默认 `0.0.0.0:8080` |
| `--data` / `BARK_SERVER_DATA_DIR` | 数据目录（bbolt + gotify.db），默认 `/data` |
| `--gotify-client-token` / `BARK_SERVER_GOTIFY_CLIENT_TOKEN` | Gotify 兼容监控客户端 token，自动生成并持久化，查看/删除消息时认证用 |
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
