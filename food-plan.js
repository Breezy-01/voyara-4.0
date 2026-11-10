(() => {
 const P=window.VoyaraPlan,key='voyara-food-plan-v1';
 const places=[
 {id:'harbour-cafe',title:'Harbour Café',meeting:'Nassau Harbour',open:480,close:960,meal:45,description:'Demo café for breakfast, sandwiches and a light lunch.'},
 {id:'cable-kitchen',title:'Cable Beach Kitchen',meeting:'Cable Beach',open:660,close:1260,meal:60,description:'Demo casual kitchen for a relaxed lunch or early dinner.'},
 {id:'paradise-bistro',title:'Paradise Bistro',meeting:'Paradise Island',open:480,close:1260,meal:60,description:'Demo island bistro with breakfast, lunch and dinner options.'}
 ,{id:'market-table',title:'Market Table',meeting:'Nassau Harbour',open:660,close:1020,meal:50,description:'Demo Bahamian lunch kitchen with seafood and vegetarian plates.'},
 {id:'garden-deli',title:'Garden Deli',meeting:'Nassau Harbour',open:480,close:1020,meal:35,description:'Demo deli with sandwiches, salads and fresh juices.'}
 ];
 const details={
 'harbour-cafe':{cuisine:'Café & light bites',price:'$15–25',booking:'Walk-ins welcome',tier:0,phone:'(242) 555-0101'},
 'cable-kitchen':{cuisine:'Island comfort food',price:'$25–40',booking:'Booking recommended',tier:1,phone:'(242) 555-0102'},
 'paradise-bistro':{cuisine:'Bistro & seafood',price:'$30–50',booking:'Booking required',tier:0,phone:'(242) 555-0103'},
 'market-table':{cuisine:'Bahamian & vegetarian',price:'$20–35',booking:'Booking recommended',tier:2,phone:'(242) 555-0104'},
 'garden-deli':{cuisine:'Sandwiches & salads',price:'$10–20',booking:'Walk-ins welcome',tier:0,phone:'(242) 555-0105'}
 };
 places.forEach(p=>Object.assign(p,details[p.id]));
 // Promote eligible places only. Keep organic choices in every available shortlist.
 const rank=options=>options.sort((a,b)=>(b.place.tier*20-b.incoming-b.outgoing)-(a.place.tier*20-a.incoming-a.outgoing)).slice(0,5);
 let changing=null;
 const read=()=>{const raw=P.read(key,{}),value=raw&&typeof raw==='object'?raw:{};return {stops:Array.isArray(value.stops)?value.stops:[],dismissed:Array.isArray(value.dismissed)?value.dismissed:[]};};
 const clock=n=>`${Math.floor(n/60)%12||12}:${String(n%60).padStart(2,'0')} ${n>=720?'PM':'AM'}`;
 const identity=x=>x.cartId||x.number;
 function gaps(items=P.pending(),bookings=window.VoyaraBookings.all()){
 const entries=P.sorted([...items,...bookings.filter(b=>window.VoyaraBookings.status(b)==='upcoming').map(b=>({...b.item,number:b.number}))]);const result=[];
 for(let i=0;i<entries.length-1;i++){
 const a=entries[i],b=entries[i+1];if(a.date!==b.date||!identity(a)||!identity(b)||!P.duration(a)||P.minutes(a.time)>=1440||P.minutes(b.time)>=1440)continue;
 const end=P.minutes(a.time)+P.duration(a),next=P.minutes(b.time);if(next<=end)continue;
 // Never recommend in a gap occupied by another (possibly longer) experience.
 if(entries.some(x=>x!==a&&x!==b&&x.date===a.date&&(!P.duration(x)||P.minutes(x.time)<next&&P.minutes(x.time)+P.duration(x)>end)))continue;
 const options=places.map(place=>{const incoming=P.transfer(a,place),outgoing=P.transfer(place,b);if(incoming===null||outgoing===null)return null;const start=Math.max(end+incoming,place.open),finish=start+place.meal;if(finish>place.close||finish+outgoing>next)return null;return {place,start,finish,incoming,outgoing};}).filter(Boolean).sort((a,b)=>a.incoming+a.outgoing-b.incoming-b.outgoing);
 if(options.length)result.push({id:JSON.stringify([identity(a),a.date,a.time,identity(b),b.date,b.time]),date:a.date,a,b,gap:next-end,options:rank(options)});
 }return result;
 }
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const bookingDetails=place=>place?`<div class="food-booking"><strong>${esc(place.booking)}</strong><p>Booking phone: <span>${esc(place.phone)}</span> <small>Demo number · calls disabled</small></p><button type="button" disabled aria-label="Call to book unavailable for demo number">Call to book · demo</button><small>Adding to your plan does not reserve a table.</small></div>`:'';
 function mount(root){
 const state=read(),available=gaps(),container=document.createElement('section');container.className='plan-card food-planner';container.id='food-recommendations';
 container.innerHTML='<h2>A bite between experiences</h2><p>Optional food stops · not reservations or cart charges. Places, opening hours and travel times below are fictional local demo data. Travel estimates include arrival buffers.</p>';
 for(const stop of (window.VoyaraTimeline?[]:state.stops)){const gap=available.find(g=>g.id===stop.gapId),option=gap?.options.find(o=>o.place.id===stop.placeId&&o.start===stop.start);container.innerHTML+=`<article class="schedule-change"><strong>${esc(places.find(p=>p.id===stop.placeId)?.title||'Food stop')} · added to plan</strong><p>${esc(stop.date)} · ${clock(stop.start)}–${clock(stop.finish)}</p>${option?'<small>Fits the current gap · no booking or charge</small>':'<p class="plan-warning">Your schedule changed. This food stop no longer fits or cannot be verified. Remove it and choose a fresh suggestion.</p>'}<button type="button" data-food-remove="${esc(stop.gapId)}">Remove food stop</button></article>`;}
 const suggestions=available.filter(g=>!state.dismissed.includes(g.id)&&(!state.stops.some(s=>s.gapId===g.id)||changing===g.id));
 for(const gap of suggestions){const selected=state.stops.find(s=>s.gapId===gap.id);container.innerHTML+=`<div class="food-gap"><h3>${esc(gap.date)} · ${gap.gap}-minute gap</h3><p>Between ${esc(gap.a.title)} and ${esc(gap.b.title)}</p><small>Choose one stop. All options fit the sample hours and travel buffers. Sponsored placements are paid-promotion examples.</small><div class="food-choice-grid">${gap.options.map(option=>{const place=option.place;return `<article class="food-choice"><span class="food-placement">${place.tier?'Sponsored':'Nearby choice'}</span><h3>${esc(place.title)}</h3><p>${esc(place.cuisine)} · ${esc(place.price)} per person <small>(sample)</small></p><p>${clock(option.start)}–${clock(option.finish)} · ${place.meal}-minute meal</p><p>Estimated transfers: ${option.incoming} min before · ${option.outgoing} min after</p><details><summary>View place</summary><p>${esc(place.description)}</p><p>${esc(place.meeting)} · Sample hours ${clock(place.open)}–${clock(place.close)}.</p></details>${bookingDetails(place)}<button class="plan-button" type="button" data-food-add="${esc(gap.id)}" data-place="${esc(place.id)}" ${selected?.placeId===place.id?'disabled':''}>${selected?.placeId===place.id?'Selected':selected?'Choose this instead':'Add to plan'}</button></article>`;}).join('')}</div>${selected?'<button type="button" data-food-cancel-change>Keep current restaurant</button>':`<button type="button" data-food-dismiss="${esc(gap.id)}">Dismiss these suggestions</button>`}</div>`;}
 if(!suggestions.length)container.innerHTML+=state.stops.length?'<p>Your chosen food stops appear in the timeline. Use Change restaurant to compare alternatives.</p>':'<p>No food suggestions fit your current gaps. Leave more time between experiences to see options.</p>';
 if(state.dismissed.length)container.innerHTML+='<button type="button" data-food-reset>Show dismissed suggestions</button>';
 const summary=root.querySelector('.plan-summary');if(summary)summary.before(container);else root.append(container);
 container.addEventListener('click',event=>{const button=event.target.closest('button');if(!button)return;try{if(button.hasAttribute('data-food-cancel-change')){changing=null;window.dispatchEvent(new Event('voyara:plan-undo'));return;}const current=read();if(button.hasAttribute('data-food-add')){const gap=gaps().find(g=>g.id===button.dataset.foodAdd);if(!gap)throw new Error('Your schedule changed. Refresh the plan and try again.');const o=gap.options.find(o=>o.place.id===button.dataset.place);if(!o)throw new Error('This restaurant no longer fits. Review the latest options.');current.stops=current.stops.filter(s=>s.gapId!==gap.id);changing=null;current.stops.push({gapId:gap.id,placeId:o.place.id,date:gap.date,start:o.start,finish:o.finish});}else if(button.hasAttribute('data-food-remove'))current.stops=current.stops.filter(s=>s.gapId!==button.dataset.foodRemove);else if(button.hasAttribute('data-food-dismiss'))current.dismissed.push(button.dataset.foodDismiss);else if(button.hasAttribute('data-food-reset'))current.dismissed=[];else return;if(window.VoyaraTimeline)window.VoyaraTimeline.change(key,button.hasAttribute('data-food-remove')?'Food stop removed':'Food plan updated',()=>P.store().setItem(key,JSON.stringify(current)));else P.store().setItem(key,JSON.stringify(current));}catch(error){document.querySelector('#plan-error').textContent=error.message||'Could not save your food stop. Please try again.';}});
 }
 window.VoyaraFood={gaps,mount,read,places,bookingDetails,changeRestaurant(id){changing=id;window.dispatchEvent(new Event('voyara:plan-undo'));document.querySelector('#food-recommendations')?.scrollIntoView({behavior:'smooth',block:'start'});}};
})();
