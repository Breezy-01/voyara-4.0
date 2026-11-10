const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector(".nav");
const notice = document.querySelector("#notice");

function animateFavorite(button, active) {
  button.setAttribute("aria-pressed", String(active));
  button.classList.remove("heart-pop");
  void button.offsetWidth;
  if (active) button.classList.add("heart-pop");
}

const travelDate = document.querySelector('.search-date-control input');
if (travelDate) {
  travelDate.min = new Date(Date.now() - new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);
  const syncDateLabel = () => travelDate.parentElement.classList.toggle('has-date', Boolean(travelDate.value));
  travelDate.addEventListener('input', syncDateLabel);
  travelDate.addEventListener('change', syncDateLabel);
  window.addEventListener('pageshow', syncDateLabel);
  syncDateLabel();
}

document.querySelector("#search-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const params = new URLSearchParams({q: String(data.get("interest") || "").trim(), island: data.get("where"), mode: data.get("mode") || "experiences"});
  if (data.get("when")) params.set('date', data.get('when'));
  window.location.href = `things-to-do.html?${params}`;
});

document.querySelectorAll(".save-button").forEach((button) => {
  button.addEventListener("click", () => {
    button.classList.toggle("saved");
    button.textContent = button.classList.contains("saved") ? "Saved ✓" : "View itinerary";
  });
});

document.querySelectorAll(".heart").forEach((button) => {
  button.addEventListener("click", () => {
    button.classList.toggle("heart-active");
    const active = button.classList.contains("heart-active");
    button.textContent = active ? "♥" : "♡";
    animateFavorite(button, active);
  });
});

document.querySelectorAll("[data-community-href]").forEach((card) => {
  const openPage = () => { window.location.href = card.dataset.communityHref; };
  card.addEventListener("click", (event) => { if (!event.target.closest(".post-card-heart")) openPage(); });
  card.addEventListener("keydown", (event) => { if ((event.key === "Enter" || event.key === " ") && !event.target.closest(".post-card-heart")) { event.preventDefault(); openPage(); } });
});

let homeFollowing;
try { homeFollowing = new Set(JSON.parse(localStorage.getItem('voyara-following') || '[]')); } catch { homeFollowing = new Set(); }
document.querySelectorAll('.follow-button').forEach(button => {
  const creator = button.closest('.creator-card')?.querySelector('h3 a')?.textContent.replace('✓','').trim();
  const render = () => { const followed = homeFollowing.has(creator); button.classList.toggle('following',followed); button.setAttribute('aria-pressed',String(followed)); button.textContent = followed ? 'Following' : 'Follow'; };
  render();
  button.addEventListener('click', () => { if(homeFollowing.has(creator)) homeFollowing.delete(creator); else homeFollowing.add(creator); localStorage.setItem('voyara-following',JSON.stringify([...homeFollowing])); render(); });
});

document.querySelectorAll("[data-notice]").forEach((button) => {
  button.addEventListener("click", () => showNotice(button.dataset.notice));
});

const guidesScroll = document.querySelector("#guides-scroll");
document.querySelectorAll("[data-guide-scroll]").forEach((button) => {
  button.addEventListener("click", () => {
    guidesScroll.scrollBy({ top: Number(button.dataset.guideScroll) * 150, behavior: "smooth" });
  });
});

notice.addEventListener("click", () => { notice.hidden = true; });

function showNotice(message) {
  notice.textContent = `${message}  ×`;
  notice.hidden = false;
}

document.querySelectorAll("[data-carousel]").forEach((carousel) => {
  const track = carousel.querySelector("[data-carousel-track]");
  carousel.querySelectorAll("[data-carousel-direction]").forEach((button) => {
    button.addEventListener("click", () => track.scrollBy({ left: Number(button.dataset.carouselDirection) * 520, behavior: "smooth" }));
  });
});

document.querySelectorAll(".experience-heart").forEach((button) => {
  button.addEventListener("click", () => {
    button.classList.toggle("saved");
    const active = button.classList.contains("saved");
    button.textContent = active ? "♥" : "♡";
    animateFavorite(button, active);
    showNotice(active ? "Experience saved to your Voyara collection." : "Experience removed from saved items.");
  });
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

const guideLayout = window.matchMedia('(max-width: 760px)');
function syncGuideFocus() {
  if (!guidesScroll) return;
  if (guideLayout.matches) guidesScroll.removeAttribute('tabindex');
  else guidesScroll.setAttribute('tabindex', '0');
}
guideLayout.addEventListener('change', syncGuideFocus);
syncGuideFocus();

// Shared experience/event choice on the homepage search.
document.querySelectorAll('[data-search-mode]').forEach(button => button.addEventListener('click', () => {
  const form = document.querySelector('#search-form');
  form.elements.mode.value = button.dataset.searchMode;
  form.querySelectorAll('[data-search-mode]').forEach(tab => tab.setAttribute('aria-pressed', tab === button));
  form.elements.interest.placeholder = button.dataset.searchMode === 'events' ? 'Concerts, festivals, nightlife' : 'Beach clubs, boat tours, dining';
  form.querySelector('.search-submit').setAttribute('aria-label', 'Search ' + button.dataset.searchMode);
}));
