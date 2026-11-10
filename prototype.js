const pageNotice = document.querySelector("#prototype-notice");
const pageModal = document.querySelector("#prototype-modal");

function animateFavorite(button, active) {
  button.setAttribute("aria-pressed", String(active));
  button.classList.remove("heart-pop");
  void button.offsetWidth;
  if (active) button.classList.add("heart-pop");
}

document.querySelectorAll('a[href="discover.html"]').forEach((link) => {
  link.setAttribute("href", "index.html");
});

function notify(message) {
  if (!pageNotice) return;
  pageNotice.textContent = `${message}  ×`;
  pageNotice.hidden = false;
  window.clearTimeout(window.voyaraNoticeTimer);
  window.voyaraNoticeTimer = window.setTimeout(() => { pageNotice.hidden = true; }, 3500);
}

pageNotice?.addEventListener("click", () => { pageNotice.hidden = true; });

const readArray = key => { try { const value = JSON.parse((window.VoyaraStore || localStorage).getItem(key) || '[]'); return Array.isArray(value) ? value : []; } catch { return []; } };
const savedItems = new Set(readArray('voyara-saved'));
document.querySelectorAll(".save-card, .social-save").forEach((button) => {
  const key = button.dataset.save;
  if (savedItems.has(key)) {
    button.classList.add("saved");
    button.textContent = button.classList.contains("social-save") ? "♣" : "♥";
    button.setAttribute("aria-pressed", "true");
  } else {
    button.setAttribute("aria-pressed", "false");
  }
  button.addEventListener("click", () => {
    button.classList.toggle("saved");
    if (button.classList.contains("saved")) savedItems.add(key); else savedItems.delete(key);
    button.textContent = button.classList.contains("saved") ? (button.classList.contains("social-save") ? "♣" : "♥") : (button.classList.contains("social-save") ? "♧" : "♡");
    animateFavorite(button, button.classList.contains("saved"));
    (window.VoyaraStore || localStorage).setItem("voyara-saved", JSON.stringify([...savedItems]));
    notify(button.classList.contains("saved") ? "Saved to your Voyara collection." : "Removed from saved items.");
  });
});

const followedVoyagers = new Set(readArray('voyara-following'));
document.querySelectorAll(".follow").forEach((button) => {
  const creator = button.dataset.creator;
  if (followedVoyagers.has(creator)) {
    button.classList.add("following");
    button.textContent = "Following";
    button.setAttribute("aria-pressed", "true");
  } else button.setAttribute("aria-pressed", "false");
  button.addEventListener("click", () => {
    button.classList.toggle("following");
    button.textContent = button.classList.contains("following") ? "Following" : "Follow";
    button.setAttribute("aria-pressed", String(button.classList.contains("following")));
    if (button.classList.contains("following")) followedVoyagers.add(creator); else followedVoyagers.delete(creator);
    (window.VoyaraStore || localStorage).setItem("voyara-following", JSON.stringify([...followedVoyagers]));
    notify(button.classList.contains("following") ? `You’re now following ${button.dataset.creator}.` : `Unfollowed ${button.dataset.creator}.`);
  });
});

