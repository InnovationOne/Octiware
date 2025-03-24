// include-layout.js
document.addEventListener('DOMContentLoaded', () => {
  includeHTML('wiki-header-placeholder', 'wiki-header.html', 'wikiHeaderLoaded');
  includeHTML('header-placeholder', 'header.html', 'headerLoaded'); // <-- wichtig
  includeHTML('contact-placeholder', 'contact-section.html', 'contactLoaded');
  includeHTML('footer-placeholder', 'footer.html', 'footerLoaded');
});

function includeHTML(containerId, file, eventName) {
  const container = document.getElementById(containerId);
  if (!container) return;

  fetch(file)
    .then((response) => {
      if (!response.ok) throw new Error(`Error fetching ${file}`);
      return response.text();
    })
    .then((html) => {
      container.innerHTML = html;
      if (eventName) {
        document.dispatchEvent(new CustomEvent(eventName));
      }
    })
    .catch((err) => {
      console.error(`Failed to include ${file}:`, err);
    });
}
