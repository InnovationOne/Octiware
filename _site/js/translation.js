/*

let translations = {};

async function loadTranslations(lang) {
  try {
    const response = await fetch(`../locales/${lang}.json`);
    const data = await response.json();
    translations = data;
    translatePage();
  } catch (error) {
    return console.error('Error loading translation:', error);
  }
}

function translatePage() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const keys = key.split('.');
    let translation = translations;
    keys.forEach(k => {
      if (translation) {
        translation = translation[k];
      }
    });
    if (translation) {
      el.textContent = translation;
    } else {
      console.warn(`Missing translation for key: ${key}`);
    }
  });
}

document.getElementById('language-selector').addEventListener('change', (event) => {
  loadTranslations(event.target.value);
});

document.addEventListener('DOMContentLoaded', () => {
  loadTranslations('en');
});

*/