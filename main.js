// Ambil elemen utama dari DOM
const nav = document.querySelector(".nav");
const toggle = document.querySelector(".nav-toggle");
const themeToggle = document.getElementById("themeToggle");
const langButtons = document.querySelectorAll("[data-lang]");
const cursorDot = document.querySelector(".cursor-dot");
const cursorRing = document.querySelector(".cursor-ring");
const typingNodes = document.querySelectorAll("[data-typing]");
const scrollTopBtn = document.querySelector(".scroll-top");
const scrollDownBtn = document.querySelector(".scroll-down");
const feedbackForm = document.querySelector(".feedback-form");
const formStatus = document.querySelector(".form-status");
const certGroups = document.querySelectorAll(".cert-group");
const pageLoader = document.querySelector(".page-loader");

// Toggle menu di mobile
if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });
}

// Auto close menu setelah klik link (mobile)
if (nav && toggle) {
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

// Node teks yang bisa diganti bahasa
const textNodes = document.querySelectorAll("[data-id],[data-en]");
const placeholderNodes = document.querySelectorAll(
  "[data-id-placeholder],[data-en-placeholder]"
);

// Ganti bahasa untuk teks dan placeholder
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

// Efek mengetik untuk teks "Welcome!"
const typingTimers = new WeakMap();
const typingSpeed = 90;
const typingDelay = 200;
const typingLoopDelay = 1600;

// Mulai animasi mengetik berdasarkan bahasa
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

// Simpan dan terapkan tema (light/dark)
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

// Simpan dan terapkan bahasa (ID/EN)
const setLanguage = (lang) => {
  applyLanguage(lang);
  startTyping(lang);
  localStorage.setItem("lang", lang);
  langButtons.forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.lang === lang);
  });
};

// Ambil preferensi dari localStorage
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

// Event toggle tema
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const isLight = document.body.classList.contains("theme-light");
    setTheme(isLight ? "dark" : "light");
  });
}

// Event toggle bahasa
langButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    setLanguage(btn.dataset.lang);
  });
});

// Tombol scroll ke atas
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

// Tombol scroll ke section berikutnya
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

// Sembunyikan loader setelah halaman siap
if (pageLoader) {
  window.addEventListener("load", () => {
    setTimeout(() => {
      pageLoader.classList.add("is-hidden");
    }, 1200);
  });
}

// Submit feedback ke backend
if (feedbackForm && formStatus) {
  feedbackForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    formStatus.textContent = "";
    formStatus.classList.remove("is-success", "is-error");

    const formData = new FormData(feedbackForm);
    try {
      const response = await fetch(feedbackForm.action, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          message: formData.get("message"),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Gagal mengirim feedback.");
      }

      formStatus.textContent = "Feedback terkirim. Terima kasih!";
      formStatus.classList.add("is-success");
      feedbackForm.reset();
    } catch (err) {
      formStatus.textContent = "Gagal mengirim feedback. Coba lagi.";
      formStatus.classList.add("is-error");
      console.error(err);
    }
  });
}

