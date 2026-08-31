import { defineConfig } from "vitepress";

export default defineConfig({
  title: "TimelyNotify",
  description: "TimelyNotify 及时通知产品文档",
  lang: "zh-CN",
  head: [
    [
      "meta",
      {
        name: "viewport",
        content:
          "width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover",
      },
    ],
    ["link", { rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    ["link", { rel: "apple-touch-icon", href: "/apple-touch-icon.png" }],
  ],
  themeConfig: {
    sidebar: [
      {
        text: "导航",
        items: [
          { text: "使用文档", link: "/" },
          { text: "API 文档", link: "/api/" },
          { text: "服务端自部署", link: "/deploy/" },
          { text: "常见问答", link: "/faq/" },
        ],
      },
    ],
    outline: false,
    lastUpdated: { text: "最后更新" },
    search: false,
  },
});
