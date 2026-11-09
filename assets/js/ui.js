/* MotoUber · Dossier técnico · interacciones sin dependencias */
(function () {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* Año del pie */
  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

  /* Botones de impresión */
  $$("[data-print]").forEach((btn) => {
    btn.addEventListener("click", () => window.print());
  });

  /* Pantalla completa para figuras */
  $$("[data-fullscreen]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const figure = btn.closest(".figure");
      if (!figure) return;
      try {
        if (!document.fullscreenElement) {
          await figure.requestFullscreen();
        } else {
          await document.exitFullscreen();
        }
      } catch (err) {
        console.warn("No se pudo activar pantalla completa:", err);
      }
    });
  });

  document.addEventListener("fullscreenchange", () => {
    $$("[data-fullscreen]").forEach((btn) => {
      const fig = btn.closest(".figure");
      const active = document.fullscreenElement === fig;
      btn.setAttribute("aria-pressed", active ? "true" : "false");
      btn.title = active ? "Salir de pantalla completa" : "Pantalla completa";
    });
  });

  /* Descarga del SVG inline de cada figura */
  $$("[data-download-svg]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const figure = btn.closest(".figure");
      const svg = figure && $("svg", figure);
      if (!svg) return;
      const clone = svg.cloneNode(true);
      clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
      if (!clone.getAttribute("viewBox")) {
        const w = clone.getAttribute("width") || 1200;
        const h = clone.getAttribute("height") || 700;
        clone.setAttribute("viewBox", `0 0 ${w} ${h}`);
      }
      const source = '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(clone);
      const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const name = (figure.dataset.name || "diagrama").replace(/\s+/g, "-").toLowerCase();
      a.href = url;
      a.download = `motouber-${name}.svg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1200);
    });
  });

  /* Copiar bloques de código */
  $$("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const targetSel = btn.getAttribute("data-copy");
      const target = targetSel ? $(targetSel) : null;
      if (!target) return;
      const text = target.innerText;
      try {
        await navigator.clipboard.writeText(text);
        const prev = btn.textContent;
        btn.textContent = "Copiado";
        setTimeout(() => (btn.textContent = prev), 1600);
      } catch (err) {
        // Fallback para file:// sin permisos de clipboard
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); btn.textContent = "Copiado"; } catch (e) { btn.textContent = "Selecciona y copia"; }
        ta.remove();
        setTimeout(() => (btn.textContent = "Copiar"), 1800);
      }
    });
  });

  /* Botón volver arriba */
  const toTop = $(".to-top");
  if (toTop) {
    const toggle = () => {
      if (window.scrollY > 420) toTop.classList.add("is-visible");
      else toTop.classList.remove("is-visible");
    };
    window.addEventListener("scroll", toggle, { passive: true });
    toggle();
    toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  /* Resaltar el enlace de navegación según el archivo actual */
  const file = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  $$(".nav a[href]").forEach((a) => {
    const href = a.getAttribute("href").toLowerCase();
    if (href === file || (file === "" && href === "index.html")) {
      a.setAttribute("aria-current", "page");
    }
  });
})();
