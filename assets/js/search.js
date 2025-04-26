let fuse;

// Lade JSON-Daten von dynamischem Pfad (gesetzt in HTML)
fetch(SEARCH_JSON_URL)
  .then(res => res.json())
  .then(data => {
    const options = {
      includeScore: true,
      threshold: 0.3,
      keys: [
        "title",
        "categories",
        "infobox.status",
        "infobox.classification.domain",
        "infobox.classification.kingdom",
        "infobox.classification.class",
        "content"
      ]
    };
    fuse = new Fuse(data, options);
  });

const input = document.getElementById('wiki-search-input');
const resultsBox = document.getElementById('autocomplete-results');

input.addEventListener('input', () => {
  const query = input.value.trim().toLowerCase();
  resultsBox.innerHTML = '';
  resultsBox.style.display = 'none';

  if (!query || !fuse) return;

  const results = fuse.search(query).slice(0, 8);

  if (results.length === 0) return;

  results.forEach(result => {
    const item = result.item;
    const el = document.createElement('a');
    el.href = item.url;
    el.className = 'autocomplete-item';

    // === Thumbnail-Logik ===
    let thumbSrc = '/img/wiki-placeholder.png';
    if (item.thumbnail) {
      thumbSrc = item.thumbnail;
    } else if (item.infobox && item.infobox.grid && item.infobox.grid.length > 0) {
      thumbSrc = item.infobox.grid[0];
    }

    const thumb = document.createElement('img');
    thumb.src = thumbSrc;
    thumb.className = 'autocomplete-item-thumb';
    el.appendChild(thumb);

    // === Text-Vorschau ===
    const textBox = document.createElement('div');
    textBox.className = 'autocomplete-text';

    const title = document.createElement('div');
    title.className = 'autocomplete-item-title';
    title.textContent = item.title;

    const summary = document.createElement('div');
    summary.className = 'autocomplete-item-summary';
    summary.textContent = item.content;

    textBox.appendChild(title);
    textBox.appendChild(summary);
    el.appendChild(textBox);
    resultsBox.appendChild(el);
  });

  resultsBox.style.display = 'block';
});
