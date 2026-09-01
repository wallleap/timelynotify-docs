/**
 * 侧边栏手风琴：只展开当前页面的分组。
 * VitePress 只在分组激活时展开（collapsed=false），导航离开后不会自动收起，
 * 这里在路由切换后把非当前页面的 level-1 分组重新折叠。
 */
export function createSidebarAccordion() {
  const COLLAPSE_DELAY = 80;

  function collapseInactiveGroups() {
    document
      .querySelectorAll("#VPSidebarNav section.VPSidebarItem.level-1")
      .forEach((el) => {
        const active =
          el.classList.contains("is-active") ||
          el.classList.contains("has-active");
        if (!active && !el.classList.contains("collapsed")) {
          const caret = el.querySelector(":scope > .item > .caret");
          if (caret) caret.click();
        }
      });
  }

  function schedule() {
    setTimeout(collapseInactiveGroups, COLLAPSE_DELAY);
  }

  // 首次加载
  if (document.readyState === "complete") {
    schedule();
  } else {
    window.addEventListener("load", schedule, { once: true });
  }

  // SPA 路由切换：VitePress 内部通过 history.pushState 导航
  const rawPushState = history.pushState.bind(history);
  history.pushState = function (...args) {
    const result = rawPushState(...args);
    schedule();
    return result;
  };

  // 同页锚点跳转
  window.addEventListener("hashchange", schedule);

  // 兜底：点击侧边栏里的任何链接（含带锚点的标题链接）
  document.addEventListener(
    "click",
    (e) => {
      const link = e.target.closest("#VPSidebarNav a");
      if (link) schedule();
    },
    true,
  );
}