if (document.body.dataset.searchController !== 'islandly') {
const searchInput = document.querySelector("#page-search");
const categorySelect = document.querySelector("#category-filter");
const islandSelect = document.querySelector("#island-filter");
const priceSelect = document.querySelector("#price-filter");
const resultCount = document.querySelector("#result-count");
const appTomorrowFilter = document.querySelector("#app-tomorrow-filter");
const appGuestsFilter = document.querySelector("#app-guests-filter");
const appPriceFilter = document.querySelector("#app-price-filter");
const appActivityFilter = document.querySelector("#app-activity-filter");
const appRatingFilter = document.querySelector("#app-rating-filter");
const searchDate = document.querySelector("#search-date");
const searchTravelers = document.querySelector("#search-travelers");

if (searchInput) {
  const incomingParams = new URLSearchParams(window.location.search);
  const incomingQuery = incomingParams.get("q");
  if (incomingQuery) searchInput.value = incomingQuery;
  const incomingCategory = incomingParams.get("category");
  if (incomingCategory) {
    [...document.querySelectorAll("[data-filter-category]")].find(input => input.value === incomingCategory)?.setAttribute("checked", "checked");
    document.querySelectorAll("[data-category-chip]").forEach((chip) => chip.classList.toggle("active", chip.dataset.categoryChip === incomingCategory));
    if (islandSelect && incomingCategory === "guides") islandSelect.value = "all";
  }
}

function refreshResultsMap() {
  const surface = document.querySelector("#results-map-surface");
  if (!surface) return;
  const visibleCards = [...document.querySelectorAll("#results-list [data-filter-card]:not(.hidden-card)")];
  surface.innerHTML = visibleCards.map((card, index) => {
    const title = card.querySelector("h2")?.textContent.trim() || "Voyara experience";
    const href = card.querySelector("h2 a, .result-image")?.getAttribute("href") || "#";
    const price = Number(card.dataset.price || 0);
    const left = 15 + ((index * 23) % 72);
    const top = 18 + ((index * 31) % 67);
    const priceLabel = price ? `$${price}` : "Free";
    return `<a class="result-map-pin" href="${href}" style="left:${left}%;top:${top}%" aria-label="${title}, ${priceLabel}">${priceLabel}<span>${title}</span></a>`;
  }).join("");
}

function filterCards() {
  const query = (searchInput?.value || "").trim().toLowerCase();
  const queryTerms = query.split(/[\s,]+/).filter(Boolean);
  const category = categorySelect?.value || document.querySelector("[data-category-chip].active")?.dataset.categoryChip || "all";
  const island = islandSelect?.value || "all";
  const checkedCategories = [...document.querySelectorAll("[data-filter-category]:checked")].map((input) => input.value);
  const checkedDurations = [...document.querySelectorAll("[data-filter-duration]:checked")].map((input) => Number(input.value));
  const checkedTimes = [...document.querySelectorAll("[data-filter-time]:checked")].map((input) => input.value);
  const checkedFeatures = [...document.querySelectorAll("[data-filter-feature]:checked")].map((input) => input.value);
  const maxPrice = Number(document.querySelector('input[name="result-price"]:checked')?.value || priceSelect?.value || 9999);
  const minRating = Number(document.querySelector('input[name="result-rating"]:checked')?.value || 0);
  let visible = 0;
  document.querySelectorAll("[data-filter-card]").forEach((card) => {
    const text = card.textContent.toLowerCase();
    const duration = Number(card.dataset.duration || 0);
    const durationMatches = !checkedDurations.length || checkedDurations.some((choice) => {
      if (choice === 2) return duration <= 2;
      if (choice === 4) return duration > 2 && duration <= 4;
      if (choice === 8) return duration > 4 && duration < 8;
      return duration >= 8;
    });
    const cardTimes = (card.dataset.time || "").split(" ");
    const cardFeatures = (card.dataset.features || "").split(" ");
    const discoverMode = document.body.dataset.discoverMode;
    const modeMatches = !discoverMode || (discoverMode === 'events' ? card.dataset.category === 'events' : card.dataset.category !== 'events');
    const eventType = document.body.dataset.eventCategory || "all";
    const eventMatches = discoverMode !== "events" || eventType === "all" || (card.dataset.eventTypes || "").split(" ").includes(eventType);
    const dateMatches = !searchDate?.value || card.dataset.category !== 'events' || card.dataset.eventDate === searchDate.value.replaceAll('-', '');
    card.querySelectorAll('a[href*="-detail.html"]').forEach(link => {
      const url = new URL(link.getAttribute('href'), location.href);
      if (searchDate?.value && card.dataset.category !== 'events') url.searchParams.set('date', searchDate.value); else url.searchParams.delete('date');
      if (searchTravelers) url.searchParams.set('guests', searchTravelers.value);
      link.setAttribute('href', url.pathname.split('/').pop() + url.search);
    });
    const show = dateMatches && modeMatches && eventMatches && (!queryTerms.length || queryTerms.some((term) => text.includes(term)))
      && (category === "all" || card.dataset.category === category)
      && (!checkedCategories.length || checkedCategories.includes(card.dataset.category))
      && (island === "all" || card.dataset.island === island)
      && Number(card.dataset.price || 0) <= maxPrice
      && Number(card.dataset.rating || 0) >= minRating
      && durationMatches
      && (!checkedTimes.length || checkedTimes.some((time) => cardTimes.includes(time)))
      && checkedFeatures.every((feature) => cardFeatures.includes(feature));
    card.classList.toggle("hidden-card", !show);
    if (show) visible += 1;
  });
  if (resultCount) resultCount.textContent = `${visible} ${visible === 1 ? "result" : "results"}`;
  document.querySelector("#empty-state")?.classList.toggle("visible", visible === 0);
  refreshResultsMap();
}

[searchInput, categorySelect, islandSelect, priceSelect, searchDate, searchTravelers].forEach((control) => control?.addEventListener("input", filterCards));
document.querySelectorAll('[data-filter-category],[data-filter-duration],[data-filter-time],[data-filter-feature],input[name="result-price"],input[name="result-rating"]').forEach((control) => control.addEventListener("change", filterCards));
filterCards();

document.querySelectorAll("[data-category-chip]").forEach((chip) => {
  chip.addEventListener("click", () => {
    document.querySelectorAll(".chip-row .chip").forEach((item) => item.classList.remove("active"));
    chip.classList.add("active");
    if (categorySelect) categorySelect.value = chip.dataset.categoryChip;
    document.querySelectorAll("[data-filter-category]").forEach((input) => { input.checked = chip.dataset.categoryChip !== "all" && input.value === chip.dataset.categoryChip; });
    filterCards();
  });
});

document.querySelectorAll(".community-save-guide").forEach((button) => button.addEventListener("click", () => {
  const saved = button.classList.toggle("saved");
  button.textContent = saved ? "Saved ✓" : `${document.body.querySelector(".community-detail-type")?.textContent === "GUIDE" ? "Save guide" : "Save itinerary"} ♡`;
}));

document.querySelector(".influencer-chip")?.addEventListener("click", (event) => {
  event.preventDefault();
  document.querySelectorAll(".chip-row .chip").forEach((item) => item.classList.remove("active"));
  event.currentTarget.classList.add("active");
  if (categorySelect) categorySelect.value = "all";
  filterCards();
  document.querySelector("#influencer-itineraries")?.scrollIntoView({ behavior: "smooth", block: "start" });
});

document.querySelector("[data-search-submit]")?.addEventListener("click", filterCards);
document.querySelector("[data-filter-toggle]")?.addEventListener("click", () => {
  document.querySelector("#results-filters")?.classList.toggle("open");
});
document.querySelector("#clear-filters")?.addEventListener("click", () => {
  document.querySelectorAll('#results-filters input[type="checkbox"]').forEach((input) => { input.checked = false; });
  document.querySelectorAll('#results-filters input[type="radio"]').forEach((input) => { input.checked = input.value === "9999" || input.value === "0"; });
  if (islandSelect) islandSelect.value = "all";
  if (searchInput) searchInput.value = "";
  document.querySelectorAll("[data-category-chip]").forEach((chip) => chip.classList.toggle("active", chip.dataset.categoryChip === "all"));
  if (appPriceFilter) appPriceFilter.value = "9999";
  if (appActivityFilter) appActivityFilter.value = "all";
  if (appRatingFilter) appRatingFilter.value = "0";
  if (appGuestsFilter) appGuestsFilter.value = "2";
  if (searchTravelers) searchTravelers.value = "2";
  if (searchDate) searchDate.value = "";
  appTomorrowFilter?.classList.remove("active");
  filterCards();
});

if (appTomorrowFilter && searchDate) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  searchDate.value = tomorrow.toISOString().slice(0, 10);
  appTomorrowFilter.addEventListener("click", () => {
    const enabled = appTomorrowFilter.classList.toggle("active");
    searchDate.value = enabled ? tomorrow.toISOString().slice(0, 10) : "";
  });
  searchDate.addEventListener("change", () => appTomorrowFilter.classList.toggle("active", searchDate.value === tomorrow.toISOString().slice(0, 10)));
}

