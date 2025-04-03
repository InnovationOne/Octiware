/* timeline.js */
document.addEventListener("DOMContentLoaded", () => {
  const nav = document.getElementById("epoch-nav");
  const timelineWrapper = document.getElementById("timeline-wrapper");
  const overlay = document.getElementById("event-overlay");
  const overlayDetails = document.getElementById("overlay-details");
  const closeOverlayBtn = document.getElementById("closeOverlay");

  // Keep references to sub-epoch blocks & event-contents so we can reapply backgrounds
  let subEpochBlocks = [];
  let eventContents = [];

  function isDarkMode() {
    return document.documentElement.classList.contains("dark-mode");
  }

  function hexToRGBA(hex, alpha = 1) {
    let c;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
      c = hex.substring(1).split("");
      if (c.length === 3) {
        c = [c[0], c[0], c[1], c[1], c[2], c[2]];
      }
      const r = parseInt(c[0] + c[1], 16);
      const g = parseInt(c[2] + c[3], 16);
      const b = parseInt(c[4] + c[5], 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return hex;
  }

  function pastelOverWhite(hex, alpha = 0.15) {
    const rgba = hexToRGBA(hex, alpha);
    return `linear-gradient(${rgba}, ${rgba}), #fff`;
  }

  function pastelOverDark(hex, alpha = 0.15) {
    const rgba = hexToRGBA(hex, alpha);
    return `linear-gradient(${rgba}, ${rgba}), #222`;
  }

  const eventTypeColors = {
    war: "#ff5b5b",
    discovery: "#5b9fff",
    politics: "#aa66cc",
    technology: "#54d86a",
    default: "#999"
  };

  let timelineData = null;

  fetch("data/timeline.json")
    .then(res => res.json())
    .then(json => {
      timelineData = json;
      buildNav(timelineData.epochs);
      buildTimeline(timelineData.epochs);
      initObserver();
    })
    .catch(err => console.error("Error loading JSON:", err));

  /* Listen for the custom 'themeChanged' event from main.js */
  document.addEventListener('themeChanged', reapplyColors);

  function buildNav(epochs) {
    epochs.forEach(epoch => {
      const epochItem = document.createElement("div");
      epochItem.classList.add("epoch-item");

      const epochBtn = document.createElement("button");
      epochBtn.classList.add("epoch-btn");
      epochBtn.textContent = epoch.title;
      if (epoch.color) {
        epochBtn.style.borderLeftColor = epoch.color;
      }

      epochBtn.addEventListener("click", () => {
        document.getElementById(epoch.id).scrollIntoView({ behavior: "smooth" });
      });
      epochItem.appendChild(epochBtn);

      const subList = document.createElement("div");
      subList.classList.add("subepoch-list");
      epochItem.appendChild(subList);

      nav.appendChild(epochItem);
    });
  }

  function buildTimeline(epochs) {
    epochs.forEach(epoch => {
      const epBlock = document.createElement("div");
      epBlock.classList.add("epoch-block");
      epBlock.id = epoch.id;

      const header = document.createElement("div");
      header.classList.add("epoch-header");

      const h2 = document.createElement("h2");
      h2.classList.add("epoch-title");
      h2.textContent = epoch.title;
      if (epoch.color) {
        h2.style.color = epoch.color;
      }

      const tf = document.createElement("div");
      tf.classList.add("epoch-timeframe");
      tf.textContent = epoch.timeframe;

      header.appendChild(h2);
      header.appendChild(tf);
      epBlock.appendChild(header);

      if (epoch.subepochs && epoch.subepochs.length > 0) {
        epoch.subepochs.forEach(sub => {
          const subBox = document.createElement("div");
          subBox.classList.add("subepoch-block");
          subBox.id = sub.id;

          if (epoch.color) {
            // Store color & alpha approach in dataset for dynamic reapply
            subBox.dataset.epochColor = epoch.color;
            subBox.dataset.alpha = 0.15; // sub-epoch alpha
          }

          const st = document.createElement("h3");
          st.classList.add("subepoch-title");
          st.textContent = sub.title;

          const stf = document.createElement("div");
          stf.classList.add("subepoch-timeframe");
          stf.textContent = sub.timeframe;

          const sd = document.createElement("p");
          sd.classList.add("subepoch-description");
          sd.textContent = sub.description || "";

          subBox.appendChild(st);
          subBox.appendChild(stf);
          subBox.appendChild(sd);
          epBlock.appendChild(subBox);

          /* Keep track for dynamic recoloring */
          subEpochBlocks.push(subBox);

          /* EVENTS */
          if (sub.events && sub.events.length > 0) {
            sub.events.forEach((ev, idx) => {
              const evBox = document.createElement("div");
              evBox.classList.add("event-wrapper");
              if (idx % 2 === 0) {
                evBox.classList.add("event-left");
              } else {
                evBox.classList.add("event-right");
              }

              const connector = document.createElement("div");
              connector.classList.add("connector-line");
              evBox.appendChild(connector);

              const dot = document.createElement("div");
              dot.classList.add("event-dot");
              const clr = ev.type && eventTypeColors[ev.type]
                ? eventTypeColors[ev.type]
                : (epoch.color || eventTypeColors.default);
              dot.style.backgroundColor = clr;
              evBox.appendChild(dot);

              /* event-content for text */
              const contentWrapper = document.createElement("div");
              contentWrapper.classList.add("event-content");
              // store color info for dynamic recoloring
              if (epoch.color) {
                contentWrapper.dataset.epochColor = epoch.color;
                contentWrapper.dataset.alpha = 0.07; // event alpha
              }

              const et = document.createElement("div");
              et.classList.add("event-title");
              et.textContent = ev.title;

              const edate = document.createElement("div");
              edate.classList.add("event-date");
              edate.textContent = ev.date;

              const eDesc = document.createElement("div");
              eDesc.classList.add("event-description");
              eDesc.textContent = ev.description;

              contentWrapper.appendChild(et);
              contentWrapper.appendChild(edate);
              contentWrapper.appendChild(eDesc);

              evBox.appendChild(contentWrapper);

              evBox.addEventListener("click", () => {
                showOverlay(ev);
              });

              epBlock.appendChild(evBox);

              /* Keep track for dynamic recoloring */
              eventContents.push(contentWrapper);
            });
          }
        });
      }

      timelineWrapper.appendChild(epBlock);
    });

    /* Initial coloring after build */
    reapplyColors();
  }

  /* 2) On theme change, re-apply backgrounds. */
  function reapplyColors() {
    // subEpochBlocks
    subEpochBlocks.forEach(block => {
      const col = block.dataset.epochColor;
      const alpha = parseFloat(block.dataset.alpha);
      if (!col) return;
      if (isDarkMode()) {
        block.style.background = pastelOverDark(col, alpha);
      } else {
        block.style.background = pastelOverWhite(col, alpha);
      }
    });
    // eventContents
    eventContents.forEach(ec => {
      const col = ec.dataset.epochColor;
      const alpha = parseFloat(ec.dataset.alpha);
      if (!col) return;
      if (isDarkMode()) {
        ec.style.background = pastelOverDark(col, alpha);
      } else {
        ec.style.background = pastelOverWhite(col, alpha);
      }
    });
  }

  function initObserver() {
    const opts = { root: null, threshold: 0.3 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          highlightEpoch(entry.target.id);
          fillSubEpochs(entry.target.id);
        }
      });
    }, opts);
    document.querySelectorAll(".epoch-block").forEach(blk => {
      observer.observe(blk);
    });
  }

  function highlightEpoch(epochId) {
    const allItems = document.querySelectorAll(".epoch-item");
    allItems.forEach(i => i.classList.remove("active"));
    const block = document.getElementById(epochId);
    if (!block) return;
    const titleElement = block.querySelector(".epoch-title");
    const epTitle = titleElement ? titleElement.textContent.trim() : "";
    const match = [...allItems].find(it => {
      const b = it.querySelector(".epoch-btn");
      return b && b.textContent.trim() === epTitle;
    });
    if (match) {
      match.classList.add("active");
      match.scrollIntoView({ block: "nearest" });
    }
  }

  function fillSubEpochs(epochId) {
    const allItems = document.querySelectorAll(".epoch-item");
    allItems.forEach(i => {
      const s = i.querySelector(".subepoch-list");
      if (s) s.innerHTML = "";
    });

    if (!timelineData) return;
    const epochObj = timelineData.epochs.find(e => e.id === epochId);
    if (!epochObj) return;
    const epTitle = epochObj.title.trim();
    const match = [...allItems].find(i => {
      const b = i.querySelector(".epoch-btn");
      return b && b.textContent.trim() === epTitle;
    });
    if (!match) return;
    match.classList.add("active");
    const sList = match.querySelector(".subepoch-list");
    if (!sList || !epochObj.subepochs) return;

    if (epochObj.color) {
      sList.style.borderLeftColor = epochObj.color;
    }

    epochObj.subepochs.forEach(sub => {
      const sb = document.createElement("button");
      sb.classList.add("subepoch-btn");
      sb.textContent = sub.title;
      if (epochObj.color) {
        sb.style.borderLeftColor = epochObj.color;
      }
      sb.addEventListener("click", () => {
        document.getElementById(sub.id).scrollIntoView({ behavior: "smooth" });
      });
      sList.appendChild(sb);
    });
  }

  function showOverlay(evData) {
    overlayDetails.innerHTML = "";
    const h2 = document.createElement("h2");
    h2.textContent = evData.title;
    overlayDetails.appendChild(h2);

    const pdate = document.createElement("p");
    pdate.classList.add("event-date");
    pdate.innerHTML = `<em>${evData.date}</em>`;
    overlayDetails.appendChild(pdate);

    const desc = document.createElement("p");
    desc.textContent = evData.description;
    overlayDetails.appendChild(desc);

    if (evData.extendedDescription) {
      const ext = document.createElement("p");
      ext.classList.add("extended-desc");
      ext.textContent = evData.extendedDescription;
      overlayDetails.appendChild(ext);
    }

    if (evData.imageUrl) {
      const img = document.createElement("img");
      img.src = evData.imageUrl;
      overlayDetails.appendChild(img);
    }

    overlay.classList.remove("hidden");
  }

  closeOverlayBtn.addEventListener("click", () => {
    overlay.classList.add("hidden");
  });
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.classList.add("hidden");
    }
  });
});