// Carousel sertifikat + indikator dot
if (certGroups.length) {
  const updateDots = (track, dots) => {
    const cards = track.querySelectorAll(".cert-card");
    if (!cards.length || !dots.length) return;

    const trackRect = track.getBoundingClientRect();
    const trackCenter = trackRect.left + trackRect.width / 2;
    let closestIndex = 0;
    let closestDistance = Infinity;

    cards.forEach((card, index) => {
      const cardRect = card.getBoundingClientRect();
      const cardCenter = cardRect.left + cardRect.width / 2;
      const distance = Math.abs(cardCenter - trackCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    dots.forEach((dot, index) => {
      dot.classList.toggle("is-active", index === closestIndex);
    });

    cards.forEach((card, index) => {
      card.classList.toggle("is-center", index === closestIndex);
    });

    track.dataset.activeIndex = String(closestIndex);
  };

  const getClosestIndex = (track) => {
    const cards = track.querySelectorAll(".cert-card");
    if (!cards.length) return 0;
    const trackRect = track.getBoundingClientRect();
    const trackCenter = trackRect.left + trackRect.width / 2;
    let closestIndex = 0;
    let closestDistance = Infinity;
    cards.forEach((card, index) => {
      const cardRect = card.getBoundingClientRect();
      const cardCenter = cardRect.left + cardRect.width / 2;
      const distance = Math.abs(cardCenter - trackCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });
    return closestIndex;
  };
  certGroups.forEach((group) => {
    const track = group.querySelector(".cert-scroll");
    const dots = Array.from(group.querySelectorAll(".cert-dots .dot"));
    const prevBtn = group.querySelector(".cert-btn.prev");
    const nextBtn = group.querySelector(".cert-btn.next");
    if (!track || !dots.length) return;

    const updateTrackPadding = () => {
      const card = track.querySelector(".cert-card");
      if (!card) return;
      const trackWidth = track.clientWidth;
      const cardWidth = card.getBoundingClientRect().width;
      const pad = Math.max(0, (trackWidth - cardWidth) / 2);
      track.style.paddingLeft = `${pad}px`;
      track.style.paddingRight = `${pad}px`;
      track.style.scrollPaddingLeft = `${pad}px`;
      track.style.scrollPaddingRight = `${pad}px`;
    };

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    const onPointerDown = (event) => {
      isDown = true;
      startX = event.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
      track.classList.add("is-dragging");
    };

    const onPointerLeave = () => {
      isDown = false;
      track.classList.remove("is-dragging");
    };

    const onPointerUp = () => {
      isDown = false;
      track.classList.remove("is-dragging");
    };

    const onPointerMove = (event) => {
      if (!isDown) return;
      event.preventDefault();
      const x = event.pageX - track.offsetLeft;
      const walk = (x - startX) * 1.2;
      track.scrollLeft = scrollLeft - walk;
    };

    track.addEventListener("pointerdown", onPointerDown);
    track.addEventListener("pointerleave", onPointerLeave);
    track.addEventListener("pointerup", onPointerUp);
    track.addEventListener("pointermove", onPointerMove);

    const scrollToIndex = (index) => {
      const cards = track.querySelectorAll(".cert-card");
      const card = cards[index];
      if (!card) return;
      const trackWidth = track.clientWidth;
      const cardWidth = card.getBoundingClientRect().width;
      const offset = card.offsetLeft - (trackWidth - cardWidth) / 2;
      const maxScroll = track.scrollWidth - track.clientWidth;
      const clamped = Math.max(0, Math.min(maxScroll, offset));
      track.scrollTo({ left: clamped, behavior: "smooth" });
    };

    const scrollByCard = (direction) => {
      const cards = track.querySelectorAll(".cert-card");
      const current = getClosestIndex(track);
      const nextIndex = Math.max(0, Math.min(cards.length - 1, current + direction));
      scrollToIndex(nextIndex);
    };

    if (prevBtn) {
      prevBtn.addEventListener("click", () => scrollByCard(-1));
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", () => scrollByCard(1));
    }

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateDots(track, dots);
          ticking = false;
        });
        ticking = true;
      }
    };

    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", () => {
      updateTrackPadding();
      updateDots(track, dots);
    });
    updateTrackPadding();
    updateDots(track, dots);
  });
}

// Animasi reveal saat elemen masuk viewport
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

// Efek tap/click untuk elemen interaktif
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

// Posisikan kursor custom
const setCursorPosition = (x, y) => {
  if (!cursorDot || !cursorRing) return;
  cursorDot.style.left = `${x}px`;
  cursorDot.style.top = `${y}px`;
  cursorRing.style.left = `${x}px`;
  cursorRing.style.top = `${y}px`;
};

// Kursor custom (desktop)
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
