(() => {
 const route = window.VoyaraItineraries[new URLSearchParams(location.search).get('id')];
 if (!route) { window.voyaraRecovery('Itinerary not found','This route is no longer available at this link. Find another island itinerary to make your own.','itineraries.html','Explore itineraries'); return; }
 document.title=route.title+' | Voyara';
 for(const [id,text] of Object.entries({'route-title':route.title,'route-location':route.location+' · Full day','route-description':route.description,'route-price':'$'+route.price,'route-mobile-price':'$'+route.price,'route-stop-count':route.stops.length+' stops · starts at '+route.stops[0][0]}))document.getElementById(id).textContent=text;
 const routeDate = document.querySelector('#route-date');
 routeDate.min = new Date(Date.now() - new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);
 const params = new URLSearchParams(location.search);
 if (/^\d{4}-\d{2}-\d{2}$/.test(params.get('date') || '') && params.get('date') >= routeDate.min) routeDate.value = params.get('date');
 const guestsInput = document.querySelector('#route-guests');
 if ([...guestsInput.options].some(option => option.value === params.get('guests'))) guestsInput.value = params.get('guests');
 const img=document.querySelector('#route-image');img.src=route.image;img.alt=route.title+' — route inspiration';
 route.stops.forEach(([time,title],index)=>{const li=document.createElement('li');const clock=document.createElement('time');clock.textContent=time;const div=document.createElement('div');const heading=document.createElement('h3');heading.textContent=title;const link=document.createElement('a');link.textContent='Explore stop on map';link.href='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(title+', '+route.location);link.target='_blank';link.rel='noopener noreferrer';div.append(heading,link);li.append(clock,div);document.querySelector('#route-timeline').append(li);});
 document.querySelector('#route-book-form').addEventListener('submit',e=>{e.preventDefault();const guests=Number(document.querySelector('#route-guests').value);(window.VoyaraStore || localStorage).setItem('voyara-booking-draft',JSON.stringify({...route,kind:'itinerary',date:document.querySelector('#route-date').value,time:route.stops[0][0],childPrice:route.price,guests,travelers:{adults:guests,kids:0},meeting:'Confirm the starting point with your route host.'}));location.href='booking.html';});
 document.querySelector('.detail-mobile-book a').addEventListener('click',()=>setTimeout(()=>document.querySelector('#route-date').focus({preventScroll:true}),0));
})();
