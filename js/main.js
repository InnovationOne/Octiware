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

//  Devlog Navigation 
document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;
  const match = path.match(/devlog-(\d+)\.html$/);
  if (!match) return;

  const currentNum = parseInt(match[1], 10);

  const formatNum = (n) => String(n).padStart(2, '0');

  const base = "/articles/";
  const prevNum = currentNum - 1;
  const nextNum = currentNum + 1;

  const prevHref = `${base}devlog-${formatNum(prevNum)}.html`;
  const nextHref = `${base}devlog-${formatNum(nextNum)}.html`;

  const prevButton = document.getElementById("prev-article");
  const nextButton = document.getElementById("next-article");

  const checkFileExists = async (url) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (err) {
      return false;
    }
  };

  if (prevNum >= 1) {
    checkFileExists(prevHref).then((exists) => {
      if (exists) {
        prevButton.href = prevHref;
        prevButton.style.visibility = "visible";
      } else {
        prevButton.style.visibility = "hidden";
      }
    });
  } else {
    prevButton.style.visibility = "hidden";
  }

  checkFileExists(nextHref).then((exists) => {
    if (exists) {
      nextButton.href = nextHref;
      nextButton.style.visibility = "visible";
    } else {
      nextButton.style.visibility = "hidden";
    }
  });
});

// Wiki
document.addEventListener("DOMContentLoaded", () => {
  // *** A) Heading-Buttons (Contents, Top-level articles) ***
  const headingButtons = document.querySelectorAll(".heading-button");
  headingButtons.forEach(btn => {
    btn.setAttribute("data-expanded", "true");
    btn.addEventListener("click", () => {
      const isExpanded = btn.getAttribute("data-expanded") === "true";
      btn.setAttribute("data-expanded", isExpanded ? "false" : "true");
      const nextUl = btn.nextElementSibling;
      if (nextUl && nextUl.tagName === "UL") {
        nextUl.classList.toggle("hidden");
      }
    });
  });

  // *** B) Auto-TOC ***
  const tocTarget = document.getElementById("contents-generated");
  if (tocTarget) {
    const headings = document.querySelectorAll(".wiki-article h1, .wiki-article h2, .wiki-article h3, .wiki-article h4, .wiki-article h5, .wiki-article h6");
    headings.forEach(heading => {
      const text = heading.textContent.trim();
      let id = heading.id;
      if (!id) {
        id = text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-_]/g, "");
        heading.id = id;
      }
      const li = document.createElement("li");
      li.style.marginLeft = (parseInt(heading.tagName.slice(1)) - 1) * 1.2 + "rem";
      const a = document.createElement("a");
      a.href = `#${id}`;
      a.textContent = text;
      li.appendChild(a);
      tocTarget.appendChild(li);
    });
  }

  // *** C) Branch Toggle im Artikelbaum (CSS Masking) ***
  // WICHTIG: 'fill="%23fff"' statt 'none' oder 'currentColor'
  //          und entferntes fill="none" in <svg>.
  const arrowRight = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Cpath fill='%23fff' d='m9.22 15.153 3.332-3.33L9.22 8.491a.855.855 0 1 1 1.21-1.21l3.94 3.94a.855.855 0 0 1 0 1.21l-3.94 3.94a.855.855 0 0 1-1.21 0 .873.873 0 0 1 0-1.219Z'/%3E%3C/svg%3E";
  const arrowDown = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Cpath fill='%23fff' d='m8.47 9.251 3.33 3.33 3.331-3.33a.855.855 0 1 1 1.21 1.21l-3.94 3.94a.855.855 0 0 1-1.21 0l-3.94-3.94a.855.855 0 0 1 0-1.21.873.873 0 0 1 1.219 0Z'/%3E%3C/svg%3E";

  document.querySelectorAll(".toggle-branch").forEach(btn => {
    const branch = btn.closest(".tree-branch");
    if (branch) {
      const children = branch.querySelector(".branch-children");
      const icon = btn.querySelector(".toggle-icon");
      if (children && icon) {
        // Initial: hidden => Pfeil rechts, sonst Pfeil runter
        if (children.classList.contains("hidden")) {
          icon.style.webkitMaskImage = `url("${arrowRight}")`;
          icon.style.maskImage = `url("${arrowRight}")`;
        } else {
          icon.style.webkitMaskImage = `url("${arrowDown}")`;
          icon.style.maskImage = `url("${arrowDown}")`;
        }
      }
    }

    // Bei Klick: Zustand toggeln
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const branch = btn.closest(".tree-branch");
      if (!branch) return;

      const children = branch.querySelector(".branch-children");
      const icon = btn.querySelector(".toggle-icon");
      if (children && icon) {
        children.classList.toggle("hidden");
        if (children.classList.contains("hidden")) {
          icon.style.webkitMaskImage = `url("${arrowRight}")`;
          icon.style.maskImage = `url("${arrowRight}")`;
        } else {
          icon.style.webkitMaskImage = `url("${arrowDown}")`;
          icon.style.maskImage = `url("${arrowDown}")`;
        }
      }
    });
  });
});

document.addEventListener('DOMContentLoaded', function () {
  const searchForms = document.querySelectorAll('.wiki-search-form');

  searchForms.forEach(form => {
    const input = form.querySelector('input[type="search"]');
    const clearBtn = form.querySelector('.clear-icon');
    const resultsBox = form.querySelector('.autocomplete-results');

    if (!input || !clearBtn) return;

    const toggleClearButton = () => {
      clearBtn.style.display = input.value.trim().length > 0 ? 'block' : 'none';
    };

    input.addEventListener('input', toggleClearButton);

    clearBtn.addEventListener('click', () => {
      input.value = '';
      toggleClearButton();
      input.focus();
      if (resultsBox) {
        resultsBox.innerHTML = '';
        resultsBox.style.display = 'none';
      }      
    });

    toggleClearButton();
  });
});
