

## Key 泄露了怎么办？

立即进入及时通知应用，导出所有通知后删除所有通知

在服务器设置中重置 Key，重置后旧 Key 立即失效

## 应用收到了通知在通知列表中没有

通知列表只展示当前服务的通知，所有 绑定了当前 Push Token 的 服务的 Key，都可以 Push 推送到当前设备

怎么查看？

——服务器设置中点击其它服务进行切换

## 多台设备使用同一个key，但只有其中一/两台设备可以收到推送

同一个 Key 在同一平台只能一台设备使用，同一平台只有最后打开的 APP 会收到推送

## 自部署服务显示“客户端 Token 失效”

需要打开应用，在服务器设置中配置后端指定的 client_token

## Push Token 会变吗？

Push Token 一般情况不会变化，只有以下几种场景会变：

1. 卸载应用后重新安装，Token 会失效并重新生成
2. 设备恢复出厂设置，Token 会变化
3. 应用显式调用 `deleteToken()` 接口后重新调用 `getToken()`，Token 会更新
4. 应用显式调用 `deleteAAID()` 接口后重新调用 `getToken()`，Token 会变化
5. Wearable 设备拿到海外其他国家或地区后，系统会自动更新 Token
  更新后的 Token 会通过 `pushService.on('tokenUpdate')` 回调返回

及时通知启动时会自动调用 getToken() 接口获取 Push Token，并及时上报到应用服务器更新，所以不需要但心 Token 变化
