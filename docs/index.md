欢迎使用 TimelyNotify（及时通知），在这篇文档中将介绍怎么使用本应用。

版本差异界面可能不一样，但是操作都是类似的。

## 打开应用

> 应用主要作用就是接收通知的，因此必须打开通知权限

首次打开应用，会有一个弹窗，这里可以随便选一个

进入页面之后会显示暂无消息，这是正常的

点击**我的**，点击**通知权限设置**

![](https://cdn.wallleap.cn/img/pic/illustration/20260830223446731.png?imageSlim)

在弹出的通知管理中，① 把允许通知打开

② 通知形式可以按照自己需要勾选（推荐全部勾选）

③ 点击优先通知，推荐打开优先通知，优先显示选全部

点击确定或右上角关闭图标，回到我的页面，点击**开启应用订阅通知**（官方要求该开关必须默认关闭，目前没有实现功能，后续看用户反馈决定加不加上）

![](https://cdn.wallleap.cn/img/pic/illustration/20260830224911919.png?imageSlim)

点击弹窗的**接受推送**

---

权限配置完成，可以点击**测试通知**，如果之前勾选了**横幅通知**，且推送正常，亮屏时会弹出横幅，同样开启了锁屏通知，锁屏时将在锁屏界面显示通知

![](https://cdn.wallleap.cn/img/pic/illustration/20260830230738099.png?imageSlim)

屏幕左上角下滑打开通知中心，会显示应用通知，左滑点击垃圾桶图标，可以在通知中心清除这通知，点击下方的垃圾桶图标可以清空当前通知中心所有通知

返回应用通知界面，下拉刷新可以看到接收到的通知

![](https://cdn.wallleap.cn/img/pic/illustration/20260830230829814.png?imageSlim)

## 怎么发送通知

### 获取通知链接

有两条获取途径

1. 通知界面点击标题，在弹窗中点击高亮的服务右侧的**操作**，点击**复制地址和 Key**
2. 我的界面点击服务器，点击高亮的服务右侧的**操作**，点击**复制地址和 Key**

![](https://cdn.wallleap.cn/img/pic/illustration/20260830232903348.png?imageSlim)

![](https://cdn.wallleap.cn/img/pic/illustration/20260830233312034.png?imageSlim)

找个地方粘贴一下，可以看到形如 `http://` 或 `https://` 开头的链接（协议，如果没有申请 SSL 证书就只能用 `http` 但是不安全），例如 `https://timelynotify.oicode.cn/eofdFpSwHjZQzVLrJ4PyQG`

现在使用的是我部署的服务，后面自己搭建服务就可以改掉前面 红色 这段

后面的 `device_key` 相当于身份证号，但又和身份证号不一样，它可以被别人冒领，它用来和设备 token 绑定（苹果/鸿蒙通知才知道往哪里发）

> 这个 `device_key` 很重要，最好不要泄漏，如果已经泄漏，需要点击服务器设置中的 **重置或还原 Key**，并在推送地方修改成新链接

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

### 示例-短信转发器

在发送通道中添加一个 Bark 类型，Bark-Server 填复制出来的链接，后面补个斜杠 `/`

![](https://cdn.wallleap.cn/img/pic/illustration/20260831001302910.png?imageSlim)

## 进阶操作

- [服务端自部署](/deploy/) —— 在自己的服务器上部署 TimelyNotify
- [常见问答](/faq/) —— 使用过程中的高频问题与解答

