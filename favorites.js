(() => {
  if (window.voyaraFavoritesLoaded) return;
  window.voyaraFavoritesLoaded = true;
  const storageKey = "voyara-favorites-v1";
  const rootPrefix = location.pathname.includes("/html-preview/Voyara/") ? "../" : "";
  const read = () => { try { const items = JSON.parse((window.VoyaraStore || localStorage).getItem(storageKey) || "[]"); return Array.isArray(items) ? (window.VoyaraResolveFavorites||((items)=>items))(items.filter(item=>item && typeof item.title === "string" && typeof item.link === "string")) : []; } catch { return []; } };
  const write = (items) => (window.VoyaraStore || localStorage).setItem(storageKey, JSON.stringify(items));
  const backgroundUrl = (element) => {
    const value = element?.style?.backgroundImage || getComputedStyle(element || document.body).backgroundImage;
    return value && value !== "none" ? value.replace(/^url\(["']?|["']?\)$/g, "") : "";
  };
  const cardFor = (button) => button.closest("[data-community-href],.experience-card,.result-card,.listing-card,.guides article,.voyager-ad-card,.post-card,.route-card,.social-post");
  const detailsFor = (button) => {
    const card = cardFor(button);
    const title = card?.querySelector("h2,h3,.social-post-copy p")?.textContent.trim() || button.getAttribute("aria-label")?.replace(/^(Save|Unsave|Favorite)\s+/i, "") || document.title.split("|")[0].trim();
    const activityLinks = {"Exuma Cays & Swimming Pigs":"activity-detail.html?id=exuma-cays","Azure Beach Club Day Pass":"activity-detail.html?id=azure-day-pass","Island Chef’s Table by the Water":"activity-detail.html?id=chef-table","Small-Group Sunset Sail":"activity-detail.html?id=sunset-sail","Hidden Eleuthera with a Local":"activity-detail.html?id=hidden-eleuthera","Oceanfront Spa Ritual":"activity-detail.html?id=ocean-spa","Turtle Cove Reef Cruise":"activity-detail.html?id=turtle-cove","Sunset Beach Session":"event-detail.html?id=sunset-session","Nassau Highlights & Tastings":"activity-detail.html?id=nassau-city","Nassau Art Walk After Dark":"event-detail.html?id=art-walk","Exuma Sound Weekend":"event-detail.html?id=exuma-live"};
    const guideLinks = {"Best Food in Nassau":"nassau-food-guide.html","The Perfect Day in Rose Island":"rose-island-itinerary.html","Girls Trip Weekend in Nassau":"girls-trip-itinerary.html"};
    const imageElement = card?.querySelector(".experience-card-image,.result-image,.listing-image,.voyager-ad-image,.route-cover,[style*='background-image']");
    const image = backgroundUrl(imageElement || card) || card?.querySelector("img")?.src || "assets/voyara-hero-v2.png";
    if (card?.classList.contains('social-post') && !card.id) card.id = 'voyage-' + (button.dataset.save || 'post').replace(/[^a-z0-9-]/gi,'-');
    const linkRaw = (card?.classList.contains('social-post') ? 'voyagers.html#' + card.id : null) || card?.dataset.communityHref || card?.querySelector("h2 a,h3 a,a.primary-action,a.result-image")?.getAttribute("href") || activityLinks[title] || guideLinks[title] || (card?.closest(".guides") ? "things-to-do.html?category=guides" : location.pathname.split("/").pop() + location.search);
    const url = new URL(linkRaw, location.href);
    ['date','time','guests','returnTo','from'].forEach(key => url.searchParams.delete(key));
    const link = url.pathname.split('/').pop() + url.search + url.hash;
    const id = button.dataset.save || `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${link}`;
    const type = card?.querySelector(".pill,.listing-badge,.result-kicker")?.textContent.trim() || (card?.classList.contains("experience-card") ? "Experience" : "Voyara favorite");
    return { id, title, image, link, type, savedAt: Date.now() };
  };
  const sameFavorite = (saved, item) => {
    const normalize = link => { const url = new URL(link || 'favorites.html', location.href); ['date','time','guests','returnTo','from'].forEach(key => url.searchParams.delete(key)); return url.pathname + url.search + url.hash; };
    const target = normalize(item.link);
    const pointsToItem = /(?:activity|event|itinerary|guide)-detail\.html\?/.test(target) || /(?:-guide|-itinerary)\.html$/.test(target) || /voyagers\.html#.+/.test(target);
    return saved.id === item.id || (normalize(saved.link) === target && (pointsToItem || saved.title === item.title));
  };
  const active = (button) => button.classList.contains("saved") || button.classList.contains("heart-active");
  const setVisual = (button, isSaved) => {
    if (button.classList.contains("experience-heart") || button.classList.contains("save-card") || button.classList.contains("community-save-guide") || button.classList.contains("social-save")) button.classList.toggle("saved", isSaved);
    else button.classList.toggle("heart-active", isSaved);
    button.setAttribute("aria-pressed", String(isSaved));
    if(button.classList.contains("social-save")) button.setAttribute("aria-label",isSaved?"Unsave voyage":"Save voyage");
    else button.setAttribute("aria-label", `${isSaved ? "Unsave" : "Save"} ${detailsFor(button).title}`);
  };

  const favoriteButtons = [...document.querySelectorAll("button.heart,button.experience-heart,button.save-card,button.post-card-heart,button.community-save-guide,button.social-save")];
  favoriteButtons.forEach((button) => {
    const item = detailsFor(button);
    const exists = read().some((saved) => sameFavorite(saved, item));
    setVisual(button, exists);
    button.addEventListener("click", (event) => {
      if(button.classList.contains("social-save"))event.stopImmediatePropagation();
      queueMicrotask(() => {
        let items = read();
        const isSaved = !items.some(saved => sameFavorite(saved, item));
        if (isSaved) items = [detailsFor(button), ...items.filter((saved) => !sameFavorite(saved, item))];
        else items = items.filter((saved) => !sameFavorite(saved, item));
        try { write(items); } catch { window.notify?.("Could not save this change. Your collection has not changed."); syncCollection(); return; }
        setVisual(button,isSaved);
        if(button.classList.contains("social-save"))window.notify?.(isSaved?"Post saved to your collection.":"Post removed from your collection.");
        renderHeaderPreview();
        renderFavoritesPage();
      });
    },true);
  });

  const headerButton = document.querySelector(".header .heart-icon")?.closest("button,a");
  let panel;
  if (headerButton) {
    headerButton.classList.add("favorites-trigger");
    headerButton.setAttribute("aria-label", "Favorites");
    headerButton.setAttribute("aria-haspopup", "dialog");
    headerButton.setAttribute("aria-expanded", "false");
    panel = document.createElement("section");
    panel.className = "favorites-preview";
    panel.hidden = true;
    panel.innerHTML = `<header><div><span>YOUR COLLECTION</span><h2>Favorites</h2></div><button type="button" data-close-favorites aria-label="Close favorites">×</button></header><div data-recent-favorite></div><a class="favorites-view-all" href="${rootPrefix}favorites.html">View all favorites</a>`;
    headerButton.parentElement.append(panel);
    const close = () => { panel.hidden = true; headerButton.setAttribute("aria-expanded", "false"); };
    headerButton.addEventListener("click", (event) => { event.preventDefault(); event.stopPropagation(); panel.hidden = !panel.hidden; headerButton.setAttribute("aria-expanded", String(!panel.hidden)); if (!panel.hidden) renderHeaderPreview(); });
    panel.addEventListener("click", (event) => event.stopPropagation());
    panel.querySelector("[data-close-favorites]").addEventListener("click", close);
    document.addEventListener("click", (event) => { if (!panel.contains(event.target) && !headerButton.contains(event.target)) close(); });
    document.addEventListener("keydown", (event) => { if (event.key === "Escape") close(); });
  }

  function renderHeaderPreview() {
    if (!panel) return;
    const latest = read().sort((a,b) => b.savedAt - a.savedAt)[0];
    const root = panel.querySelector("[data-recent-favorite]");
    root.innerHTML = latest ? `<p class="favorites-recent-label">Most recently saved</p><a class="favorites-recent-card" href="${rootPrefix}${escape(latest.link)}"><img src="${escape(latest.image)}" alt=""><span><small>${escape(latest.type)}</small><strong>${escape(latest.title)}</strong></span></a>` : `<div class="favorites-preview-empty"><span>♡</span><strong>No favorites yet</strong><p>Tap a heart to save something here.</p></div>`;
  }
  let savedCategory = 'all';
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const categoryFor = item => /event-detail|sunset-beach-session|nassau-art-walk|exuma-sound-weekend/.test(item.link) ? 'event' : /itinerary|itineraries/.test(item.link) ? 'itinerary' : /activity-detail/.test(item.link) ? 'experience' : 'other';
  const names = {all:'favourites',experience:'experiences',event:'events',itinerary:'itineraries',other:'guides & more'};
  const savedTabs = [...document.querySelectorAll('[data-saved-tab]')];
  savedTabs.forEach((tab,index)=>{
    tab.addEventListener('click',()=>{savedCategory=tab.dataset.savedTab;renderFavoritesPage();});
    tab.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?savedTabs.length-1:(index+(e.key==='ArrowRight'?1:-1)+savedTabs.length)%savedTabs.length;savedTabs[next].click();savedTabs[next].focus();});
  });
  function renderFavoritesPage() {
    const grid = document.querySelector('#favorites-grid');
    if (!grid) return;
    const all = read().sort((a,b)=>b.savedAt-a.savedAt);
    const items = all.filter(item=>savedCategory==='all'||categoryFor(item)===savedCategory);
    savedTabs.forEach(tab=>{const active=tab.dataset.savedTab===savedCategory;tab.setAttribute('aria-selected',active);tab.tabIndex=active?0:-1;});
    grid.setAttribute('aria-labelledby','saved-'+savedCategory);
    document.querySelector('#favorites-count').textContent=`${all.length} saved ${all.length===1?'favourite':'favourites'}`;
    grid.innerHTML = items.length ? items.map(item=>`<article class="favorite-page-card"><a href="${escape(item.link)}"><img src="${escape(item.image)}" alt=""><div><small>${escape(names[categoryFor(item)])}</small><h2>${escape(item.title)}</h2><span>View details</span></div></a><button type="button" data-remove-favorite="${escape(item.id)}" aria-label="Remove ${escape(item.title)}">♥</button></article>`).join('') : `<div class="collection-empty"><span class="collection-empty-icon" aria-hidden="true">♡</span><h3>${savedCategory==='all'?'A little inspiration for later':`No saved ${names[savedCategory]} yet`}</h3><p>Tap a heart as you explore to keep your favourite island moments here.</p><a class="collection-cta" href="${savedCategory==='event'?'events.html':savedCategory==='itinerary'?'itineraries.html':'things-to-do.html'}">${savedCategory==='event'?'Explore events':savedCategory==='itinerary'?'Explore itineraries':'Explore experiences'}</a></div>`;
    grid.querySelectorAll('[data-remove-favorite]').forEach(button=>button.addEventListener('click',()=>{
      const index=[...grid.querySelectorAll('[data-remove-favorite]')].indexOf(button);
      write(read().filter(item=>item.id!==button.dataset.removeFavorite));renderFavoritesPage();renderHeaderPreview();
      const remaining=grid.querySelectorAll('[data-remove-favorite]');(remaining[Math.min(index,remaining.length-1)]||savedTabs.find(tab=>tab.dataset.savedTab===savedCategory))?.focus();
    }));
  }
  const syncCollection = () => {
    favoriteButtons.forEach(button => setVisual(button, read().some(item => sameFavorite(item, detailsFor(button)))));
    renderHeaderPreview(); renderFavoritesPage();
  };
  window.addEventListener('voyara:auth-change', syncCollection);
  window.addEventListener('voyara:collections-change', syncCollection);
  window.addEventListener('storage', syncCollection);
  window.addEventListener('pageshow', syncCollection);
  syncCollection();
})();
