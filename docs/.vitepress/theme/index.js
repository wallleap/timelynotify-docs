import DefaultTheme from "vitepress/theme";
import { useRoute, inBrowser } from "vitepress";
import mediumZoom from "medium-zoom";
import { nextTick, watch } from "vue";
import "./style.css";

export default {
  extends: DefaultTheme,
  setup() {
    // 仅在浏览器环境执行，SSR 构建时跳过（服务端没有 window）
    if (!inBrowser) return;

    const route = useRoute();
    let zoom = null;

    const initZoom = () => {
      zoom = mediumZoom(".VPDoc img:not(.no-zoom)", {
        background: "rgba(0, 0, 0, 0.8)",
        margin: 24,
      });
    };

    watch(
      () => route.path,
      () => nextTick(() => {
        // 页面切换后重新绑定新渲染的图片
        zoom?.detach();
        initZoom();
      }),
      { immediate: true }
    );
  },
};
