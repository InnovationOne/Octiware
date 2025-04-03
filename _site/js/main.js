// Utility function to safely get elements
function $(selector) {
  return document.querySelector(selector);
}

function $all(selector) {
  return document.querySelectorAll(selector);
}

// ==================== Mobile Navigation ====================
const mobileNavToggle = $('.mobile-nav-toggle');
const mobileNavContainer = $('.mobile-nav-container');

if (mobileNavToggle && mobileNavContainer) {
  mobileNavToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    mobileNavContainer.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!mobileNavContainer.contains(e.target) && e.target !== mobileNavToggle) {
      mobileNavContainer.classList.remove('open');
    }
  });
}

// ==================== Smooth Scrolling ====================
$all('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const targetID = this.getAttribute('href').substring(1);
    const targetEl = document.getElementById(targetID);
    if (targetEl) {
      e.preventDefault();
      targetEl.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// ==================== Scroll-to-Top Button ====================
const scrollTopBtn = $('#scrollTopBtn');

if (scrollTopBtn) {
  window.addEventListener('scroll', () => {
    scrollTopBtn.classList.toggle('show', window.scrollY > 1);
  });

  scrollTopBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ==================== Style Panel ====================
document.addEventListener("DOMContentLoaded", () => {
  const stylePanel = $('#stylePanel');
  const styleToggleBtn = $('#styleToggleBtn');
  const fontSizeRange = $('#fontSizeRange');
  const fontOptions = $all(".font-option");
  const colorOptions = $all(".color-wrapper");
  const layoutOptions = $all(".layout-option");
  const htmlElement = document.documentElement;

  if (!stylePanel || !styleToggleBtn || !fontSizeRange) return;

  const STORAGE_KEYS = {
    fontHeader: "octi_font_header",
    fontText: "octi_font_text",
    theme: "octi_theme",
    layout: "octi_layout",
    fontSize: "octi_font_size"
  };

  styleToggleBtn.addEventListener("click", () => {
    stylePanel.classList.toggle("hidden");
  });

  function initSettings() {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);
    if (savedTheme) applyTheme(savedTheme);

    const savedLayout = localStorage.getItem(STORAGE_KEYS.layout);
    if (savedLayout) applyLayout(savedLayout);

    const savedFontHeader = localStorage.getItem(STORAGE_KEYS.fontHeader);
    if (savedFontHeader) applyFont(savedFontHeader);
    const savedFontText = localStorage.getItem(STORAGE_KEYS.fontText);
    if (savedFontText) applyFont(savedFontText);

    const savedFontSize = localStorage.getItem(STORAGE_KEYS.fontSize);
    if (savedFontSize && fontSizeRange) {
      applyFontSize(savedFontSize);
      fontSizeRange.value = savedFontSize;
    }

    updateFontThumbPosition();
    updateActiveStyles();
  }

  function applyFont(fontClass) {
    if (!fontClass) return;
    if (fontClass.includes("-header")) {
      htmlElement.classList.remove(...Array.from(htmlElement.classList).filter(cls => cls.endsWith("-header")));
      htmlElement.classList.add(fontClass);
      localStorage.setItem(STORAGE_KEYS.fontHeader, fontClass);
    } else if (fontClass.includes("-text")) {
      htmlElement.classList.remove(...Array.from(htmlElement.classList).filter(cls => cls.endsWith("-text")));
      htmlElement.classList.add(fontClass);
      localStorage.setItem(STORAGE_KEYS.fontText, fontClass);
    }
    updateActiveStyles();
  }

  function applyTheme(themeClass) {
    if (!themeClass) return;
    htmlElement.classList.remove(...Array.from(htmlElement.classList).filter(cls => cls.startsWith("theme-")));
    htmlElement.classList.add(themeClass);
    localStorage.setItem(STORAGE_KEYS.theme, themeClass);
    updateActiveStyles();
  }

  function applyLayout(layoutClass) {
    if (!layoutClass) return;
    htmlElement.classList.remove("layout-default", "layout-narrow", "layout-wide");
    htmlElement.classList.add(`layout-${layoutClass}`);
    localStorage.setItem(STORAGE_KEYS.layout, layoutClass);
    updateActiveStyles();
  }

  function applyFontSize(size) {
    const sizeClasses = ["font-size-xxs", "font-size-xs", "font-size-sm", "font-size-md", "font-size-lg", "font-size-xl", "font-size-xxl"];
    htmlElement.classList.remove(...sizeClasses);
    const className = sizeClasses[size - 1];
    if (className) htmlElement.classList.add(className);
    localStorage.setItem(STORAGE_KEYS.fontSize, size);
  }

  function updateActiveStyles() {
    const currentFontHeader = localStorage.getItem(STORAGE_KEYS.fontHeader);
    const currentFontText = localStorage.getItem(STORAGE_KEYS.fontText);
    fontOptions.forEach(option => {
      const dataFont = option.getAttribute("data-font");
      option.classList.toggle("active", dataFont === currentFontHeader || dataFont === currentFontText);
    });

    const currentTheme = localStorage.getItem(STORAGE_KEYS.theme);
    colorOptions.forEach(option => {
      const dataTheme = option.getAttribute("data-theme");
      option.classList.toggle("active", dataTheme === currentTheme);
    });

    const currentLayout = localStorage.getItem(STORAGE_KEYS.layout);
    layoutOptions.forEach(option => {
      const dataLayout = option.getAttribute("data-layout");
      option.classList.toggle("active", dataLayout === currentLayout);
    });
  }

  function updateFontThumbPosition() {
    const thumb = $('.fs-thumb');
    if (!thumb || !fontSizeRange) return;
    const percent = (fontSizeRange.value - fontSizeRange.min) / (fontSizeRange.max - fontSizeRange.min);
    thumb.style.left = `${percent * 204}px`;
  }

  fontOptions.forEach(option => {
    option.addEventListener("click", () => applyFont(option.getAttribute("data-font")));
  });

  colorOptions.forEach(option => {
    option.addEventListener("click", () => applyTheme(option.getAttribute("data-theme")));
  });

  layoutOptions.forEach(option => {
    option.addEventListener("click", () => applyLayout(option.getAttribute("data-layout")));
  });

  fontSizeRange.addEventListener("input", (e) => {
    applyFontSize(e.target.value);
    updateFontThumbPosition();
  });

  initSettings();
});

// ==================== Auto-hide Style Panel on Outside Click ====================
document.addEventListener("click", (event) => {
  const stylePanel = $('#stylePanel');
  const styleToggleBtn = $('#styleToggleBtn');
  if (stylePanel && !stylePanel.classList.contains("hidden") && !stylePanel.contains(event.target) && event.target !== styleToggleBtn) {
    stylePanel.classList.add("hidden");
  }
});

// ==================== News Articles ====================
document.addEventListener("DOMContentLoaded", () => {
  const articles = $all(".news-item");
  const now = new Date();

  articles.forEach(article => {
    const pubDateStr = article.getAttribute("data-published");
    if (pubDateStr) {
      const pubDate = new Date(pubDateStr);
      const diffDays = (now - pubDate) / (1000 * 60 * 60 * 24);
      article.classList.toggle("new-article", diffDays <= 14);
    }
  });

  const articlesArray = Array.from(articles);
  const loadMoreBtn = $('#load-more-btn');
  const articlesToShow = 4;
  let currentCount = articlesToShow;

  function updateArticlesVisibility() {
    articlesArray.forEach((article, index) => {
      article.style.display = (index < currentCount) ? "" : "none";
    });
  }

  updateArticlesVisibility();

  if (loadMoreBtn) {
    loadMoreBtn.style.display = articlesArray.length <= articlesToShow ? "none" : "inline-block";

    loadMoreBtn.addEventListener("click", () => {
      const isExpanding = loadMoreBtn.textContent.trim() === "More Stories";

      if (isExpanding) {
        currentCount = Math.min(currentCount + articlesToShow, articlesArray.length);
        updateArticlesVisibility();
        if (currentCount === articlesArray.length) loadMoreBtn.textContent = "Less Stories";
      } else {
        currentCount = articlesToShow;
        updateArticlesVisibility();
        loadMoreBtn.textContent = "More Stories";
      }
    });
  }
});




// Öffnet Lightbox anhand data-modal
document.querySelectorAll('.clickable-picture').forEach(el => {
  el.addEventListener('click', () => {
    const targetId = el.dataset.modal;
    const modal = document.getElementById(targetId);
    if (modal) {
      document.querySelectorAll('.lightbox-modal').forEach(m => m.classList.remove('active'));
      modal.classList.add('active');
    }
  });
});

// Schließt alle Modals
function closeLightbox() {
  document.querySelectorAll('.lightbox-modal').forEach(m => m.classList.remove('active'));
}

// ESC-Taste schließt das Modal
document.addEventListener('keydown', function (e) {
  if (e.key === "Escape") closeLightbox();
});