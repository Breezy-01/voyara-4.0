(() => {
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const dialog = $('#filter-dialog'), open = $('#open-filters');
  const date = $('#search-date'), guests = $('#search-travelers'), query = $('#page-search'), island = $('#island-filter'), sort = $('#sort-results');
  const today = () => new Date(Date.now() - new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);
  date.min = today();
  const checked = selector => $$(selector+':checked').map(input => input.value);
  const radio = name => $(`input[name="${name}"]:checked`).value;
  const setRadio = (name,value) => $$(`input[name="${name}"]`).forEach(input => input.checked = input.value === String(value));
  const setChecks = (selector,values) => $$(selector).forEach(input => input.checked = values.includes(input.value));
  const mode = () => document.body.dataset.discoverMode;
  const cards = $$('[data-filter-card]').map(element => {
    const link = element.querySelector('h2 a');
    const id = new URL(link.href).searchParams.get('id');
    const d = element.dataset, event = window.VoyaraEvents[id];
    if (event) {
      const when = new Date(event.date+'T12:00:00');
      const time = element.querySelector('time');
      time.dateTime = event.date;
      time.textContent = new Intl.DateTimeFormat('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'}).format(when)+' · '+event.time;
      element.querySelector('.event-schedule > span').textContent = event.location;
      element.querySelector('.result-info > p').textContent = event.description;
      element.querySelector('.result-image').style.backgroundImage = `url("${event.image}")`;
      const badge = element.querySelector('.event-date-badge');
      badge.replaceChildren();
      const day = document.createElement('b'); day.textContent = when.getDate();
      badge.append(day,when.toLocaleDateString('en-US',{month:'short'}).toUpperCase());
    }
    return {element,id,category:d.category,island:d.island,price:Number(event?.price ?? d.price),duration:Number(d.duration),rating:Number(d.rating),order:Number(d.order),date:event?.date || '',events:(d.eventTypes||'').split(' '),times:(d.time||'').split(' '),features:(d.features||'').split(' '),audience:event?.audience || (d.category==='guides'?'guide':['chef-table','ocean-spa'].includes(id)?'adult-only':'all-ages'),text:element.querySelector('.result-info').textContent+' '+d.category+' '+d.island+' '+({water:'boat boats tour tours snorkeling sailing',beach:'beach beaches club clubs day pass',tour:'tour tours sightseeing excursions',food:'food dining restaurants drinks',wellness:'spa wellness massage',events:'event events concerts festivals nightlife',guides:'guide guides itinerary itineraries'}[d.category]||'')};
  });
  function state() {
    return {mode:mode(),query:query.value.trim(),island:island.value,date:date.value,guests:guests.value,sort:sort.value,categories:mode()==='events'?[]:checked('[data-filter-category]'),events:mode()==='events'?checked('[data-filter-event]'):[],price:Number(radio('result-price')),rating:Number(radio('result-rating')),audience:radio('result-audience'),durations:mode()==='events'?[]:checked('[data-filter-duration]').map(Number),times:checked('[data-filter-time]'),features:checked('[data-filter-feature]')};
  }
  function setMode(value) {
    document.body.dataset.discoverMode = value;
    const events = value === 'events';
    $$('[data-experience-only]').forEach(el => el.hidden = events);
    $$('[data-events-only]').forEach(el => el.hidden = !events);
    $$('[data-discover-tab]').forEach(tab => {const active=tab.dataset.discoverTab===value;tab.setAttribute('aria-selected',active);tab.tabIndex=active?0:-1;});
    $('#discover-panel').setAttribute('aria-labelledby',value+'-tab');
    document.title = (events?'Events':'Experiences')+' in The Bahamas | Voyara';
    $('.breadcrumbs > span:last-child').textContent=events?'Events':'Experiences';
    $('#search').setAttribute('aria-label',events?'Search events':'Search experiences');
    date.setAttribute('aria-label',events?'Event date':'Experience date');
    query.placeholder=events?'Concerts, festivals, nightlife...':'Beach clubs, boat tours, dining...';
    $('#filter-title').textContent=events?'Refine your events':'Refine your experiences';
    $('.results-toolbar > div > span').textContent=events?'Upcoming island events':'Curated island experiences';
    guests.setAttribute('aria-label',events?'Guests':'Travelers');
    [...guests.options].forEach(option=>option.textContent=`${option.value} ${events?(option.value==='1'?'guest':'guests'):(option.value==='1'?'traveler':'travelers')}`);
    sort.querySelector('[value="soonest"]').hidden=!events;
    sort.querySelector('[value="soonest"]').disabled=!events;
  }
  function resetRefinements() {
    $$('#filter-dialog input[type=checkbox]').forEach(input=>input.checked=false);
    setRadio('result-price',9999);setRadio('result-rating',0);setRadio('result-audience','any');
  }
  function resetAll() {resetRefinements();query.value='';island.value='all';date.value='';guests.value='2';$('#search-status').textContent='';render();}
  function validateDate() {
    if(date.value && (!date.checkValidity() || date.value<today())) {
      date.value='';$('#search-status').textContent='That date has passed. Choose today or a future date.';
    } else $('#search-status').textContent='';
  }
  function syncQuick(s) {
    const single = items => items.length>1?'multiple':String(items[0]||'all');
    $('#quick-category').value=single(s.categories);$('#quick-event').value=single(s.events);
    $('#quick-price').value=String(s.price);$('#quick-duration').value=single(s.durations);$('#quick-time').value=single(s.times);
    $('#quick-family').checked=s.audience==='all-ages';$('#quick-age').value=s.audience;
    $('.date-pill').classList.toggle('has-date',!!s.date);
    $('.date-prompt').textContent=s.date?new Date(s.date+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'}):'Any date';
  }
  function saveURL(s) {
    const params = new URLSearchParams({mode:s.mode,island:s.island});
    for(const key of ['query','date','guests','sort']) if(s[key])params.set(key==='query'?'q':key,s[key]);
    for(const key of ['categories','events','durations','times','features']) if(s[key].length)params.set(key,s[key].join(','));
    if(s.price!==9999)params.set('price',s.price);if(s.rating)params.set('rating',s.rating);if(s.audience!=='any')params.set('audience',s.audience);
    history.replaceState(null,'',location.pathname+'?'+params+location.hash);
  }
  function activeFilters(s) {
    const container=$('#active-filters');container.replaceChildren();let count=0;
    const chip = (label,clear) => {count++;const button=document.createElement('button');button.type='button';button.textContent=label+' ×';button.setAttribute('aria-label','Remove '+label);button.addEventListener('click',()=>{clear();render();$('.active-filter-bar').hidden?open.focus():$('#clear-active-filters').focus();});container.append(button);};
    if(s.query)chip('Search: '+s.query,()=>query.value='');
    if(s.island!=='all')chip(island.selectedOptions[0].textContent,()=>island.value='all');
    if(s.date)chip(new Date(s.date+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}),()=>date.value='');
    if(s.guests!=='2')chip(s.guests+' guests',()=>guests.value='2');
    $$('#filter-dialog input:checked').filter(input=>!['9999','0','any'].includes(input.value)&&!input.closest('[hidden]')).forEach(input=>chip(input.closest('label').textContent.trim(),()=>{if(input.type==='checkbox')input.checked=false;else setRadio(input.name,input.name==='result-price'?'9999':input.name==='result-rating'?'0':'any');}));
    $('.active-filter-bar').hidden=!count;
    const refinements=$$('#filter-dialog input:checked').filter(input=>!['9999','0','any'].includes(input.value)&&!input.closest('[hidden]')).length;
    $('#filter-count').textContent=refinements;$('#filter-count').hidden=!refinements;
  }
  function renderMap(matches) {
    const surface=$('#results-map-surface');surface.replaceChildren();
    matches.forEach((card,index)=>{const link=document.createElement('a');link.className='result-map-pin';link.href=card.element.querySelector('h2 a').href;link.style.left=(15+(index*23)%72)+'%';link.style.top=(18+(index*31)%67)+'%';link.textContent=card.price?'$'+card.price:'Free';link.setAttribute('aria-label',card.element.querySelector('h2').textContent+', '+link.textContent);const title=document.createElement('span');title.textContent=card.element.querySelector('h2').textContent;link.append(title);surface.append(link);});
  }
  function render() {
    const s=state();syncQuick(s);activeFilters(s);saveURL(s);
    cards.forEach(card=>{
      card.element.querySelectorAll('a[href*="-detail.html"]').forEach(link=>{const url=new URL(link.href);if(s.date&&card.category!=='events')url.searchParams.set('date',s.date);else url.searchParams.delete('date');url.searchParams.set('guests',s.guests);url.searchParams.set('returnTo','things-to-do.html'+location.search);link.href=url.pathname.split('/').pop()+url.search;});
      card.element.classList.toggle('hidden-card',!window.VoyaraSearchLogic.matches(card,s,today()));
    });
    const ordered=[...cards].sort((a,b)=>s.sort==='price-low'?a.price-b.price:s.sort==='price-high'?b.price-a.price:s.sort==='rating'?b.rating-a.rating:s.sort==='soonest'?a.date.localeCompare(b.date):a.order-b.order);
    ordered.forEach(card=>$('#results-list').append(card.element));
    const matches=ordered.filter(card=>!card.element.classList.contains('hidden-card'));
    $('#result-count').textContent=`${matches.length} ${matches.length===1?'result':'results'}`;
    $('#apply-filters').textContent=`Show ${matches.length} ${matches.length===1?'result':'results'}`;
    $('#empty-state').classList.toggle('visible',!matches.length);
    $('#empty-state p').textContent=s.mode==='events'?'No upcoming events match these choices. Try another date or remove a filter.':'No experiences match these choices. Try another category, price or island.';
    renderMap(matches);
  }
  function restore() {
    const p=new URLSearchParams(location.search);resetRefinements();
    const events=p.get('mode')==='events'||p.get('category')==='events';setMode(events?'events':'experiences');
    query.value=p.get('q')||'';island.value=['all','nassau','exuma','eleuthera'].includes(p.get('island'))?p.get('island'):p.get('category')==='guides'?'all':'nassau';
    guests.value=['1','2','3','4'].includes(p.get('guests'))?p.get('guests'):'2';
    date.value=p.get('date')||'';validateDate();
    const pairs=[['categories','[data-filter-category]'],['events','[data-filter-event]'],['durations','[data-filter-duration]'],['times','[data-filter-time]'],['features','[data-filter-feature]']];
    pairs.forEach(([key,selector])=>setChecks(selector,(p.get(key)||(key==='categories'&&p.get('category')!=='events'?p.get('category'):'')||'').split(',')));
    if(events){setChecks('[data-filter-category]',[]);setChecks('[data-filter-duration]',[]);}else setChecks('[data-filter-event]',[]);
    for(const [param,name,fallback] of [['price','result-price','9999'],['rating','result-rating','0'],['audience','result-audience','any']])setRadio(name,$$(`input[name="${name}"]`).some(input=>input.value===p.get(param))?p.get(param):fallback);
    if(!events&&radio('result-audience')==='adult-only')setRadio('result-audience','any');
    sort.value=['recommended','rating','price-low','price-high',...(events?['soonest']:[])].includes(p.get('sort'))?p.get('sort'):events?'soonest':'recommended';render();
  }
  for(const [id,selector] of [['quick-category','[data-filter-category]'],['quick-event','[data-filter-event]'],['quick-duration','[data-filter-duration]'],['quick-time','[data-filter-time]']])$('#'+id).addEventListener('change',event=>{setChecks(selector,[event.target.value]);render();});
  $('#quick-price').addEventListener('change',event=>{setRadio('result-price',event.target.value);render();});
  $('#quick-age').addEventListener('change',event=>{setRadio('result-audience',event.target.value);render();});
  $('#quick-family').addEventListener('change',event=>{setRadio('result-audience',event.target.checked?'all-ages':'any');render();});
  dialog.addEventListener('change',render);
  [query,island,guests].forEach(input=>input.addEventListener('input',render));
  date.addEventListener('change',()=>{validateDate();render();});sort.addEventListener('change',render);
  $('[data-search-submit]').addEventListener('click',()=>{validateDate();render();});query.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();render();}});
  const tabs=$$('[data-discover-tab]');
  const switchTab=tab=>{if(mode()===tab.dataset.discoverTab)return;setMode(tab.dataset.discoverTab);setChecks('[data-filter-category]',[]);setChecks('[data-filter-event]',[]);setChecks('[data-filter-duration]',[]);setChecks('[data-filter-time]',[]);setChecks('[data-filter-feature]',[]);setRadio('result-audience','any');sort.value=mode()==='events'?'soonest':'recommended';render();};
  tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>switchTab(tab));tab.addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();const next=tabs[event.key==='Home'?0:event.key==='End'?1:1-index];next.focus();switchTab(next);}});});
  ['clear-filters','clear-active-filters','reset-results'].forEach(id=>$('#'+id).addEventListener('click',resetAll));
  open.addEventListener('click',()=>{dialog.showModal();document.body.style.overflow='hidden';});
  $('#close-filters').addEventListener('click',()=>dialog.close());$('#apply-filters').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{document.body.style.overflow='';open.focus();});
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  $$('[data-results-view]').forEach(button=>button.addEventListener('click',()=>{const map=button.dataset.resultsView==='map';$('#results-list').hidden=map;$('#results-map').hidden=!map;$$('[data-results-view]').forEach(el=>{el.classList.toggle('active',el===button);el.setAttribute('aria-pressed',el===button);});}));
  const mobile=matchMedia('(max-width:700px)');const label=()=>$('.filter-button-label').textContent=mobile.matches?'Filters':'More filters';mobile.addEventListener('change',label);label();
  window.addEventListener('popstate',restore);window.addEventListener('pageshow',event=>{if(event.persisted)restore();});restore();
})();
