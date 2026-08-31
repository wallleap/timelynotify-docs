# 快速开始

本节帮助你搭建 TimelyNotify 并发送第一条通知。

## 环境要求

- Node.js 18 及以上
- 已开通 TimelyNotify 账号

## 安装

```bash
npm install timelynotify
```

## 初始化客户端

```js
import TimelyNotify from "timelynotify";

const client = new TimelyNotify({
  apiKey: "your-api-key",
});

await client.send({
  channel: "email",
  to: "user@example.com",
  template: "welcome",
  params: { name: "张三" },
});
```

## 验证发送

发送成功后，返回的 `messageId` 可用于查询送达状态：

```js
const status = await client.getStatus(messageId);
console.log(status.state); // => "delivered"
```
