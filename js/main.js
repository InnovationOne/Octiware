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

document.addEventListener('DOMContentLoaded', () => {
  const newsItems = document.querySelectorAll('.news-item');
  const loadMoreBtn = document.getElementById('load-more-btn');

  let currentVisible = 4;

  showArticles(currentVisible);

  if (currentVisible >= newsItems.length) {
    loadMoreBtn.style.display = 'none';
  }

  // Klick-Event
  loadMoreBtn.addEventListener('click', () => {
    currentVisible += 4;
    showArticles(currentVisible);

    if (currentVisible >= newsItems.length) {
      loadMoreBtn.style.display = 'none';
    }
  });

  function showArticles(count) {
    for (let i = 0; i < newsItems.length; i++) {
      if (i < count) {
        newsItems[i].style.display = 'block';
      } else {
        newsItems[i].style.display = 'none';
      }
    }
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const newsItems = document.querySelectorAll('.news-item');
  const NEW_ARTICLE_DAYS = 14;

  newsItems.forEach(item => {
    const pubDate = item.getAttribute('data-published');
    if (pubDate) {
      const publishedTime = new Date(pubDate).getTime();
      const now = Date.now();
      const diffDays = (now - publishedTime) / (1000 * 60 * 60 * 24);

      if (diffDays <= NEW_ARTICLE_DAYS) {
        item.classList.add('new-article');
      }
    }
  });
});

document.addEventListener("headerLoaded", function() {
  const themeSwitch = document.getElementById('theme-switch');
  if (!themeSwitch) {
    console.warn("Theme switch element not found!");
    return; // Exit if not found
  }
  
  function applyTheme(theme) {
    if (theme === 'light') {
      document.documentElement.classList.remove('dark-mode');
      themeSwitch.classList.add('light');
    } else {
      document.documentElement.classList.add('dark-mode');
      themeSwitch.classList.remove('light');
    }
  }
  
  // Get stored theme or default to 'dark'
  const storedTheme = localStorage.getItem('theme') || 'dark';
  applyTheme(storedTheme);
  
  themeSwitch.addEventListener('click', function() {
    const currentTheme = localStorage.getItem('theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  });
});
