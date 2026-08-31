import DefaultTheme from "vitepress/theme";
import { inBrowser } from "vitepress";
import { createLightbox } from "./zoom.js";
import "./style.css";

export default {
  extends: DefaultTheme,
  setup() {
    // 仅在浏览器环境执行（SSR 构建时跳过）
    if (inBrowser) {
      createLightbox();
    }
  },
};
