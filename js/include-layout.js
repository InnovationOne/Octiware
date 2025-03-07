document.addEventListener('DOMContentLoaded', () => {
  includeHTML('header-placeholder', 'header.html');
  includeHTML('contact-placeholder', 'contact-section.html');
  includeHTML('footer-placeholder', 'footer.html');
});

function includeHTML(containerId, file) {
  fetch(file)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Error fetching ${file}`);
      }
      return response.text();
    })
    .then(data => {
      document.getElementById(containerId).innerHTML = data;
    })
    .catch(err => {
      console.error(`Failed to include ${file}:`, err);
    });
}
