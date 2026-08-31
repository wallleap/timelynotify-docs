/**
 * 图片灯箱：点击图片放大查看，支持
 * - 滚轮缩放（桌面端）
 * - 双指捏合缩放（移动端）
 * - 拖拽平移（放大后）
 * - 双击切换 1x / 2.5x
 * - 点击空白处 / ESC 关闭
 */

export function createLightbox() {
  const overlay = document.createElement("div");
  Object.assign(overlay.style, {
    position: "fixed",
    inset: "0",
    zIndex: "9999",
    background: "rgba(0, 0, 0, 0.85)",
    display: "none",
    alignItems: "center",
    justifyContent: "center",
    touchAction: "none",
    overflow: "hidden",
  });

  const img = document.createElement("img");
  img.draggable = false;
  Object.assign(img.style, {
    maxWidth: "92vw",
    maxHeight: "88vh",
    transformOrigin: "center center",
    userSelect: "none",
    webkitUserDrag: "none",
    touchAction: "none",
    transition: "opacity 0.15s ease",
  });
  overlay.appendChild(img);
  document.body.appendChild(overlay);

  let scale = 1;
  let tx = 0;
  let ty = 0;
  let moved = false; // 本次按下是否发生移动（用于区分点击与拖拽）
  let lastPinchDist = 0;
  const pointers = new Map(); // pointerId -> {x, y}

  const apply = () => {
    img.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
    img.style.cursor = scale > 1 ? "grab" : "zoom-in";
    overlay.style.cursor = scale > 1 ? "default" : "zoom-out";
  };

  const open = (src) => {
    scale = 1;
    tx = 0;
    ty = 0;
    img.src = src;
    overlay.style.display = "flex";
    document.body.style.overflow = "hidden";
    apply();
  };

  const close = () => {
    overlay.style.display = "none";
    document.body.style.overflow = "";
    pointers.clear();
    lastPinchDist = 0;
  };

  /** 以视口坐标 (cx, cy) 为中心缩放 factor 倍 */
  const zoomAt = (factor, cx, cy) => {
    const ns = Math.min(8, Math.max(1, scale * factor));
    if (ns === scale) return;
    const rect = img.getBoundingClientRect();
    // 图片中心在视口中的位置
    const cxImg = rect.left + rect.width / 2;
    const cyImg = rect.top + rect.height / 2;
    const k = ns / scale;
    // 保持 (cx, cy) 点不动：t' = (q - C)(1 - k) + k * t
    tx = (cx - cxImg) * (1 - k) + k * tx;
    ty = (cy - cyImg) * (1 - k) + k * ty;
    scale = ns;
    if (scale === 1) {
      tx = 0;
      ty = 0;
    }
    apply();
  };

  // ── 事件：打开（事件委托，页面切换无需重新绑定） ──
  document.addEventListener(
    "click",
    (e) => {
      const t = e.target;
      if (
        t instanceof HTMLImageElement &&
        t.closest(".VPDoc") &&
        !t.classList.contains("no-zoom") &&
        overlay.style.display === "none"
      ) {
        e.preventDefault();
        open(t.currentSrc || t.src);
      }
    },
    true,
  );

  // ── 事件：关闭 ──
  overlay.addEventListener("click", (e) => {
    if (moved) return; // 拖拽结束不触发关闭
    if (e.target === overlay) close();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.style.display === "flex") close();
  });

  // ── 事件：滚轮缩放 ──
  overlay.addEventListener("wheel", (e) => {
    e.preventDefault();
    zoomAt(e.deltaY < 0 ? 1.2 : 1 / 1.2, e.clientX, e.clientY);
  }, { passive: false });

  // ── 事件：双击放大/还原 ──
  overlay.addEventListener("dblclick", (e) => {
    zoomAt(scale === 1 ? 2.5 : 1 / scale, e.clientX, e.clientY);
  });

  // ── 事件：指针（拖拽平移 + 双指捏合） ──
  overlay.addEventListener("pointerdown", (e) => {
    if (e.target === img && e.pointerType === "mouse" && e.button !== 0) return;
    moved = false;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    overlay.setPointerCapture(e.pointerId);
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      lastPinchDist = Math.hypot(a.x - b.x, a.y - b.y);
    }
  });

  overlay.addEventListener("pointermove", (e) => {
    if (!pointers.has(e.pointerId)) return;
    const prev = pointers.get(e.pointerId);
    const dx = e.clientX - prev.x;
    const dy = e.clientY - prev.y;

    if (pointers.size === 1 && scale > 1) {
      // 单指拖拽平移
      if (Math.abs(dx) + Math.abs(dy) > 2) moved = true;
      tx += dx;
      ty += dy;
      apply();
    } else if (pointers.size === 2) {
      // 双指捏合缩放
      if (Math.abs(dx) + Math.abs(dy) > 2) moved = true;
    }

    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const midX = (a.x + b.x) / 2;
      const midY = (a.y + b.y) / 2;
      if (lastPinchDist > 0 && dist > 0) {
        zoomAt(dist / lastPinchDist, midX, midY);
      }
      lastPinchDist = dist;
    }
  });

  const releasePointer = (e) => {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) lastPinchDist = 0;
  };
  overlay.addEventListener("pointerup", releasePointer);
  overlay.addEventListener("pointercancel", releasePointer);
}
