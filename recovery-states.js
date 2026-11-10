(() => {
  window.voyaraRecovery = (title, description, href, label) => {
    const main = document.querySelector('main');
    if (!main) return;
    main.replaceChildren();
    const section = document.createElement('section'); section.className='recovery-state';
    const icon = document.createElement('span'); icon.className='recovery-symbol';icon.textContent='☼';icon.setAttribute('aria-hidden','true');
    const heading=document.createElement('h1');heading.textContent=title;heading.tabIndex=-1;
    const text=document.createElement('p');text.textContent=description;
    const link=document.createElement('a');link.href=href;link.textContent=label;link.className='recovery-action';
    const home=document.createElement('a');home.href='index.html';home.textContent='Back to home';home.className='recovery-home';
    section.append(icon,heading,text,link,home);main.append(section);document.title=title+' | Voyara';
    document.querySelector('.detail-mobile-book')?.remove();
  };
  const fallback = image => {
    if (!(image instanceof HTMLImageElement) || image.dataset.fallbackApplied) return;
    image.dataset.fallbackApplied='true';
    image.src='assets/image-unavailable.svg';image.srcset='';
    image.alt='Image unavailable';image.classList.add('image-unavailable');
  };
  document.addEventListener('error',e=>fallback(e.target),true);
  document.addEventListener('DOMContentLoaded',()=>{
    document.querySelectorAll('#empty-state,#voyager-empty,#favorites-count').forEach(element=>element.setAttribute('aria-live','polite'));
    document.querySelectorAll('img').forEach(img=>{if(img.complete&&!img.naturalWidth)fallback(img);});
    if(window.voyaraTicketMissing)window.voyaraRecovery('Ticket not found','This sample ticket is not saved in this browser. Find your available bookings in My Trips.','profile.html#trips','Go to My Trips');
  });
})();
