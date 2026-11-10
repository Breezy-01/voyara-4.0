(() => {
  const dialog = document.querySelector('#whats-happening');
  const trigger = document.querySelector('#open-happenings');
  if (!dialog || !trigger) return;
  const key = 'voyara-happenings-seen';
  let returnFocus = trigger;
  const today = new Date();
  const dateKey = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  const events = Object.values(window.VoyaraEvents || {}).filter(event => event.date >= dateKey).sort((a,b) => a.date.localeCompare(b.date)).slice(0,3);
  const list = dialog.querySelector('.happenings-list');
  events.forEach(event => {
    const card = document.createElement('a');
    card.className = 'happenings-card';
    card.href = `event-detail.html?id=${encodeURIComponent(event.id)}`;
    const photo = document.createElement('img'); photo.src = event.image; photo.alt = ''; photo.loading = 'lazy';
    const copy = document.createElement('div');
    const date = document.createElement('span'); date.className = 'happenings-date';
    date.textContent = `${new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric'}).format(new Date(event.date+'T12:00:00'))} · ${event.time}`;
    const title = document.createElement('h3'); title.textContent = event.title;
    const location = document.createElement('p'); location.textContent = event.location;
    const detail = document.createElement('small'); detail.textContent = `From $${event.price} / guest${event.audience === 'adult-only' ? ' · 18+' : ' · All ages'}`;
    copy.append(date,title,location,detail);card.append(photo,copy);list.append(card);
  });
  if (!events.length) {
    const empty = document.createElement('p'); empty.className = 'happenings-empty';
    empty.textContent = 'No upcoming sample events right now. Explore Trending for more island inspiration.';
    list.append(empty);
  }
  const open = () => {
    if (dialog.open) return;
    returnFocus = document.activeElement instanceof HTMLElement && document.activeElement !== document.body ? document.activeElement : trigger;
    dialog.showModal();document.body.classList.add('happenings-open');trigger.setAttribute('aria-expanded','true');
    try { sessionStorage.setItem(key,'1'); } catch {}
  };
  trigger.addEventListener('click',open);
  dialog.querySelectorAll('[data-close-happenings]').forEach(button => button.addEventListener('click',()=>dialog.close()));
  dialog.addEventListener('click',event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close',()=>{document.body.classList.remove('happenings-open');trigger.setAttribute('aria-expanded','false');returnFocus?.focus({preventScroll:true});});
  let seen = false;try {seen = sessionStorage.getItem(key) === '1';} catch {}
  if (!seen) setTimeout(()=>{
    // Do not interrupt someone already searching or using another dialog.
    if (document.visibilityState === 'visible' && !document.querySelector('dialog[open]') && !document.activeElement?.matches('input,select,textarea') && !document.querySelector('.auth-account-anchor.open')) open();
  },1200);
})();