appGuestsFilter?.addEventListener("change", () => { if (searchTravelers) searchTravelers.value = appGuestsFilter.value; });
searchTravelers?.addEventListener("change", () => { if (appGuestsFilter) appGuestsFilter.value = searchTravelers.value; });

appPriceFilter?.addEventListener("change", () => {
  const radio = document.querySelector(`input[name="result-price"][value="${appPriceFilter.value}"]`);
  if (radio) radio.checked = true;
  filterCards();
});

appActivityFilter?.addEventListener("change", () => {
  document.querySelectorAll("[data-filter-category]").forEach((input) => { input.checked = appActivityFilter.value !== "all" && input.value === appActivityFilter.value; });
  document.querySelectorAll("[data-category-chip]").forEach((chip) => chip.classList.toggle("active", chip.dataset.categoryChip === appActivityFilter.value));
  filterCards();
});

appRatingFilter?.addEventListener("change", () => {
  const radio = document.querySelector(`input[name="result-rating"][value="${appRatingFilter.value}"]`);
  if (radio) radio.checked = true;
  filterCards();
});

document.querySelectorAll('input[name="result-price"]').forEach((radio) => radio.addEventListener("change", () => { if (radio.checked && appPriceFilter) appPriceFilter.value = radio.value; }));
document.querySelectorAll('input[name="result-rating"]').forEach((radio) => radio.addEventListener("change", () => { if (radio.checked && appRatingFilter) appRatingFilter.value = radio.value; }));
document.querySelectorAll("[data-filter-category]").forEach((input) => input.addEventListener("change", () => {
  if (!appActivityFilter) return;
  const checked = [...document.querySelectorAll("[data-filter-category]:checked")];
  appActivityFilter.value = checked.length === 1 ? checked[0].value : "all";
}));

document.querySelectorAll("[data-results-view]").forEach((button) => button.addEventListener("click", () => {
  document.querySelectorAll("[data-results-view]").forEach((item) => item.classList.toggle("active", item === button));
  const mapView = button.dataset.resultsView === "map";
  document.querySelector("#results-list")?.toggleAttribute("hidden", mapView);
  document.querySelector("#results-map")?.toggleAttribute("hidden", !mapView);
  refreshResultsMap();
}));

document.querySelector("#sort-results")?.addEventListener("change", (event) => {
  const list = document.querySelector("#results-list");
  if (!list) return;
  const cards = [...list.querySelectorAll("[data-filter-card]")];
  const sortValue = event.currentTarget.value;
  cards.sort((a, b) => {
    if (sortValue === "rating") return Number(b.dataset.rating) - Number(a.dataset.rating);
    if (sortValue === "price-low") return Number(a.dataset.price) - Number(b.dataset.price);
    if (sortValue === "price-high") return Number(b.dataset.price) - Number(a.dataset.price);
    if (sortValue === "soonest") return Number(a.dataset.eventDate || 99999999) - Number(b.dataset.eventDate || 99999999);
    return Number(a.dataset.order) - Number(b.dataset.order);
  }).forEach((card) => list.appendChild(card));
});

}

