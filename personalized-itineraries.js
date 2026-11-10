const form = document.querySelector("#personalized-form");
const notice = document.querySelector("#prototype-notice");

const words = {
  balanced: ["Balanced Escape", "A thoughtful mix of signature experiences and unhurried island time."],
  adventure: ["Adventure Route", "An energetic plan built around water, wildlife and memorable island stops."],
  relaxed: ["Slow Island Reset", "A spacious plan with beaches, wellness and room to follow the moment."],
  culture: ["Flavours & Culture Trail", "A locally rooted plan led by food, heritage and neighbourhood discoveries."],
};

function updatePlan() {
  const data = new FormData(form);
  const island = data.get("island");
  const days = Number(data.get("days"));
  const style = data.get("style");
  const interests = data.getAll("interest");
  const [name, summary] = words[style];
  const list = document.querySelector('#personalized-days');
  list.replaceChildren();
  const themes = interests.length ? interests : ['Flexible discovery'];
  for (let day = 1; day <= days; day++) {
    const theme = themes[(day - 1) % themes.length];
    const card = document.createElement('article');
    const label = document.createElement('span'); label.textContent = 'DAY ' + day;
    const heading = document.createElement('h3'); heading.textContent = island + ' · ' + theme;
    const copy = document.createElement('p'); copy.textContent = 'Suggested ' + style + ' day for your ' + data.get('group').toLowerCase() + ' trip. Explore options to customize this sample plan.';
    const link = document.createElement('a'); link.textContent = 'Explore day';
    const islandFilter = island === 'Paradise Island' ? 'nassau' : island.toLowerCase();
    link.href = 'things-to-do.html?' + new URLSearchParams({island:islandFilter});
    card.append(label, heading, copy, link); list.append(card);
  }

  document.querySelector("#result-title").textContent = `${island} ${name}`;
  document.querySelector("#result-summary").textContent = summary;
  document.querySelector("#preview-title").textContent = `${island} · ${name}`;
  document.querySelector("#preview-meta").textContent = `${days} ${days === 1 ? "day" : "days"} · ${interests.slice(0, 3).join(", ") || "Flexible discovery"}`;
  document.querySelector("#match-score").textContent = `${Math.min(98, 88 + interests.length * 2)}%`;
}

form?.addEventListener("input", updatePlan);
form?.addEventListener("submit", (event) => {
  event.preventDefault();
  localStorage.setItem("voyara-itinerary-preferences", JSON.stringify({...Object.fromEntries(new FormData(form)), interest: new FormData(form).getAll("interest")}));
  if (notice) { notice.textContent = "Your itinerary preferences were saved."; notice.hidden = false; window.setTimeout(() => { notice.hidden = true; }, 2400); }
});

document.querySelector("#build-plan")?.addEventListener("click", () => {
  if (notice) { notice.textContent = "Browse sample itineraries to continue planning."; notice.hidden = false; window.setTimeout(() => { window.location.href = "itineraries.html"; }, 700); }
});

try {
  const saved = JSON.parse(localStorage.getItem('voyara-itinerary-preferences') || 'null');
  if (saved && typeof saved === 'object') {
    ['island','days','style','group'].forEach(name => {
      const field = form.elements[name];
      if ([...field.options].some(option => option.value === String(saved[name]))) field.value = saved[name];
    });
    if (saved.interest) {
      const interests = Array.isArray(saved.interest) ? saved.interest : [saved.interest];
      form.querySelectorAll('[name="interest"]').forEach(input => input.checked = interests.includes(input.value));
    }
  }
} catch { /* Keep defaults if saved preferences cannot be read. */ }
updatePlan();
