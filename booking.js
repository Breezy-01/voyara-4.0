(() => { if (new URLSearchParams(location.search).get("cart")==="1" || window.voyaraTicketMissing) return;
const bookingCatalog = {
  "turtle-cove": { title: "Turtle Cove Snorkeling & Reef Cruise", category: "Water adventure", location: "Nassau, The Bahamas", price: 145, duration: "3.5 hours", image: "https://images.pexels.com/photos/7210380/pexels-photo-7210380.jpeg?auto=compress&cs=tinysrgb&w=1200" },
  "nassau-city": { title: "Nassau Highlights Tour", category: "Tour & excursion", location: "Nassau, The Bahamas", price: 59, duration: "2.5 hours", image: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=1200&q=84" },
  "chef-table": { title: "Island Chef’s Table", category: "Food & dining", location: "Cable Beach, The Bahamas", price: 85, duration: "2 hours", image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=1200&q=84" },
  "ocean-spa": { title: "Oceanfront Spa Ritual", category: "Wellness & luxury", location: "Paradise Island, The Bahamas", price: 160, duration: "90 minutes", image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=84" },
  "rose-island": { title: "Rose Island Boat Escape", category: "Water adventure", location: "Nassau, The Bahamas", price: 129, duration: "4 hours", image: "https://images.unsplash.com/photo-1540202404-a2f29016b523?auto=format&fit=crop&w=1200&q=84" }
};

const money = (amount) => `$${Number(amount).toLocaleString("en-US")}`;
const storedDraft = () => { try { const draft = JSON.parse((window.VoyaraStore || localStorage).getItem('voyara-booking-draft') || 'null'); return draft && typeof draft.title === 'string' && Number(draft.price) > 0 ? draft : null; } catch { return null; } };

document.querySelectorAll('a[href="discover.html"]').forEach((link) => link.setAttribute("href", "index.html"));
document.querySelector(".menu-button")?.addEventListener("click", (event) => { const nav = document.querySelector(".nav"); const open = nav.classList.toggle("open"); event.currentTarget.setAttribute("aria-expanded", String(open)); });

if (document.body.classList.contains("confirmation-page")) {
  const confirmation = window.voyaraSelectedTicket || JSON.parse((window.VoyaraStore || localStorage).getItem("voyara-latest-confirmation") || "null") || { number: "VOY-DEMO-001", customer: { name: "Voyara guest", email: "guest@example.com" }, item: storedDraft(), payment: "Apple Pay", total: 304 };
  const travelers = confirmation.item.travelers || { adults: confirmation.item.guests || 2, kids: 0 };
  document.querySelector("#confirmation-number").textContent = confirmation.number;
  document.querySelector("#ticket-title").textContent = confirmation.item.title;
  document.querySelector("#ticket-subtitle").textContent = `${confirmation.item.category} · ${confirmation.item.location}`;
  document.querySelector("#ticket-date").textContent = confirmation.item.date || "Flexible date";
  document.querySelector("#ticket-time").textContent = confirmation.item.time;
  document.querySelector("#ticket-guests").textContent = `${travelers.adults || 0} adult${travelers.adults === 1 ? '' : 's'}${travelers.kids ? ` · ${travelers.kids} ${travelers.kids === 1 ? 'child' : 'children'}` : ''}`;
  const transportLine = document.querySelector("#ticket-transport")?.closest("div");
  if (transportLine) transportLine.remove();
  document.querySelector("#confirmation-grid").innerHTML = `<div class="confirmation-stat"><span>Booking</span><strong>${confirmation.number}</strong></div><div class="confirmation-stat"><span>Payment</span><strong>${confirmation.payment}</strong></div><div class="confirmation-stat"><span>Guests</span><strong>${travelers.adults || 0} adult${travelers.adults === 1 ? '' : 's'}${travelers.kids ? ` · ${travelers.kids} ${travelers.kids === 1 ? 'child' : 'children'}` : ''}</strong></div><div class="confirmation-stat"><span>Total</span><strong>${money(confirmation.total)}</strong></div>`;
  document.querySelector("#copy-confirmation")?.addEventListener("click", async (event) => { try { await navigator.clipboard.writeText(confirmation.number); event.currentTarget.textContent = "Copied ✓"; } catch { event.currentTarget.textContent = "Copy unavailable — select reference above"; } });
} else {
  const draft = storedDraft();
  if (!draft) { document.querySelector('.booking-banner')?.remove(); window.voyaraRecovery('Choose an experience first','Select an experience, event or itinerary before starting checkout.','things-to-do.html','Explore experiences'); return; }
  const back = document.querySelector('#checkout-back');
  if (back && draft.id) {
    const page = draft.kind === 'event' ? 'event-detail.html' : draft.kind === 'itinerary' ? 'itinerary-detail.html' : 'activity-detail.html';
    back.href = page + '?id=' + encodeURIComponent(draft.id);
    back.textContent = draft.kind === 'event' ? 'Back to event' : draft.kind === 'itinerary' ? 'Back to itinerary' : 'Back to experience';
  }
  const travelers = { adults: Number(draft.travelers?.adults || draft.guests || 2), kids: Number(draft.travelers?.kids || 0) };
  const adultOnly = draft.audience === 'adult-only' || ['chef-table','ocean-spa','sunset-beach-session','nassau-art-walk','exuma-sound-weekend'].includes(draft.id);
  if (adultOnly) { travelers.kids = 0; document.querySelector('[data-booking-traveler="kids"]').hidden = true; document.querySelector('.booking-age-note').textContent = 'This experience is for guests aged 18 and over.'; }
  const adultPrice = Number(draft.price || 89);
  const childPrice = Number(draft.childPrice || Math.round(adultPrice * .66));
  const serviceFee = 14;
  let selectedTime = draft.time || "9:00 AM";
  const dateInput = document.querySelector("#booking-date");
  if (!draft.date) { const nextDay = new Date(); nextDay.setDate(nextDay.getDate() + 1); draft.date = nextDay.toISOString().slice(0, 10); }
  dateInput.value = draft.date;
  dateInput.min = new Date(Date.now() - new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);
  if (draft.kind === 'event' || draft.kind === 'itinerary') {
    dateInput.readOnly = draft.kind === 'event';
    document.querySelector('#date-heading').textContent = draft.kind === 'event' ? 'Event date & time' : 'Route date & start time';
    document.querySelector('#time-options').innerHTML = '';
    document.querySelector('#addons-heading').closest('section').hidden = true;
    document.querySelector('.booking-age-note').textContent = draft.audience === 'adult-only' ? 'This event is for guests aged 18 and over.' : draft.kind === 'itinerary' ? 'Sample route pricing is the same for all guests.' : 'Sample event pricing is the same for all guests.';
  }
  const options = document.querySelector('#time-options');
  // Carry the detail page's actual time choices through checkout; never invent extra slots.
  const offeredTimes = !['event','itinerary'].includes(draft.kind) && Array.isArray(draft.availableTimes)
    ? draft.availableTimes.filter(time => typeof time === 'string' && time.trim()) : [];
  options.replaceChildren();
  [...new Set([selectedTime, ...offeredTimes])].forEach(time => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'time-option';
    button.dataset.time = time; button.textContent = time; options.append(button);
  });
  options.querySelectorAll('button').forEach(button => {button.classList.toggle('selected', button.dataset.time === selectedTime);button.setAttribute('aria-pressed', button.dataset.time === selectedTime);});
  document.querySelector('#activity-waiver').hidden = !['turtle-cove','rose-island','rose-island-sail','exuma-cays','sunset-sail'].includes(draft.id);

  ["#booking-image", "#summary-image"].forEach((selector) => { document.querySelector(selector).src = draft.image || "assets/voyara-hero-v2.png"; });
  document.querySelector("#booking-title").textContent = draft.title;
  document.querySelector("#summary-title").textContent = draft.title;
  document.querySelector("#booking-category").textContent = draft.category;
  document.querySelector("#booking-location").textContent = `${draft.location} · ${draft.duration || "3 hours"}`;
  document.querySelector("#adult-unit-price").textContent = money(adultPrice);
  document.querySelector("#child-unit-price").textContent = money(childPrice);

  document.querySelectorAll('input[name="addon"]').forEach(input => {
    if(draft.parent){input.disabled=true;input.closest('.booking-card').hidden=true;}
    input.checked = !draft.parent && !['event','itinerary'].includes(draft.kind) && Array.isArray(draft.addons) && draft.addons.some(addon => addon.name === input.dataset.addonName);
  });
  const savedPayment = [...document.querySelectorAll('input[name="payment"]')].find(input => input.value === draft.payment);
  if (savedPayment) savedPayment.checked = true;

  const addons = () => [...document.querySelectorAll('input[name="addon"]:checked')].map((input) => ({ name: input.dataset.addonName, price: Number(input.value) }));
  const addonTotal = () => addons().reduce((sum, item) => sum + item.price, 0);
  const total = () => adultPrice * travelers.adults + childPrice * travelers.kids + addonTotal() + serviceFee;

  function render() {
    document.querySelectorAll("[data-booking-traveler]").forEach((row) => { row.querySelector("div > strong").textContent = travelers[row.dataset.bookingTraveler]; });
    document.querySelectorAll(".app-addon").forEach((label) => label.classList.toggle("selected", label.querySelector("input").checked));
    document.querySelectorAll(".app-payment").forEach((label) => label.classList.toggle("selected", label.querySelector("input").checked));
    document.querySelector("#adult-price-label").textContent = `Adults · ${travelers.adults} × ${money(adultPrice)}`;
    document.querySelector("#adult-price-total").textContent = money(adultPrice * travelers.adults);
    document.querySelector("#child-price-label").textContent = `Children · ${travelers.kids} × ${money(childPrice)}`;
    document.querySelector("#child-price-total").textContent = money(childPrice * travelers.kids);
    document.querySelector("#child-price-row").hidden = travelers.kids === 0;
    document.querySelector('#summary-children').parentElement.hidden = travelers.kids === 0;
    document.querySelectorAll('.time-option').forEach(button => button.setAttribute('aria-pressed', button.dataset.time === selectedTime));
    ["#summary-addons", "#side-addons"].forEach((selector) => document.querySelector(selector).textContent = money(addonTotal()));
    ["#summary-total", "#confirm-total", "#side-total"].forEach((selector) => document.querySelector(selector).textContent = money(total()));
    document.querySelector("#summary-adults").textContent = `${travelers.adults} × ${money(adultPrice)}`;
    document.querySelector("#summary-children").textContent = `${travelers.kids} × ${money(childPrice)}`;
    document.querySelector("#summary-schedule").textContent = `${dateInput.value || "Choose date"} · ${selectedTime}`;
    const mobileTitle = document.querySelector('#mobile-booking-title');
    if (mobileTitle) {
      mobileTitle.textContent = draft.title;
      document.querySelector('#mobile-booking-schedule').textContent = `${dateInput.value ? new Date(dateInput.value + 'T12:00:00').toLocaleDateString('en-US', {month:'short',day:'numeric'}) : 'Choose date'} · ${selectedTime}`;
      document.querySelector('#mobile-booking-guests').textContent = `${travelers.adults} adult${travelers.adults === 1 ? '' : 's'}${travelers.kids ? ` · ${travelers.kids} child${travelers.kids === 1 ? '' : 'ren'}` : ''}`;
      document.querySelector('#mobile-booking-total').textContent = money(total());
    }
    document.querySelectorAll('[data-booking-traveler]').forEach(row => {
      const key = row.dataset.bookingTraveler;
      row.querySelector('[data-booking-quantity="-1"]').disabled = travelers[key] <= (key === 'adults' ? 1 : 0);
    });
    draft.date = dateInput.value; draft.time = selectedTime; draft.travelers = { ...travelers }; draft.guests = travelers.adults + travelers.kids; draft.childPrice = childPrice; draft.addons = addons(); draft.payment = document.querySelector('input[name="payment"]:checked').value;
    (window.VoyaraStore || localStorage).setItem("voyara-booking-draft", JSON.stringify(draft));
  }

  document.querySelectorAll(".time-option").forEach((button) => button.addEventListener("click", () => { document.querySelectorAll(".time-option").forEach((item) => item.classList.remove("selected")); button.classList.add("selected"); selectedTime = button.dataset.time; render(); }));
  document.querySelectorAll("[data-booking-quantity]").forEach((button) => button.addEventListener("click", () => { const row = button.closest("[data-booking-traveler]"); const key = row.dataset.bookingTraveler; const minimum = key === "adults" ? 1 : 0; travelers[key] = Math.max(minimum, travelers[key] + Number(button.dataset.bookingQuantity)); render(); }));
  document.querySelectorAll('input[name="addon"], input[name="payment"], #booking-date').forEach((control) => control.addEventListener("change", render));
  let eventLock = false;
  document.querySelector("#confirm-booking").addEventListener("click", () => {
    if (eventLock) return;
    if(draft.fromCart&&draft.cartId){const existing=window.VoyaraBookings.all().find(b=>b.cartItemId===draft.cartId);if(existing){location.href="booking-confirmation.html?booking="+encodeURIComponent(existing.number);return;}}
    if (!window.validateCheckoutPreview?.()) return;
    if(window.VoyaraPlan&&!window.VoyaraPlan.assess([{...draft,cartId:draft.cartId||'direct',travelers:{...travelers}}]).ok){const error=document.querySelector('#checkout-error');error.hidden=false;error.textContent='This selection conflicts with your booked trips or needs updated details. Adjust your date or time before confirming.';return;}
    eventLock = true;
    document.querySelector('#confirm-booking').disabled = true;
    const confirmation = { cartItemId:draft.fromCart?draft.cartId:undefined, accountId: window.VoyaraDemo?.getUser()?.id || null, number: `VOY-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`, createdAt: new Date().toISOString(), item: { ...draft, travelers: { ...travelers } }, addons: addons(), customer: window.checkoutPreviewCustomer(), payment: document.querySelector('input[name="payment"]:checked').value, total: total() };
    let history = [];
    try { history = JSON.parse((window.VoyaraStore || localStorage).getItem('voyara-bookings-v1') || '[]'); } catch {}
    if (!Array.isArray(history)) history = [];
    try {
      const previous = JSON.parse((window.VoyaraStore || localStorage).getItem('voyara-latest-confirmation') || 'null');
      if (previous?.item && !history.some(item => item.number === previous.number)) history.push(previous);
    } catch {}
    try {
      (window.VoyaraStore || localStorage).setItem('voyara-bookings-v1', JSON.stringify([confirmation, ...history.filter(item => item.number !== confirmation.number)]));
    } catch {
      eventLock = false;
      document.querySelector('#confirm-booking').disabled = false;
      const error = document.querySelector('#checkout-error');
      error.textContent = 'This browser could not save your sample booking. Free some browser storage and try again.';
      error.hidden = false;
      return;
    }
    if(draft.fromCart&&draft.cartId){try{const st=window.VoyaraStore||localStorage;st.setItem('voyara-trip-cart-v1',JSON.stringify(JSON.parse(st.getItem('voyara-trip-cart-v1')||'[]').filter(x=>x.cartId!==draft.cartId)));}catch{}}
    try { (window.VoyaraStore || localStorage).setItem('voyara-latest-confirmation', JSON.stringify(confirmation)); } catch {}
    window.location.href = 'booking-confirmation.html?booking=' + encodeURIComponent(confirmation.number);
  });
  render();
}

if (!document.querySelector('script[data-account-menu]')) { const script = document.createElement("script"); script.src = "account-menu.js?v=business2"; script.dataset.accountMenu = "true"; document.head.append(script); }
if (!document.querySelector('script[data-trip-cart]')) { const script = document.createElement("script"); script.src = "trip-cart.js?v=8"; script.dataset.tripCart = "true"; document.head.append(script); }
if (!document.querySelector('script[data-favorites]')) { const script = document.createElement("script"); script.src = "favorites.js?v=3"; script.dataset.favorites = "true"; document.head.append(script); }

})();
