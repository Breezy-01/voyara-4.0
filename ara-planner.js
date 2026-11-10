(() => {
 const P=window.VoyaraPlan;
 const tags={'nassau-city':'culture','turtle-cove':'water','sunset-sail':'water','ocean-spa':'relax','azure-day-pass':'relax','chef-table':'dining'};
 const extra={relaxed:45,balanced:20,packed:0},limit={relaxed:2,balanced:3,packed:3};
 const clock=n=>`${Math.floor(n/60)%12||12}:${String(n%60).padStart(2,'0')} ${n>=720?'PM':'AM'}`;
 function build(pref,catalog=window.ARA_CATALOG,existing=P.pending(),bookings=window.VoyaraBookings.all()){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(pref.date)||pref.date<window.VoyaraBookings.today()||!Number.isFinite(pref.start)||!Number.isFinite(pref.end)||pref.start<0||pref.end>1440||pref.end<=pref.start||!pref.interests.length||!Number.isInteger(pref.adults)||pref.adults<1||!Number.isInteger(pref.kids)||pref.kids<0||!(pref.pace in extra))return {items:[],message:'Choose a valid day, a finish time after your start, travelers and at least one interest.'};
 const locked=[...existing,...bookings.filter(b=>window.VoyaraBookings.status(b)==='upcoming').map(b=>b.item)].filter(x=>x.date===pref.date);
 const candidates=catalog.filter(x=>pref.interests.includes(tags[x.id])&&!locked.some(b=>b.id===x.id));let best=[],bestScore=-Infinity;
 function walk(plan){const score=plan.length*100+new Set(plan.map(x=>tags[x.id])).size*15-(plan.length?(P.minutes(plan.at(-1).time)+P.duration(plan.at(-1))-pref.start)/100:0);if(score>bestScore){best=plan;bestScore=score;}if(plan.length>=limit[pref.pace])return;
 for(const item of candidates){if(plan.some(x=>x.id===item.id))continue;const d=P.duration(item);if(!d)continue;
 for(const time of (item.id==='sunset-sail'?['3:00 PM']:item.id==='chef-table'?['1:30 PM','3:00 PM']:['9:30 AM','11:00 AM','1:30 PM','3:00 PM'])){const start=P.minutes(time);if(start<pref.start||start+d>pref.end)continue;const previous=plan.at(-1);if(previous){const travel=P.transfer(previous,item);if(travel===null||start<P.minutes(previous.time)+P.duration(previous)+travel+extra[pref.pace])continue;}
 const candidate={...item,...(pref.cruise?{cruise:pref.cruise}:{}),cartId:'ara-preview-'+item.id,date:pref.date,time,travelers:{adults:pref.adults,kids:pref.kids},guests:pref.adults+pref.kids};
 if(!P.valid(candidate)||!P.assess([...existing,...plan,candidate],bookings).ok)continue;
 if(locked.some(b=>P.transfer(candidate,b)===null||!P.duration(b)))continue;
 walk([...plan,candidate]);}
 }}walk([]);return {items:best,message:best.length?'':'I couldn’t fit matching experiences into this window around your existing plans. Try a longer day or another interest.'};
 }
 window.VoyaraARA={build};
 const form=document.querySelector('#ara-form');if(!form)return;
 const result=document.querySelector('#ara-result'),status=document.querySelector('#ara-status');let preview=null;
 const date=new Date();date.setDate(date.getDate()+1);form.elements.date.value=new Date(date.getTime()-date.getTimezoneOffset()*60000).toISOString().slice(0,10);form.elements.date.min=window.VoyaraBookings.today();
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const money=n=>'$'+n.toFixed(2);
 const snapshot=()=>JSON.stringify([P.pending(),window.VoyaraBookings.all(),window.VoyaraDemo?.owner?.()]);
 function preferences(){const f=new FormData(form),num=t=>{const [h,m]=String(t).split(':').map(Number);return h*60+m;};return {date:f.get('date'),start:num(f.get('start')),end:num(f.get('end')),adults:Number(f.get('adults')),kids:Number(f.get('kids')),pace:f.get('pace'),food:f.get('food'),interests:f.getAll('interest')};}
 form.addEventListener('input',()=>{if(preview){preview=null;result.innerHTML='';status.textContent='Preferences changed. Ask ARA to build a fresh day.';}});
 form.addEventListener('submit',e=>{e.preventDefault();const pref=preferences(),built=build(pref);if(!built.items.length){preview=null;result.innerHTML='';status.textContent=built.message;return;}
 preview={...built,pref,snapshot:snapshot()};status.textContent='Your suggested day is ready. Nothing has been added to your cart.';
 const food=window.VoyaraFood.gaps([...P.pending(),...built.items]).filter(g=>built.items.some(x=>x.cartId===g.a.cartId||x.cartId===g.b.cartId)).flatMap(g=>g.options.filter(o=>pref.food==='any'||(pref.food==='light'?['harbour-cafe','garden-deli']:['market-table','cable-kitchen','paradise-bistro']).includes(o.place.id)).slice(0,3));
 result.innerHTML=`<section class="plan-card"><p class="eyebrow">ARA’S PICK · ${esc(pref.date)}</p><h2>Your ${esc(pref.pace)} island adventure</h2><p>${built.items.length} experiences · ${clock(P.minutes(built.items[0].time))}–${clock(P.minutes(built.items.at(-1).time)+P.duration(built.items.at(-1)))}</p><ol class="ara-day">${built.items.map((x,i)=>`<li><img src="${esc(x.image)}" alt=""><div><small>${esc(x.time)}–${clock(P.minutes(x.time)+P.duration(x))}</small><h3>${esc(x.title)}</h3><p>${esc(x.category)} · ${esc(x.duration)}</p><a href="activity-detail.html?id=${encodeURIComponent(x.id)}" target="_blank" rel="noopener">View experience</a><strong>${money(P.amount(x))}</strong>${i?`<p class="ara-buffer">${P.transfer(built.items[i-1],x)} min estimated travel/arrival + ${extra[pref.pace]} min pace buffer</p>`:''}</div></li>`).join('')}</ol><h3>Room for a bite?</h3><p>${food.length?food.map(o=>esc(o.place.title)).join(' · ')+'. These demo options match your food preference and fit a gap. Compare and choose food stops in Review & plan.':'No matching food stop fits this schedule. You can edit experience times in Review & plan to make more room.'}</p><p>Dietary suitability is unverified. Food is optional and never reserved or charged here.</p><p class="plan-day-total">Experience subtotal <strong>${money(built.items.reduce((s,x)=>s+P.amount(x),0))}</strong></p><p>Service fee is calculated in the combined cart. Existing cart items stay in place. This preview uses demo time slots, not confirmed availability.</p><button class="plan-button" id="ara-add" type="button">Add this day to my plan</button></section>`;
 result.querySelector('#ara-add').onclick=()=>{if(!preview)return;if(preview.snapshot!==snapshot()){status.textContent='Your cart or bookings changed. Build a new day to check the latest schedule.';return;}const items=preview.items.map(x=>({...x,cartId:crypto.randomUUID(),source:'ara'}));if(!P.assess([...P.pending(),...items]).ok){status.textContent='This plan no longer fits. Build a fresh suggestion.';return;}try{P.store().setItem('voyara-trip-cart-v1',JSON.stringify([...P.pending(),...items]));preview=null;location.href='trip-review.html';}catch{status.textContent='Could not save your plan. Your cart has not been changed. Please try again.';}};
 result.scrollIntoView({behavior:'smooth',block:'start'});
 });
})();