document.querySelectorAll("[data-open-modal]").forEach((button) => {
  button.addEventListener("click", () => {
    if (!pageModal) return;
    pageModal.querySelector("[data-modal-title]").textContent = button.dataset.title || "Plan this experience";
    pageModal.querySelector("[name=experience]").value = button.dataset.title || "";
    pageModal.dataset.bookingPrice = button.closest("[data-price]")?.dataset.price || "0";
    pageModal.dataset.bookingCategory = button.closest("[data-category]")?.dataset.category || "Experience";
    pageModal.dataset.bookingIsland = button.closest("[data-island]")?.dataset.island || "nassau";
    pageModal.dataset.bookingImage = getComputedStyle(button.closest("[data-filter-card]")?.querySelector(".listing-image, .route-cover")).backgroundImage.slice(5, -2);
    pageModal.classList.add("open");
  });
});

document.querySelectorAll("[data-close-modal]").forEach((button) => button.addEventListener("click", () => pageModal?.classList.remove("open")));
pageModal?.addEventListener("click", (event) => { if (event.target === pageModal) pageModal.classList.remove("open"); });
document.addEventListener("keydown", (event) => { if (event.key === "Escape") pageModal?.classList.remove("open"); });

document.querySelector("#prototype-form")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  (window.VoyaraStore || localStorage).setItem("voyara-booking-draft", JSON.stringify({
    title: data.get("experience"), category: pageModal?.dataset.bookingCategory || "Experience",
    location: `${pageModal?.dataset.bookingIsland === "exuma" ? "Exuma" : "Nassau"}, The Bahamas`,
    price: Number(pageModal?.dataset.bookingPrice || 0), date: data.get("date") || "", time: "9:30 AM",
    guests: Number(data.get("travelers")?.match(/\d+/)?.[0] || 2), duration: "3 hours",
    image: pageModal?.dataset.bookingImage || "assets/voyara-hero-v2.png"
  }));
  pageModal?.classList.remove("open");
  window.location.href = "booking.html";
});

document.querySelectorAll("[data-notify]").forEach((button) => button.addEventListener("click", () => notify(button.dataset.notify)));

// Voyagers social feed interactions.
const voyagerSearch = document.querySelector("#voyager-search");
const feedTabs = document.querySelectorAll("[data-feed-tab]");
let activeFeed = "following";

function filterVoyagerPosts() {
  if (window.filterVoyagersDesign) return window.filterVoyagersDesign();
  const query = (voyagerSearch?.value || "").trim().toLowerCase();
  document.querySelectorAll("[data-social-post]").forEach((post) => {
    const matchesTab = (post.dataset.feedKind || "").split(" ").includes(activeFeed);
    const matchesSearch = !query || (post.dataset.searchable || post.textContent).toLowerCase().includes(query);
    post.classList.toggle("hidden-post", !matchesTab || !matchesSearch);
  });
  document.querySelectorAll("[data-explore-item]").forEach((item) => {
    const matchesSearch = !query || (item.dataset.searchable || item.textContent).toLowerCase().includes(query);
    item.classList.toggle("hidden-post", !matchesSearch);
  });
}

voyagerSearch?.addEventListener("input", filterVoyagerPosts);
document.querySelectorAll("[data-focus-search]").forEach((button) => button.addEventListener("click", () => {
  voyagerSearch?.focus();
  voyagerSearch?.scrollIntoView({ behavior: "smooth", block: "center" });
}));
feedTabs.forEach((tab) => tab.addEventListener("click", () => {
  activeFeed = tab.dataset.feedTab;
  feedTabs.forEach((item) => item.classList.toggle("active", item === tab));
  document.body.classList.toggle("explore-active", activeFeed === "explore");
  filterVoyagerPosts();
}));

const explorePostModal = document.createElement("div");
explorePostModal.className = "explore-post-modal";
explorePostModal.hidden = true;
explorePostModal.innerHTML = `
  <button class="explore-modal-close" type="button" aria-label="Close post preview">×</button>
  <article class="explore-modal-card" role="dialog" aria-modal="true" aria-label="Voyage preview">
    <div class="explore-modal-image"></div>
    <div class="explore-modal-details">
      <header class="explore-modal-author"><img src="assets/header-avatar.png" alt=""><div><strong data-explore-author></strong><span data-explore-location></span></div><span aria-label="Sample voyage">•••</span></header>
      <div class="explore-modal-caption"><p><b data-explore-caption-author></b> <span data-explore-caption></span></p><div class="post-chips"><a href="things-to-do.html?q=Bahamas">#voyara</a><a href="things-to-do.html?q=local">#islandlife</a></div></div>
      <div class="explore-modal-comments"><p><b>familyexplorer</b> Adding this one to our next trip.</p><p><b>islandgirl</b> One of my favourite island moments ✨</p></div>
      <div class="explore-modal-footer">
        <div class="explore-modal-actions"><button class="explore-modal-like" type="button" aria-label="Like voyage"></button><button class="explore-modal-comment" type="button" aria-label="Comment on voyage"></button><button class="explore-modal-share" type="button" aria-label="Share voyage"><span class="share-symbol"></span></button><button class="explore-modal-save" type="button" aria-label="Save voyage"></button></div>
        <strong data-explore-likes></strong><small>SHARED ON VOYARA</small>
        <form class="explore-modal-comment-form"><input aria-label="Add a comment" placeholder="Add a comment…"><button>Post</button></form>
      </div>
    </div>
  </article>`;
