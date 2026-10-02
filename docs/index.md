欢迎使用 TimelyNotify（及时通知），在这篇文档中将介绍怎么使用本应用。

版本差异界面可能不一样，但是操作都是类似的。

## 配置权限并测试

> 应用主要作用就是接收通知的，因此必须打开通知权限

首次打开应用，会有一个弹窗，这里可以随便选一个

进入页面之后会显示暂无通知，这是正常的

点击**我的**，点击**通知权限设置**

![](https://cdn.wallleap.cn/img/pic/illustration/20260830223446731.png?imageSlim)

在弹出的通知管理中

① 把允许通知打开

② 通知形式可以按照自己需要勾选（推荐全部勾选）

③ 点击优先通知，推荐打开优先通知，优先显示选全部

点击确定或右上角关闭图标，回到我的页面，点击**开启应用订阅通知**（官方要求该开关必须默认关闭，目前没有实现功能，后续看用户反馈决定加不加上）

![](https://cdn.wallleap.cn/img/pic/illustration/20260830224911919.png?imageSlim)

点击弹窗的**接受推送**

---

权限配置完成后，在底部「服务」页的「推送测试」卡片中选择目标服务器并点击**测试通知**。这里切换的是测试目标，不会更改通知列表当前服务器。如果之前勾选了**横幅通知**，且推送正常，亮屏时会弹出横幅；同样开启了锁屏通知，锁屏时将在锁屏界面显示通知。

![](https://cdn.wallleap.cn/img/pic/illustration/20260830230738099.png?imageSlim)

屏幕左上角下滑打开通知中心，会显示应用通知，左滑点击垃圾桶图标，可以在通知中心清除这通知，点击下方的垃圾桶图标可以清空当前通知中心所有通知

返回应用通知界面，下拉刷新可以看到接收到的通知

![](https://cdn.wallleap.cn/img/pic/illustration/20260830230829814.png?imageSlim)

## 怎么发送通知

### 获取通知链接

进入底部「服务」页，在「推送测试」卡片中选择目标服务器，点击**复制地址和 Key**。也可以在上方服务器列表中打开对应服务器的操作菜单，点击**复制地址和 Key**。

![](https://cdn.wallleap.cn/img/pic/illustration/20260830232903348.png?imageSlim)

![](https://cdn.wallleap.cn/img/pic/illustration/20260830233312034.png?imageSlim)

找个地方粘贴一下，可以看到形如 `http://` 或 `https://` 开头的链接（协议，如果没有申请 SSL 证书就只能用 `http` 但是不安全），例如 `https://timelynotify.oicode.cn/eofdFpSwHjZQzVLrJ4PyQG`

现在使用的是我部署的服务，后面自己搭建服务就可以改掉前面 红色 这段

后面的 `device_key` 相当于身份证号，但又和身份证号不一样，它可以被别人冒领，它用来和设备 token 绑定（苹果/鸿蒙通知才知道往哪里发）

> 这个 `device_key` 很重要，最好不要泄漏。如果已经泄漏，在「服务」页打开对应服务器的操作菜单，点击**重置 / 还原 Key**，并在推送地方修改成新链接。

![](https://cdn.wallleap.cn/img/pic/illustration/20260830234636620.png?imageSlim)

### 请求该链接发送通知

可以通过 GET 或 POST 请求发送通知到设备上

> GET `https://timelynotify.oicode.cn/eofdFpSwHjZQzVLrJ4PyQG/文字`

- `https://timelynotify.oicode.cn/eofdFpSwHjZQzVLrJ4PyQG/标题/副标题/内容`
- `https://timelynotify.oicode.cn/eofdFpSwHjZQzVLrJ4PyQG/标题/内容`
- `https://timelynotify.oicode.cn/eofdFpSwHjZQzVLrJ4PyQG/内容`，只有内容会自动补一个标题

上面 GET 请求可以复制替换之后到浏览器打开

> POST `https://timelynotify.oicode.cn/push`

请求体中 `device_key` 上面的 `device_key`、`title` 上面的标题、`subtitle` 副标题、`body` 内容

POST 请求可以同时推送多个设备（把 `device_key` 改成 `device_keys` 使用数组）

> 需要了解更多参数可以查看 [API 文档](/api/)

### 示例-短信转发器添加 Bark 通道

在发送通道中添加一个 Bark 类型，Bark-Server 填复制出来的链接，后面补个斜杠 `/`

![](https://cdn.wallleap.cn/img/pic/illustration/20260831001302910.png?imageSlim)

### 示例-HarkForward 转发/备份鸿蒙端的通知

[点击这里](./harkforward.md) 查看 HarkForward 应用的使用说明

## 应用其它操作

底部「服务」页的「文档」卡片可打开[使用文档](/)和[推送字段](/fields/)；同页「常见问答」卡片可打开[常见问答](/faq/)。这些链接在应用内打开，「我的 → 关于」不再提供重复的使用文档入口。

「推送测试」卡片可切换并复制多行 GET/POST `curl` 命令（GET 直接展示原始标题与正文，使用 `?参数&参数` URL，执行时需要 `jq` 编码路径；POST 使用 JSON 请求体），也可复制所选服务器的推送地址和 Key，并向所选服务器发送测试通知。示例和测试按钮使用相同的 title、body、icon、group、ttl、sound 参数；「我的」页不再显示测试通知入口。

### 导出通知

在「我的」界面点击「导出通知」，可将本机数据库中所有来源的未过期通知导出为 JSON 数组文本，包括其它服务器、来源归属不明的旧记录以及列表中尚未加载的历史通知；无需当前服务器已注册。加密通知的解密正文和原始密文也会写入文件，请妥善保管。未归档或已过期、因而不在本地历史中的通知无法导出。

通知界面多选后，可导出选中的通知。点击单条或分组复选框会同步更新已选数量及底部操作数量；分组复选框仅选中当前已加载的组内通知。

### 深色模式

我的界面右上角，从右到左为 跟随系统、浅色模式、深色模式

### 删除通知

通知界面

1、左滑删除单条通知

2、多选删除选中通知

3、右上角垃圾桶删除所有通知

### 跳到底部

通知列表按时间倒序排列，最新通知在顶部。向上滑动浏览历史通知离开首屏后，右下角会浮现一个向下箭头按钮（位于分组按钮上方），点击可快速滚动到列表底部，查看最早的通知。向下滑动或在首屏时按钮自动隐藏，出现和隐藏均有过渡动画。

## 进阶操作

### 自己部署服务

在自己的服务器上部署 TimelyNotify 服务请查看 [服务端自部署](/deploy/) 文档

部署完成后，复制服务链接，例如 `http://43.93.112.68:18080`（IP 地址和端口号）、`https://bark.wallleap.cn`（反向代理之后部署了 SSL 的链接）

打开及时通知应用

1. 进入底部「服务」页，点击右上角 **+** 添加服务器。
2. 填写服务器地址和服务器名称（名称可选），添加完成后会自动切换。
3. 在服务器列表中打开新服务器的操作菜单，点击**客户端 Token**，填写部署服务时设置的客户端 Token。

![](https://cdn.wallleap.cn/img/pic/illustration/20260901101150089.png?imageSlim)

![](https://cdn.wallleap.cn/img/pic/illustration/20260901101149848.png?imageSlim)

### Bark 和 及时通知 使用同一条链接

及时通知和 Bark 设置使用同一个 Key（在「服务」页对应服务器的操作菜单中选择**重置 / 还原 Key**）

![及时通知设置](https://cdn.wallleap.cn/img/pic/illustration/20260901102909361.png?imageSlim)

![Bark 设置](https://cdn.wallleap.cn/img/pic/illustration/20260901103536668.png?imageSlim)

推送时两个平台都能收到

![](https://cdn.wallleap.cn/img/pic/illustration/20260901104351934.png?imageSlim)

注意：

- 同一个 Key 在两个平台都能使用
- 同一个**平台**，重置/还原相同的 Key 将导致只有最后重置/还原的设备能收到通知（但是消息列表能同步）

## 常见问答

使用过程中的高频问题与解答，可以查看 [常见问答](/faq/)
