# Markdown 示例

本页展示 VitePress 支持的常用 Markdown 语法，可作为文档编写参考。

## 基础语法

**加粗**、*斜体*、`行内代码`、[链接](/examples/introduction)。

> 引用块：可以用来强调重要提示。

## 列表

- 无序列表项一
- 无序列表项二

1. 有序列表项一
2. 有序列表项二

## 代码块

```ts
export function greet(name: string): string {
  return `Hello, ${name}!`;
}
```

## 表格

| 渠道 | 说明 | 状态 |
| ---- | ---- | ---- |
| 邮件 | 默认支持 | ✅ |
| 短信 | 需申请签名 | ✅ |
| Webhook | 自定义回调 | ✅ |

## 自定义容器

::: info 提示
这是一条信息提示。
:::

::: warning 警告
操作不可逆时请谨慎执行。
:::

::: danger 危险
此操作可能导致数据丢失。
:::
