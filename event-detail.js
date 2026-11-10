(() => {
 const id = new URLSearchParams(location.search).get('id');
 const event = window.VoyaraEvents[id];
 if (!event) { window.voyaraRecovery('Event not found','This event link is no longer available. Explore other island events to find your next night out.','events.html','Explore events'); return; }
 const when = new Intl.DateTimeFormat('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'}).format(new Date(event.date+'T12:00:00'))+' · '+event.time;
 document.title = event.title+' | Voyara';
 for (const [id,text] of Object.entries({'event-title':event.title,'event-location':event.location,'event-description':event.description,'event-when':when,'event-venue':event.location,'event-age':event.audience === 'adult-only' ? 'Ages 18+' : 'All ages','event-price':'$'+event.price,'event-mobile-price':'$'+event.price,'event-book-date':when})) document.getElementById(id).textContent = text;
 document.querySelector('#event-image').src = event.image; document.querySelector('#event-image').alt = event.title+' — sample event image';
 document.querySelector('#event-map').href = 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(event.location+', The Bahamas');
 const guestCount = new URLSearchParams(location.search).get('guests');
 if (['1','2','3','4'].includes(guestCount)) document.querySelector('#event-guests').value = guestCount;
 const today = new Date(Date.now() - new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);
 if (event.date < today) {
   const button = document.querySelector('#event-book-form button');
   button.disabled = true; button.textContent = 'Event has ended';
   document.querySelector('#event-book-date').textContent = when + ' · Past sample event';
 }
 document.querySelector('#event-book-form').addEventListener('submit',e => {e.preventDefault(); const guests = Number(document.querySelector('#event-guests').value);(window.VoyaraStore || localStorage).setItem('voyara-booking-draft',JSON.stringify({...event,kind:'event',meeting:event.location,childPrice:event.price,guests,travelers:{adults:guests,kids:0}}));location.href='booking.html';});
})();
