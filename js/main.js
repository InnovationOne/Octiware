// Small JS to show/hide the mobile menu
const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
const mobileNavContainer = document.querySelector('.mobile-nav-container');

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

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const targetID = this.getAttribute('href').substring(1);
    const targetEl = document.getElementById(targetID);
    if (targetEl) {
      e.preventDefault();
      targetEl.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Scroll-to-top button
const scrollTopBtn = document.getElementById('scrollTopBtn');
window.addEventListener('scroll', () => {
  if (window.scrollY > 1) {
    scrollTopBtn.classList.add('show');
  } else {
    scrollTopBtn.classList.remove('show');
  }
});

// Click -> Smooth scroll up
scrollTopBtn.addEventListener('click', (e) => {
  e.preventDefault();
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

document.addEventListener("DOMContentLoaded", function() {
  /* --- 1) Toggle-Funktion für das Panel --- */
  const styleToggleBtn = document.getElementById("styleToggleBtn");
  const stylePanel = document.getElementById("stylePanel");

  styleToggleBtn.addEventListener("click", () => {
    stylePanel.classList.toggle("hidden");
  });


  /* --- 2) Beim Laden: vorhandene Settings aus localStorage anwenden --- */
  const savedTheme    = localStorage.getItem("selectedTheme");
  const savedFont     = localStorage.getItem("selectedFont");
  const savedLayout   = localStorage.getItem("selectedLayout");
  const savedFontSize = localStorage.getItem("selectedFontSize");

  if (savedTheme)    document.body.classList.add(savedTheme);
  if (savedFont)     document.body.classList.add(savedFont);
  if (savedLayout)   document.body.classList.add(savedLayout);
  if (savedFontSize) document.body.classList.add(savedFontSize);


  /* --- 3) Theme-Auswahl (Colors) --- */
  /* 
     Farbschemata: Wir greifen hier auf die 5 Felder zu:
     - 1) .group-wrapper      -> z. B. "theme-default"
     - 2) .frame-11           -> z. B. "theme-paper"
     - 3) .frame-13 (index 0) -> z. B. "theme-dark"
     - 4) .frame-13 (index 1) -> z. B. "theme-night"
     - 5) .frame-13 (index 2) -> z. B. "theme-joy"
     Passe die Klassen an, die du in themes.css definiert hast.
  */
  const colorOptions = [
    {
      element: document.querySelector(".group-wrapper"),
      themeClass: "theme-default"
    },
    {
      element: document.querySelector(".frame-11"),
      themeClass: "theme-paper"
    },
    {
      element: document.querySelectorAll(".frame-13")[0],
      themeClass: "theme-dark"
    },
    {
      element: document.querySelectorAll(".frame-13")[1],
      themeClass: "theme-night"
    },
    {
      element: document.querySelectorAll(".frame-13")[2],
      themeClass: "theme-joy"
    }
  ];

  colorOptions.forEach(opt => {
    opt.element.addEventListener("click", () => {
      // Entferne alle Theme-Klassen, die du verwendest
      document.body.classList.remove(
        "theme-default",
        "theme-paper",
        "theme-dark",
        "theme-night",
        "theme-joy",
        "theme-retro",    /* Falls du mehr hast, ergänze hier */
        "theme-eclipse",
        "theme-power",
        "theme-futur"
      );
      // Füge das geklickte Theme hinzu
      document.body.classList.add(opt.themeClass);
      // Speichere in localStorage
      localStorage.setItem("selectedTheme", opt.themeClass);
    });
  });


  /* --- 4) Font-Auswahl (Serif, Sans, Mono) --- */
  /* 
     - .frame-6  -> Serif
     - .frame-7 (index 0) -> Sans
     - .frame-7 (index 1) -> Mono
  */
  const serifBtn = document.querySelector(".frame-6"); 
  const sansBtn  = document.querySelectorAll(".frame-7")[0];
  const monoBtn  = document.querySelectorAll(".frame-7")[1];

  serifBtn.addEventListener("click", () => {
    document.body.classList.remove("font-sans", "font-mono", "font-pixel", "font-serif");
    document.body.classList.add("font-serif");
    localStorage.setItem("selectedFont", "font-serif");
  });

  sansBtn.addEventListener("click", () => {
    document.body.classList.remove("font-serif", "font-mono", "font-pixel", "font-sans");
    document.body.classList.add("font-sans");
    localStorage.setItem("selectedFont", "font-sans");
  });

  monoBtn.addEventListener("click", () => {
    document.body.classList.remove("font-serif", "font-sans", "font-pixel", "font-mono");
    document.body.classList.add("font-mono");
    localStorage.setItem("selectedFont", "font-mono");
  });


  /* --- 5) Layout-Auswahl (Default, Narrow, Wide) --- */
  /* 
     - .frame-17 -> Default Layout
     - .frame-18 (index 0) -> Narrow
     - .frame-18 (index 1) -> Wide
  */
  const defaultLayoutBtn = document.querySelector(".frame-17");
  const narrowLayoutBtn  = document.querySelectorAll(".frame-18")[0];
  const wideLayoutBtn    = document.querySelectorAll(".frame-18")[1];

  defaultLayoutBtn.addEventListener("click", () => {
    document.body.classList.remove("layout-narrow", "layout-wide");
    document.body.classList.add("layout-default");
    localStorage.setItem("selectedLayout", "layout-default");
  });

  narrowLayoutBtn.addEventListener("click", () => {
    document.body.classList.remove("layout-default", "layout-wide");
    document.body.classList.add("layout-narrow");
    localStorage.setItem("selectedLayout", "layout-narrow");
  });

  wideLayoutBtn.addEventListener("click", () => {
    document.body.classList.remove("layout-default", "layout-narrow");
    document.body.classList.add("layout-wide");
    localStorage.setItem("selectedLayout", "layout-wide");
  });


  /* --- 6) Font-Size (Links "T" = small, Rechts "T" = large) --- */
  /* 
     - .text-wrapper-4 (linkes T)
     - .text-wrapper-3 (rechtes T)
     Wir machen 2 Stufen (klein/groß).
     Falls du mehr willst, müsstest du den "rectangle"-Handle 
     wirklich draggable machen oder ein <input type="range"> nutzen.
  */
  const leftT  = document.querySelector(".text-wrapper-4"); // Kleineres T
  const rightT = document.querySelector(".text-wrapper-3"); // Größeres T

  leftT.addEventListener("click", () => {
    document.body.classList.remove("font-size-small", "font-size-large");
    document.body.classList.add("font-size-small");
    localStorage.setItem("selectedFontSize", "font-size-small");
  });

  rightT.addEventListener("click", () => {
    document.body.classList.remove("font-size-small", "font-size-large");
    document.body.classList.add("font-size-large");
    localStorage.setItem("selectedFontSize", "font-size-large");
  });
});