(() => {
  const header = document.querySelector('.header');
  const nav = header?.querySelector('.nav');
  const toggle = header?.querySelector('.menu-button');
  if (!nav || !toggle) return;
  header.classList.add('unified-navigation');
  nav.id = 'voyara-navigation';
  nav.setAttribute('aria-label','Main navigation');
  toggle.type = 'button';
  toggle.setAttribute('aria-controls',nav.id);
  toggle.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
  nav.innerHTML = '<a href="index.html">Discover</a><a href="events.html">Trending</a><a href="itineraries.html">Itineraries</a><a href="voyagers.html">Voyagers</a><div class="navigation-personal"><span>Your Voyara</span><a href="profile.html#trips">My Trips</a><a href="favorites.html">Favourites</a><a href="profile.html">Account</a><button type="button" class="mobile-logout" hidden>Log out</button></div>';
  const personal = nav.querySelector('.navigation-personal');
  const accountLink = personal.querySelector('a[href="profile.html"]');
  const syncPersonal = () => {
    const signedIn = document.documentElement.dataset.authState === 'authenticated';
    personal.querySelectorAll('a').forEach(link => { link.hidden = link !== accountLink && !signedIn; });
    accountLink.textContent = signedIn ? 'Account' : 'Sign in';
    personal.querySelector('.mobile-logout').hidden = !signedIn;
  };
  accountLink.addEventListener('click', event => {
    if (document.documentElement.dataset.authState !== 'authenticated' && window.VoyaraAuth) {
      event.preventDefault();
      window.VoyaraAuth.open();
    }
  });
  window.addEventListener('voyara:auth-change', syncPersonal);
  window.addEventListener('voyara:auth-ready', syncPersonal);
  syncPersonal();
  const page = location.pathname.split('/').pop() || 'index.html';
  const current = /event/.test(page)?'events.html':/itinerar/.test(page)?'itineraries.html':/voyager|creator-profile/.test(page)?'voyagers.html':page==='profile.html'?(location.hash==='#trips'?'profile.html#trips':'profile.html'):page==='favorites.html'?page:'index.html';
  nav.querySelectorAll('a').forEach(a=>{a.classList.toggle('active',a.getAttribute('href')===current);if(a.getAttribute('href')===current)a.setAttribute('aria-current','page');});
  const mobile = matchMedia('(max-width: 760px)');
  const close = (focus=false) => {nav.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Open navigation');if(focus)toggle.focus();};
  close();
  toggle.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();const open=!nav.classList.contains('open');close();if(open){nav.classList.add('open');toggle.setAttribute('aria-expanded','true');toggle.setAttribute('aria-label','Close navigation');}},true);
  personal.querySelector('.mobile-logout').addEventListener('click',async()=>{await window.VoyaraAuth?.logout();close(true);});
  nav.addEventListener('click',e=>{if(e.target.closest('a'))close();});
  document.addEventListener('click',e=>{if(!nav.contains(e.target)&&!toggle.contains(e.target))close();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){e.preventDefault();close(true);}});
  document.addEventListener('focusin',e=>{if(!nav.contains(e.target)&&!toggle.contains(e.target))close();});
  mobile.addEventListener('change',()=>close());
  // Keep the existing account actions, while making the dropdown keyboard-friendly.
  document.addEventListener('keydown',e=>{
    const anchor = header.querySelector('.account-menu-anchor');
    const menu = anchor?.querySelector('.voyara-account-menu');
    const button = anchor?.querySelector('.guest-account-button');
    if(!menu || menu.hidden)return;
    if(e.key==='Escape'){e.preventDefault();button.click();button.focus();}
    if(e.key==='ArrowDown' && e.target===button){e.preventDefault();menu.querySelector('button,a')?.focus();}
  },true);
  document.addEventListener('focusin',e=>{
    const anchor=header.querySelector('.account-menu-anchor');const menu=anchor?.querySelector('.voyara-account-menu');
    if(menu&&!menu.hidden&&!anchor.contains(e.target))anchor.querySelector('.guest-account-button')?.click();
  });
  const iconPaths={home:'<path d="m3 10 9-7 9 7v10H6V10"/><path d="M9 20v-7h6v7"/>',community:'<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6M18 15a5 5 0 0 1 3 4v2"/>',search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',create:'<rect x="3" y="3" width="18" height="18" rx="5"/><path d="M12 7v10M7 12h10"/>',profile:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>'};
  document.querySelectorAll('.voyager-rail nav>a,.voyager-rail nav>button').forEach((item,index)=>{const names=['Discover','Voyagers','Search','Create','Profile'],keys=['home','community','search','create','profile'];const icon=item.querySelector('.rail-icon,.rail-avatar');if(!icon)return;const slot=document.createElement('span');slot.className='rail-icon';slot.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true">'+iconPaths[keys[index]]+'</svg>';icon.replaceWith(slot);item.setAttribute('aria-label',names[index]);if(item.classList.contains('active'))item.setAttribute('aria-current','page');});
  const more=document.querySelector('.voyager-rail .rail-more');if(more){more.setAttribute('aria-label','More community options');more.querySelector('span').innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true">'+iconPaths.more+'</svg>';}
  document.querySelectorAll('.voyager-mobile-nav>a,.voyager-mobile-nav>button').forEach((item,index)=>{
    const names=['Discover','Voyagers','Create a voyage','Trending','Profile'];
    const keys=['home','community','create','search','profile'];
    const calendar='<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4M17 3v4M3 11h18M8 15h3M8 18h7"/>';
    item.setAttribute('aria-label',names[index]);
    if(!item.querySelector('img')) item.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true">'+(index===3?calendar:iconPaths[keys[index]])+'</svg>';
    if(item.classList.contains('active'))item.setAttribute('aria-current','page');
  });
})();

// Header popovers share one open state, including keyboard-triggered clicks.
(() => {
 const menus=[
  {trigger:'.favorites-trigger',panel:'.favorites-preview'},
  {trigger:'.trip-cart-trigger',panel:'.trip-cart-panel'},
  {trigger:'.account-menu-anchor > button',panel:'.voyara-account-menu'}
 ];
 document.addEventListener('click',event=>{
  const selected=menus.find(menu=>event.target.closest('.header '+menu.trigger));
  if(!selected)return;
  menus.filter(menu=>menu!==selected).forEach(menu=>{
   document.querySelectorAll('.header '+menu.panel).forEach(panel=>panel.hidden=true);
   document.querySelectorAll('.header '+menu.trigger).forEach(trigger=>trigger.setAttribute('aria-expanded','false'));
   if(menu.panel==='.voyara-account-menu')document.querySelector('.header .account-menu-anchor')?.classList.remove('open');
  });
 },true);
})();
