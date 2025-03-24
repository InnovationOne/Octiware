// search.js
(function() {
  // Wait for the custom event that signals the header snippet is in the DOM
  document.addEventListener('wikiHeaderLoaded', async () => {
    console.log('wikiHeaderLoaded event received: Setting up search...');
    
    // Now these elements should exist
    const searchInput = document.getElementById('wiki-search-input');
    const resultsContainer = document.getElementById('autocomplete-results');
    if (!searchInput || !resultsContainer) {
      console.error('Search elements not found, even after injection!');
      return;
    }

    // 1. Fetch your wiki data
    let wikiData;
    try {
      const response = await fetch('./data/wikiData.json');
      if (!response.ok) throw new Error('Network response was not OK');
      wikiData = await response.json();
    } catch (err) {
      console.error('Could not load wikiData.json:', err);
      return;
    }

    // 2. Initialize Fuse
    const fuse = new Fuse(wikiData, {
      keys: [
        { name: 'title', weight: 2 },
        { name: 'content', weight: 1 }
      ],
      threshold: 0.3,
      includeScore: true
    });

    // 3. Listen for input
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.trim();
      resultsContainer.innerHTML = '';

      if (!query) {
        resultsContainer.style.display = 'none';
        return;
      }

      const results = fuse.search(query, { limit: 8 });
      if (results.length === 0) {
        resultsContainer.innerHTML = `<div class="autocomplete-item">No results found</div>`;
        resultsContainer.style.display = 'block';
        return;
      }

      results.forEach(({ item }) => {
        const div = document.createElement('div');
        div.classList.add('autocomplete-item');
        let snippet = item.content;
        if (snippet.length > 80) snippet = snippet.substring(0, 80) + '...';

        // If there's a thumbnail
        const thumbHTML = item.thumbnail
          ? `<img src="${item.thumbnail}" alt="${item.title}" class="autocomplete-item-thumb" />`
          : '';

        div.innerHTML = `
          ${thumbHTML}
          <div class="autocomplete-text">
            <div class="autocomplete-item-title">${item.title}</div>
            <div class="autocomplete-item-summary">${snippet}</div>
          </div>
        `;

        div.addEventListener('click', () => {
          window.location.href = item.url;
        });
        resultsContainer.appendChild(div);
      });

      // "See all results"
      const seeAll = document.createElement('div');
      seeAll.classList.add('autocomplete-item', 'autocomplete-see-all');
      seeAll.innerHTML = `See all results for <strong>${query}</strong>`;
      seeAll.addEventListener('click', () => {
        alert(`All results for: ${query}`);
      });
      resultsContainer.appendChild(seeAll);

      resultsContainer.style.display = 'block';
    });

    // 4. Hide dropdown if user clicks outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.wiki-search-form')) {
        resultsContainer.style.display = 'none';
      }
    });
  });
})();
