(() => {
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const tabs = [...document.querySelectorAll('[data-trip-tab]')];
  let selected = new URLSearchParams(location.search).get('trips')==='all'?'all':'upcoming';
  function render() {
  const bookings = window.VoyaraBookings.all();

    tabs.forEach(tab => { const active = tab.dataset.tripTab === selected; tab.setAttribute('aria-selected',active);tab.tabIndex=active?0:-1; });
    document.querySelector('#trip-list').setAttribute('aria-labelledby','trips-'+selected);
    for (const kind of ['upcoming','past']) { const count=bookings.filter(x=> window.VoyaraBookings.status(x)===kind).length; document.querySelector('#'+kind+'-count').textContent = `${count} trip${count===1?'':'s'}`; }
    document.querySelector('#cancelled-count').textContent = '('+bookings.filter(x=>window.VoyaraBookings.status(x)==='cancelled').length+')';
    const items = bookings.filter(x => selected==='all'||window.VoyaraBookings.status(x)===selected).sort((a,b)=> selected==='past'?String(b.item.date).localeCompare(a.item.date):String(a.item.date).localeCompare(b.item.date));
    document.querySelector('#trip-list').innerHTML = items.length ? items.map(booking => {
      const status=window.VoyaraBookings.status(booking); const item = booking.item; const people=item.travelers || {adults:item.guests || 2,kids:0};
      const date=/^\d{4}-\d{2}-\d{2}$/.test(item.date)?new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric'}).format(new Date(item.date+'T12:00:00')):'Flexible date';
      return `<article class="collection-trip"><img src="${escape(item.image || 'assets/voyara-hero-v2.png')}" alt=""><div class="collection-trip-body"><span class="collection-eyebrow">${status==='cancelled'?'Cancelled':status==='past'?'Past':'Upcoming'} · sample booking</span><h3>${escape(item.title)}</h3><p>${escape(item.location || 'The Bahamas')}</p><dl><div><dt>Date & time</dt><dd>${date} · ${escape(item.time || 'To be confirmed')}</dd></div><div><dt>Guests</dt><dd>${people.adults} adult${people.adults===1?'':'s'}${people.kids?` · ${people.kids} ${people.kids===1?'child':'children'}`:''}</dd></div></dl><div class="collection-trip-bottom"><span><small>Sample total</small><strong>$${Number(booking.total).toLocaleString('en-US')}</strong></span><a class="collection-cta" href="booking-confirmation.html?booking=${encodeURIComponent(booking.number)}">View details${status==='upcoming'?' & manage':''}</a></div></div></article>`;
    }).join('') : `<div class="collection-empty"><span class="collection-empty-icon" aria-hidden="true">☼</span><h3>${selected==='cancelled'?'No cancelled trips':selected==='past'?'Your travel story starts here':'Your next island day is waiting'}</h3><p>${selected==='cancelled'?'Cancelled sample bookings stay here for your records.':selected==='past'?'Past sample bookings will appear here after their travel date.':'Explore an experience and complete a preview booking to see it here.'}</p><a class="collection-cta" href="things-to-do.html">Explore experiences</a></div>`;
  }
  tabs.forEach((tab,index)=> {tab.addEventListener('click',()=>{selected=tab.dataset.tripTab;render();});tab.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?tabs.length-1:(index+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[next].click();tabs[next].focus();});});
  window.addEventListener('voyara:auth-change', render);
  window.addEventListener('voyara:collections-change', render);
  window.addEventListener('storage', render);
  window.addEventListener('pageshow', render);
  render();
})();