document.body.append(explorePostModal);

let exploreReturnFocus = null;
const closeExplorePost = () => {
  if (explorePostModal.hidden) return;
  explorePostModal.hidden = true;
  document.body.classList.remove("explore-modal-open");
  exploreReturnFocus?.focus();
};

const exploreCreators = [
  { match: "food", name: "bahamaseats", location: "Nassau, The Bahamas", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=180&q=82" },
  { match: "night", name: "nassaunights", location: "Nassau after dark", avatar: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=180&q=82" },
  { match: "beach", name: "islandgirl", location: "The Bahamas", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=180&q=82" },
  { match: "spa", name: "lunaluxe", location: "Paradise Island", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=180&q=82" }
];

document.querySelectorAll("[data-explore-item]").forEach((item, index) => item.addEventListener("click", () => {
  exploreReturnFocus = item;
  const searchable = item.dataset.searchable || "";
  const creator = exploreCreators.find((entry) => searchable.includes(entry.match)) || { name: "travelpete", location: "The Caribbean", avatar: "assets/header-avatar.png" };
  const title = item.querySelector("b")?.textContent || item.getAttribute("aria-label") || "Voyara voyage";
  const engagement = item.querySelector("small")?.textContent.trim() || "♥ 1.2K  ◯ 38";
  const saveKey = `explore-${index}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const saveButton = explorePostModal.querySelector(".explore-modal-save");
  const likeButton = explorePostModal.querySelector(".explore-modal-like");
  const baseLikes = engagement.match(/[\d.]+K?/i)?.[0] || "1.2K";
  explorePostModal.querySelector(".explore-modal-image").style.backgroundImage = item.style.backgroundImage;
  explorePostModal.querySelector(".explore-modal-author img").src = creator.avatar;
  explorePostModal.querySelector("[data-explore-author]").textContent = `${creator.name} ✓`;
  explorePostModal.querySelector("[data-explore-location]").textContent = `${creator.location} · just now`;
  explorePostModal.querySelector("[data-explore-caption-author]").textContent = creator.name;
  explorePostModal.querySelector("[data-explore-caption]").textContent = `${title}. A local favourite worth saving for your next island day.`;
  explorePostModal.querySelector("[data-explore-likes]").textContent = `${baseLikes} likes`;
  explorePostModal.querySelector(".explore-modal-card").setAttribute("aria-label", title);
  saveButton.dataset.saveKey = saveKey;
  saveButton.classList.toggle("saved", savedItems.has(saveKey));
  likeButton.classList.remove("liked");
  explorePostModal.hidden = false;
  document.body.classList.add("explore-modal-open");
  explorePostModal.querySelector(".explore-modal-close").focus();
}));

explorePostModal.querySelector(".explore-modal-close").addEventListener("click", closeExplorePost);
explorePostModal.addEventListener("click", (event) => { if (event.target === explorePostModal) closeExplorePost(); });
explorePostModal.querySelector(".explore-modal-like").addEventListener("click", (event) => event.currentTarget.classList.toggle("liked"));
explorePostModal.querySelector(".explore-modal-save").addEventListener("click", (event) => {
  const button = event.currentTarget;
  button.classList.toggle("saved");
  if (button.classList.contains("saved")) savedItems.add(button.dataset.saveKey); else savedItems.delete(button.dataset.saveKey);
  (window.VoyaraStore || localStorage).setItem("voyara-saved", JSON.stringify([...savedItems]));
});
explorePostModal.querySelector(".explore-modal-comment").addEventListener("click", () => explorePostModal.querySelector(".explore-modal-comment-form input").focus());
explorePostModal.querySelector(".explore-modal-share").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(window.location.href); notify("Voyage link copied."); } catch { notify("Copy failed. Copy the page address manually to share this local preview."); }
});
explorePostModal.querySelector(".explore-modal-comment-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = event.currentTarget.querySelector("input");
  if (!input.value.trim()) return;
  const comment = document.createElement("p");
  comment.innerHTML = `<b>prabh.voyages</b> ${input.value.replace(/[<>]/g, "")}`;
  explorePostModal.querySelector(".explore-modal-comments").append(comment);
  input.value = "";
});

document.querySelectorAll("[data-story]").forEach((story) => story.addEventListener("click", () => {
  notify(`${story.dataset.story}: story playback is not connected in this preview.`);
  story.querySelector(".story-ring")?.classList.add("viewed");
}));

document.querySelectorAll(".social-like").forEach((button) => button.addEventListener("click", () => {
  const post = button.closest("[data-social-post]");
  const count = post?.querySelector(".like-count");
  button.classList.toggle("liked");
  button.textContent = button.classList.contains("liked") ? "♥" : "♡";
  animateFavorite(button, button.classList.contains("liked"));
  if (count) count.textContent = `${Number(count.dataset.baseLikes) + (button.classList.contains("liked") ? 1 : 0)} likes`;
}));

document.querySelectorAll(".social-comment").forEach((button) => button.addEventListener("click", () => button.closest("[data-social-post]")?.querySelector(".social-comment-form input")?.focus()));

document.querySelectorAll(".voyage-share-trigger").forEach((trigger) => {
  const share = document.createElement("div");
  share.className = "social-share";
  trigger.parentNode.insertBefore(share, trigger);
  share.appendChild(trigger);
  trigger.setAttribute("aria-expanded", "false");
  trigger.innerHTML = '<span class="share-symbol" aria-hidden="true"><i></i><i></i><i></i></span><b>Share</b>';
  share.insertAdjacentHTML("beforeend", `
    <div class="social-share-actions" aria-label="Share options">
      <button type="button" class="share-x" data-share-platform="x" title="Share on X" aria-label="Share on X">𝕏</button>
      <button type="button" class="share-instagram" data-share-platform="instagram" title="Open Instagram" aria-label="Open Instagram">◎</button>
      <button type="button" class="share-whatsapp" data-share-platform="whatsapp" title="Share on WhatsApp" aria-label="Share on WhatsApp"><img src="https://cdn.simpleicons.org/whatsapp/16A864" alt="" aria-hidden="true"></button>
      <span aria-hidden="true"></span>
      <button type="button" class="share-copy" data-share-platform="copy" title="Copy link" aria-label="Copy link">⧉</button>
    </div>`);

  share.querySelector(".social-share-actions").inert = true;
  trigger.addEventListener("click", (event) => {
    event.stopPropagation();
    document.querySelectorAll(".social-share.expanded").forEach((item) => { if (item !== share) { item.classList.remove("expanded"); item.querySelector(".voyage-share-trigger")?.setAttribute("aria-expanded","false"); item.querySelector(".social-share-actions").inert = true; } });
    const expanded = share.classList.toggle("expanded");
    trigger.setAttribute("aria-expanded", String(expanded));
    share.querySelector(".social-share-actions").inert = !expanded;
  });

  share.querySelectorAll("[data-share-platform]").forEach((button) => button.addEventListener("click", async (event) => {
    event.stopPropagation();
    const title = trigger.dataset.shareTitle || document.title;
    const shareURL = new URL(window.location.href);
    const postID = trigger.closest("[data-social-post]")?.id;
    if (postID) shareURL.hash = postID;
    const url = shareURL.href;
    const platform = button.dataset.sharePlatform;
    if (platform === "x") window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, "_blank", "noopener,noreferrer");
    if (platform === "instagram") window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
    if (platform === "whatsapp") window.open(`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`, "_blank", "noopener,noreferrer");
    if (platform === "copy") {
      try { await navigator.clipboard.writeText(url); } catch { window.prompt("Copy this link", url); }
      button.textContent = "✓";
      button.classList.add("copied");
      window.setTimeout(() => { button.textContent = "⧉"; button.classList.remove("copied"); }, 2000);
    }
  }));
});

document.addEventListener("click", (event) => {
  document.querySelectorAll(".social-share.expanded").forEach((share) => {
    if (!share.contains(event.target)) {
      share.classList.remove("expanded");
      share.querySelector(".social-share-actions").inert = true;
      share.querySelector(".voyage-share-trigger")?.setAttribute("aria-expanded", "false");
    }
  });
});
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  closeExplorePost();
  document.querySelectorAll(".social-share.expanded").forEach((share) => {
    share.classList.remove("expanded");
    share.querySelector(".social-share-actions").inert = true;
    share.querySelector(".voyage-share-trigger")?.setAttribute("aria-expanded", "false");
  });
});

document.querySelectorAll("[data-comments-toggle]").forEach((button) => button.addEventListener("click", () => button.nextElementSibling?.classList.toggle("open")));
document.querySelectorAll(".social-comment-form").forEach((form) => form.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = form.querySelector("input");
  if (!input?.value.trim()) return;
  const comments = form.closest("[data-social-post]")?.querySelector(".post-comments");
  comments?.insertAdjacentHTML("beforeend", `<p><b>prabh.voyages</b> ${input.value.replace(/[<>]/g, "")}</p>`);
  comments?.classList.add("open");
  input.value = "";
}));

const createPostModal = document.querySelector("#create-post-modal");
const VOYARA_POSTS_KEY = "voyara-community-posts";
const escapeVoyageText = (value = "") => String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));
const storedVoyages = readArray(VOYARA_POSTS_KEY);

function voyageAge(voyage) {
  const timestamp=Number(voyage.createdAt)||Number(String(voyage.id).replace('voyage-',''));
  if(!Number.isFinite(timestamp)||timestamp<=0)return 'Your voyage';
  const minutes=Math.max(0,Math.floor((Date.now()-timestamp)/60000));
  return minutes<1?'just now':minutes<60?`${minutes}m ago`:minutes<1440?`${Math.floor(minutes/60)}h ago`:`${Math.floor(minutes/1440)}d ago`;
}
function voyageFeedMarkup(voyage) {
  const caption = escapeVoyageText(voyage.caption);
  const location = escapeVoyageText(voyage.location);
  const image = escapeVoyageText(voyage.image);
  return `<article class="social-post user-created-voyage" data-social-post data-post-id="${escapeVoyageText(voyage.id)}" data-feed-kind="following explore" data-searchable="${caption} ${location} ${escapeVoyageText(voyage.type)}">
    <header class="social-post-head"><img src="assets/header-avatar.png" alt=""><div><strong>${escapeVoyageText(voyage.author || 'Voyager')}</strong><span>${location} · ${voyageAge(voyage)}</span></div><button data-notify="Additional voyage options are not connected in this local preview.">•••</button></header>
    <div class="social-post-image" style="background-image:url('${image}')"><span class="post-location">${location.toUpperCase()}</span></div>
    <div class="social-post-actions"><div><button class="social-like" aria-label="Like voyage">♡</button><button class="social-comment" aria-label="Comment on voyage">◯</button><button class="voyage-share-trigger" data-share-title="${caption}" aria-label="Share voyage">↗</button></div><button class="social-save" data-save="${escapeVoyageText(voyage.id)}" aria-label="Save voyage">♧</button></div>
    <div class="social-post-copy"><strong class="like-count" data-base-likes="0">0 likes</strong><p><b>${escapeVoyageText(voyage.author || 'Voyager')}</b> ${caption}</p><small>${voyageAge(voyage)}</small><div class="post-comments"></div></div>
    <form class="social-comment-form"><input aria-label="Add a comment" placeholder="Add a comment…"><button>Post</button></form>
  </article>`;
}

function renderStoredVoyages() {
  const feed = document.querySelector(".voyager-feed");
  if (feed && storedVoyages.length) feed.insertAdjacentHTML("afterbegin", storedVoyages.filter(v=>!v.archived).map(voyageFeedMarkup).join(""));
  const grid = document.querySelector(".profile-post-grid");
  if (grid && storedVoyages.length) grid.insertAdjacentHTML("afterbegin", storedVoyages.filter(v=>!v.archived).map((voyage) => `<button style="background-image:url('${escapeVoyageText(voyage.image)}')" data-post-id="${escapeVoyageText(voyage.id)}" data-profile-post aria-label="${escapeVoyageText(voyage.caption)}"><span>♥ 0&nbsp;&nbsp; ◯ 0</span></button>`).join(""));
  const voyageCount = document.querySelector(".profile-stats button:first-child strong");
  if (voyageCount) voyageCount.textContent = String(6 + storedVoyages.filter(v=>!v.archived).length);
}
renderStoredVoyages();
document.querySelectorAll(".user-created-voyage").forEach((post) => {
  const likeButton = post.querySelector(".social-like");
  const count = post.querySelector(".like-count");
  likeButton?.addEventListener("click", () => {
    likeButton.classList.toggle("liked");
    likeButton.textContent = likeButton.classList.contains("liked") ? "♥" : "♡";
    if (count) count.textContent = likeButton.classList.contains("liked") ? "1 like" : "0 likes";
  });
  post.querySelector(".social-comment")?.addEventListener("click", () => post.querySelector(".social-comment-form input")?.focus());
  post.querySelector(".voyage-share-trigger")?.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(window.location.origin + window.location.pathname + "#" + post.id); notify("Voyage link copied."); }
    catch { notify("Copy failed. Copy the page address manually to share this local preview."); }
  });
  const saveButton = post.querySelector(".social-save");
  saveButton?.addEventListener("click", () => {
    saveButton.classList.toggle("saved");
    saveButton.textContent = saveButton.classList.contains("saved") ? "♣" : "♧";
    if (saveButton.classList.contains("saved")) savedItems.add(saveButton.dataset.save); else savedItems.delete(saveButton.dataset.save);
    (window.VoyaraStore || localStorage).setItem("voyara-saved", JSON.stringify([...savedItems]));
  });
  post.querySelector(".social-comment-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = event.currentTarget.querySelector("input");
    if (!input.value.trim()) return;
    post.querySelector(".post-comments")?.insertAdjacentHTML("beforeend", `<p><b>prabh.voyages</b> ${escapeVoyageText(input.value)}</p>`);
    post.querySelector(".post-comments")?.classList.add("open");
    input.value = "";
  });
});

document.querySelectorAll("[data-create-post]").forEach((button) => button.addEventListener("click", () => createPostModal?.classList.add("open")));
document.querySelector("[data-close-create]")?.addEventListener("click", () => createPostModal?.classList.remove("open"));
createPostModal?.addEventListener("click", (event) => { if (event.target === createPostModal) createPostModal.classList.remove("open"); });
document.querySelector("#create-post-form")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!window.VoyaraAuth?.isAuthenticated()) {
    createPostModal?.classList.remove('open');
    window.VoyaraAuth?.open('customer', 'Sign in before sharing a voyage. Your draft stays in the editor.');
    return;
  }
  const form = event.currentTarget;
  if(form.dataset.submitting)return;
  const file = form.elements.photo?.files?.[0];
  if (!file) return;
  if (!file.type.startsWith('image/') || file.size > 4 * 1024 * 1024) { notify('Choose an image smaller than 4 MB for this local demo.'); return; }
  if (!form.elements.caption.value.trim() || !form.elements.location.value.trim()) { notify('Add a caption and location before saving.'); return; }
  const postingOwner=window.VoyaraDemo?.owner();
  form.dataset.submitting='true';
  const submit=form.querySelector('button[type=submit]')||form.querySelector('button:not([type])');
  if(submit)submit.disabled=true;
  const release=()=>{delete form.dataset.submitting;if(submit)submit.disabled=false;};
  let image;
  try { image = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  }); } catch { release();notify('This photo could not be read. Choose another image.'); return; }
  try { await new Promise((resolve,reject)=>{const photo=new Image();photo.onload=resolve;photo.onerror=reject;photo.src=image;}); } catch { release();notify('This file is not a readable image. Choose another photo.');return; }
  if(!window.VoyaraAuth?.isAuthenticated()||postingOwner!==window.VoyaraDemo?.owner()){release();notify('Your sign-in changed. Sign in again before posting.');return;}
  const voyage = { createdAt:Date.now(), author:window.VoyaraAuth?.getUser()?.user_metadata?.display_name || 'Voyager', id: `voyage-${Date.now()}`, caption: form.elements.caption.value.trim(), location: form.elements.location.value.trim(), type: form.elements.type?.value || "Travel moment", image };
  try { (window.VoyaraStore || localStorage).setItem(VOYARA_POSTS_KEY, JSON.stringify([voyage,...readArray(VOYARA_POSTS_KEY)])); }
  catch { release();notify("Could not save this photo. Browser storage may be full; try a smaller image."); return; }
  storedVoyages.unshift(voyage);
  createPostModal?.classList.remove("open");
  form.reset();
  notify("Your voyage was saved to this browser’s local demo feed.");
  window.setTimeout(() => { window.location.href = document.body.classList.contains("voyager-profile-page") ? "voyager-profile.html" : "voyagers.html"; }, 450);
});

document.querySelectorAll("[data-profile-tab]").forEach((tab) => tab.addEventListener("click", () => {
  document.querySelectorAll("[data-profile-tab]").forEach((item) => item.classList.toggle("active", item === tab));
  document.querySelectorAll("[data-profile-panel]").forEach((panel) => panel.classList.toggle("active", panel.dataset.profilePanel === tab.dataset.profileTab));
}));
document.querySelector("[data-view-archive]")?.addEventListener("click", () => notify("Your archived voyages will appear here."));
document.querySelectorAll("[data-profile-post]").forEach((post) => post.addEventListener("click", () => notify("This sample voyage has no expanded preview yet.")));

const editProfileModal = document.querySelector("#edit-profile-modal");
document.querySelector("[data-edit-profile]")?.addEventListener("click", () => editProfileModal?.classList.add("open"));
document.querySelector("[data-close-profile]")?.addEventListener("click", () => editProfileModal?.classList.remove("open"));
editProfileModal?.addEventListener("click", (event) => { if (event.target === editProfileModal) editProfileModal.classList.remove("open"); });
document.querySelector("#edit-profile-form")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  (window.VoyaraStore || localStorage).setItem('voyara-profile-preview', JSON.stringify(data));
  applyProfilePreview(data);
  editProfileModal?.classList.remove("open");
  notify("Profile changes saved in this browser.");
});

if (!document.querySelector('script[data-account-menu]')) {
  const accountMenuScript = document.createElement("script");
  accountMenuScript.src = "account-menu.js?v=business2";
  accountMenuScript.dataset.accountMenu = "true";
  document.head.append(accountMenuScript);
}

if (!document.querySelector('script[data-trip-cart]')) {
  const tripCartScript = document.createElement("script");
  tripCartScript.src = "trip-cart.js?v=8";
  tripCartScript.dataset.tripCart = "true";
  document.head.append(tripCartScript);
}
if (!document.querySelector('script[data-favorites]')) {
  const favoritesScript = document.createElement("script");
  favoritesScript.src = "favorites.js?v=3";
  favoritesScript.dataset.favorites = "true";
  document.head.append(favoritesScript);
}

function applyProfilePreview(data) {
  const bio = document.querySelector('.profile-bio');
  if (!bio || !data) return;
  if (data.displayName) {
    document.querySelector('.profile-name-row h1').textContent = data.displayName;
    document.querySelector('.profile-display-name').textContent = data.displayName;
    document.title = `${data.displayName}'s Voyager Profile | Voyara`;
  }
  bio.querySelector('span').textContent = data.homeBase || '';
  bio.querySelector('p').textContent = data.bio || '';
  const form = document.querySelector('#edit-profile-form');
  ['displayName','homeBase','bio'].forEach(key => { if (typeof data[key] === 'string') form.elements[key].value = data[key]; });
}
try {
  const saved = JSON.parse((window.VoyaraStore || localStorage).getItem('voyara-profile-preview') || 'null');
  const user = window.VoyaraDemo?.getUser();
  const form = document.querySelector('#edit-profile-form');
  applyProfilePreview(saved || (user && form ? {displayName:user.user_metadata.display_name,homeBase:form.elements.homeBase.value,bio:form.elements.bio.value} : null));
} catch {}
document.querySelector('.profile-stats button:first-child')?.addEventListener('click', () => document.querySelector('.profile-post-grid')?.scrollIntoView({behavior:'smooth'}));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    createPostModal?.classList.remove('open');
    editProfileModal?.classList.remove('open');
  }
});
