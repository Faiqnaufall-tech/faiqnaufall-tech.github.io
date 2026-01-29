const nav = document.querySelector(".nav");
const toggle = document.querySelector(".nav-toggle");
const themeToggle = document.getElementById("themeToggle");
const langButtons = document.querySelectorAll("[data-lang]");
const cursorDot = document.querySelector(".cursor-dot");
const cursorRing = document.querySelector(".cursor-ring");
const typingNodes = document.querySelectorAll("[data-typing]");
const scrollTopBtn = document.querySelector(".scroll-top");
const scrollDownBtn = document.querySelector(".scroll-down");

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });
}

if (nav && toggle) {
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

const textNodes = document.querySelectorAll("[data-id],[data-en]");
const placeholderNodes = document.querySelectorAll(
  "[data-id-placeholder],[data-en-placeholder]"
);

const applyLanguage = (lang) => {
  textNodes.forEach((el) => {
    if (el.hasAttribute("data-typing")) {
      return;
    }
    const value =
      lang === "en" ? el.dataset.en || el.dataset.id : el.dataset.id || el.dataset.en;
    if (value) {
      el.textContent = value;
    }
  });

  placeholderNodes.forEach((el) => {
    const value =
      lang === "en"
        ? el.dataset.enPlaceholder || el.dataset.idPlaceholder
        : el.dataset.idPlaceholder || el.dataset.enPlaceholder;
    if (value) {
      el.setAttribute("placeholder", value);
    }
  });
};

const typingTimers = new WeakMap();
const typingSpeed = 90;
const typingDelay = 200;
const typingLoopDelay = 1600;

const startTyping = (lang) => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  typingNodes.forEach((el) => {
    const text =
      lang === "en" ? el.dataset.en || el.dataset.id : el.dataset.id || el.dataset.en;
    if (!text) return;

    const prev = typingTimers.get(el);
    if (prev) {
      clearTimeout(prev.timeout);
      if (prev.interval) clearInterval(prev.interval);
      if (prev.loop) clearTimeout(prev.loop);
      typingTimers.delete(el);
    }

    if (reduceMotion) {
      el.textContent = text;
      return;
    }

    el.textContent = "";
    let index = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        el.textContent = text.slice(0, index + 1);
        index += 1;
        if (index >= text.length) {
          clearInterval(interval);
          const loop = setTimeout(() => {
            startTyping(lang);
          }, typingLoopDelay);
          const current = typingTimers.get(el);
          if (current) {
            typingTimers.set(el, { ...current, loop });
          }
        }
      }, typingSpeed);
      typingTimers.set(el, { timeout, interval, loop: null });
    }, typingDelay);
    typingTimers.set(el, { timeout, interval: null, loop: null });
  });
};

const setTheme = (mode) => {
  document.body.classList.toggle("theme-light", mode === "light");
  if (themeToggle) {
    themeToggle.setAttribute(
      "aria-label",
      mode === "light" ? "Switch to dark theme" : "Switch to light theme"
    );
  }
  localStorage.setItem("theme", mode);
};

const setLanguage = (lang) => {
  applyLanguage(lang);
  startTyping(lang);
  localStorage.setItem("lang", lang);
  langButtons.forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.lang === lang);
  });
};

const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  setTheme(savedTheme);
}

const savedLang = localStorage.getItem("lang");
if (savedLang) {
  setLanguage(savedLang);
} else {
  setLanguage("id");
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const isLight = document.body.classList.contains("theme-light");
    setTheme(isLight ? "dark" : "light");
  });
}

langButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    setLanguage(btn.dataset.lang);
  });
});

if (scrollTopBtn) {
  const toggleScrollBtn = () => {
    if (window.scrollY > 300) {
      scrollTopBtn.classList.add("is-visible");
    } else {
      scrollTopBtn.classList.remove("is-visible");
    }
  };

  toggleScrollBtn();
  window.addEventListener("scroll", toggleScrollBtn, { passive: true });

  scrollTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

if (scrollDownBtn) {
  const sections = Array.from(document.querySelectorAll("section"));

  const toggleScrollDown = () => {
    const nearBottom =
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 120;
    const shouldHide = nearBottom && window.scrollY > 60;
    scrollDownBtn.classList.toggle("is-hidden", shouldHide);
  };

  toggleScrollDown();
  window.addEventListener("scroll", toggleScrollDown, { passive: true });

  scrollDownBtn.addEventListener("click", () => {
    const currentY = window.scrollY + 10;
    const next = sections.find((section) => section.offsetTop > currentY);
    if (next) {
      next.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }
  });
}

const reveals = document.querySelectorAll(".reveal");
const tappables = document.querySelectorAll(
  ".btn, .icon-card, .project-card, .cert-card, .about-card, .feedback-form, .connect-card"
);

const hoverTargets = document.querySelectorAll(
  "a, button, .btn, .icon-card, .project-card, .cert-card, .about-card, .feedback-form, input, textarea, .action-btn"
);

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  reveals.forEach((el) => observer.observe(el));
} else {
  reveals.forEach((el) => el.classList.add("is-visible"));
}

tappables.forEach((el) => {
  const addTap = () => el.classList.add("tap-animate");
  const removeTap = () => el.classList.remove("tap-animate");

  el.addEventListener("mousedown", addTap);
  el.addEventListener("mouseup", removeTap);
  el.addEventListener("mouseleave", removeTap);
  el.addEventListener("touchstart", addTap, { passive: true });
  el.addEventListener("touchend", removeTap);
  el.addEventListener("touchcancel", removeTap);
});

const setCursorPosition = (x, y) => {
  if (!cursorDot || !cursorRing) return;
  cursorDot.style.left = `${x}px`;
  cursorDot.style.top = `${y}px`;
  cursorRing.style.left = `${x}px`;
  cursorRing.style.top = `${y}px`;
};

if (cursorDot && cursorRing) {
  document.body.classList.add("cursor-visible");

  window.addEventListener("pointermove", (event) => {
    setCursorPosition(event.clientX, event.clientY);
  });

  window.addEventListener("pointerdown", (event) => {
    document.body.classList.add("cursor-active");
    document.body.classList.add("cursor-glitch");
    const burst = document.createElement("div");
    burst.className = "cursor-burst";
    burst.style.left = `${event.clientX}px`;
    burst.style.top = `${event.clientY}px`;
    document.body.appendChild(burst);
    burst.addEventListener("animationend", () => burst.remove());

    for (let i = 0; i < 10; i += 1) {
      const pixel = document.createElement("div");
      pixel.className = "pixel-burst";
      const dx = (Math.random() - 0.5) * 80;
      const dy = (Math.random() - 0.5) * 80;
      pixel.style.setProperty("--dx", `${dx}px`);
      pixel.style.setProperty("--dy", `${dy}px`);
      pixel.style.left = `${event.clientX}px`;
      pixel.style.top = `${event.clientY}px`;
      document.body.appendChild(pixel);
      pixel.addEventListener("animationend", () => pixel.remove());
    }
  });

  window.addEventListener("pointerup", () => {
    document.body.classList.remove("cursor-active");
  });

  document.body.addEventListener("animationend", () => {
    document.body.classList.remove("cursor-glitch");
  });

  window.addEventListener("pointerleave", () => {
    document.body.classList.remove("cursor-visible");
  });

  window.addEventListener("pointerenter", () => {
    document.body.classList.add("cursor-visible");
  });

  hoverTargets.forEach((el) => {
    el.addEventListener("mouseenter", () => {
      document.body.classList.add("cursor-hover");
    });
    el.addEventListener("mouseleave", () => {
      document.body.classList.remove("cursor-hover");
    });
  });
}
