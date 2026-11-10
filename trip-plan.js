(() => {
 const store=()=>window.VoyaraStore||localStorage;
 const read=(k,f)=>{try{return JSON.parse(store().getItem(k)||'null')??f;}catch{return f;}};
 const minutes=t=>{const m=/^(\d{1,2}):(\d{2}) (AM|PM)$/.exec(t||'');return m&&+m[1]>=1&&+m[1]<=12&&+m[2]<60?(+m[1]%12)*60+(m[3]==='PM'?720:0)+ +m[2]:1440;};
 const amount=x=>Number(x.price)*Number(x.travelers?.adults||1)+Number(x.childPrice??Math.round(Number(x.price)*.66))*Number(x.travelers?.kids||0);
 const sorted=a=>[...a].sort((a,b)=>String(a.date||'').localeCompare(String(b.date||''))||minutes(a.time)-minutes(b.time));
 const calendarDate=d=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(d||''))return false;const t=new Date(d+'T12:00:00Z');return Number.isFinite(t.getTime())&&t.toISOString().slice(0,10)===d;};
 const valid=x=>x&&x.cartId&&x.id&&x.title&&calendarDate(x.date)&&x.date>=window.VoyaraBookings.today()&&minutes(x.time)<1440&&Number.isFinite(Number(x.price))&&Number(x.price)>0&&Number.isFinite(amount(x))&&Number.isInteger(x.travelers?.adults)&&x.travelers.adults>0&&Number.isInteger(x.travelers?.kids)&&x.travelers.kids>=0;
 const cart=()=>{const value=read('voyara-trip-cart-v1',[]);return Array.isArray(value)?value.filter(x=>x?.cartId&&!x.number&&!x.cancelledAt&&!x.status):[];};
 const completed=x=>window.VoyaraBookings.all().some(b=>b.cartItemId===x.cartId);
 const pending=()=>sorted(cart().filter(x=>!completed(x)));

 // Local planning assumptions, not routing-provider or availability data.
 const duration=x=>{const text=String(x.duration||'').toLowerCase();if(text==='full day')return 480;let n=0,found=false;for(const m of text.matchAll(/(\d+(?:\.\d+)?)\s*(hours?|hrs?|minutes?|mins?)/g)){n+=Number(m[1])*(m[2].startsWith('h')?60:1);found=true;}return found&&n>0?n:null;};
 const zone=x=>{const text=String(x.meeting||x.location||'').toLowerCase();if(/eleuthera|governor/.test(text))return 'eleuthera';if(/exuma|george town/.test(text))return 'exuma';if(/rose island/.test(text))return 'rose';if(/cable beach/.test(text))return 'cable';if(/paradise/.test(text))return 'paradise';if(/nassau|rawson|pompey/.test(text))return 'nassau';return null;};
 const transfer=(a,b)=>{const x=zone(a),y=zone(b);if(!x||!y)return null;if(x===y)return 25;if(['cable','paradise','nassau'].includes(x)&&['cable','paradise','nassau'].includes(y))return x==='cable'&&y==='paradise'||x==='paradise'&&y==='cable'?60:45;return null;};
 const stamp=x=>/^\d{4}-\d{2}-\d{2}$/.test(x.date)&&minutes(x.time)<1440?Date.parse(x.date+'T00:00:00Z')/60000+minutes(x.time):NaN;
 function assess(items=pending(),bookings=window.VoyaraBookings.all()){
 const issues=[],notes=[],entries=[...items.map(x=>({...x,planned:true})),...bookings.filter(b=>window.VoyaraBookings.status(b)==='upcoming').map(b=>({...b.item,booked:true}))].sort((a,b)=>stamp(a)-stamp(b));
 for(const x of items){if(!valid(x))issues.push({type:'invalid',text:`${x.title}: update its date, time or travelers before checkout.`});if(!duration(x))notes.push(`${x.title}: duration is unknown; its full schedule cannot be checked.`);if(x.duration==='Full day')notes.push(`${x.title}: “Full day” reserves 8 hours for this local planning preview.`);}
 // Cruise constraints travel with each item through edits, rescheduling and checkout.
 for(const x of items.filter(x=>x.cruise)){
 const c=x.cruise,port={meeting:'Nassau cruise port'},out=transfer(port,x),back=transfer(x,port),d=duration(x),start=minutes(x.time);
 if(Number.isFinite(c.returnBy))notes.push(`Cruise visit ${c.date}: return to Nassau port by ${String(Math.floor(c.returnBy/60)).padStart(2,'0')}:${String(c.returnBy%60).padStart(2,'0')} local time. Cruise selections must stay on this date and include return travel. Estimates only.`);
 if(c.port!=='nassau'||!calendarDate(c.date)||!Number.isFinite(c.ready)||!Number.isFinite(c.returnBy)||c.ready<0||c.returnBy>1440||c.returnBy<=c.ready||x.date!==c.date||out===null||back===null||!d||start<c.ready+out||start+d+back>c.returnBy)issues.push({type:'cruise',text:`${x.title}: does not fit its cruise visit, including travel to and from port. Choose a time within your port window or remove it.`});
 }
 for(let i=0;i<entries.length;i++)for(let j=i+1;j<entries.length;j++){
 const a=entries[i],b=entries[j];if(!a.planned&&!b.planned)continue;const start=stamp(a),next=stamp(b),d=duration(a);if(!Number.isFinite(start)||!Number.isFinite(next))continue;
 const pair=`${a.title}${a.booked?' (already booked)':''} → ${b.title}${b.booked?' (already booked)':''}`;
 if(d&&next<start+d){issues.push({type:'overlap',text:`${pair}: overlaps by ${Math.ceil(Math.min(start+d-next,duration(b)||start+d-next))} minutes. Change a time, move one to another day, or remove a cart selection.`});continue;}
 if(a.date!==b.date&&(!d||next-start-d>=180))continue;
 const travel=transfer(a,b);if(travel===null){notes.push(`${pair}: transfer time is unverified. Check transport between these meeting points, especially for different islands.`);continue;}
 if(d&&next-start-d<travel)issues.push({type:'travel',text:`${pair}: only ${Math.max(0,next-start-d)} minutes between experiences. Allow ${travel} minutes using our local travel estimate, including a 15-minute arrival buffer.`});
 }
 return {issues,notes:[...new Set(notes)],ok:!issues.length};
 }

 const fixed=x=>x.kind==='event'||x.fixedTime===true;
 const demoSlots=x=>['9:30 AM','11:00 AM','1:30 PM','3:00 PM'].filter(t=>minutes(t)+duration(x)<=20*60);
 function suggest(items=pending(),bookings=window.VoyaraBookings.all(),allowOtherDays=false){
 const original=sorted(items),snapshot=JSON.stringify(items),bookingSnapshot=JSON.stringify(bookings);
 const fail=message=>({ok:false,message});
 if(!original.length)return fail('Add experiences to your cart first.');
 if(!original.every(valid))return fail('Update missing or past dates and traveler details first.');
 const locked=bookings.filter(b=>window.VoyaraBookings.status(b)==='upcoming').map(b=>b.item);
 if([...original,...locked].some(x=>!duration(x)||!zone(x)))return fail('Some durations or meeting points are unknown. Review these manually before requesting a schedule.');
 for(let i=0;i<original.length;i++)for(const b of [...original.slice(i+1),...locked])if(transfer(original[i],b)===null)return fail('Transport between these areas is unverified. Choose dates and transfers manually; we cannot safely suggest this route yet.');
 const result=original.filter(fixed).map(x=>({...x}));
 if(!assess(result,bookings).ok)return fail('Fixed-time events conflict with each other or a booked trip. Edit those selections manually.');
 let last=-Infinity;
 for(const item of original){
 if(fixed(item))continue;
 let chosen=null;
 for(let day=0;day<(allowOtherDays?7:1)&&!chosen;day++){
 const date=new Date(item.date+'T12:00:00Z');date.setUTCDate(date.getUTCDate()+day);const nextDate=date.toISOString().slice(0,10);
 const slots=demoSlots(item);if(day===0&&slots.includes(item.time)){slots.splice(slots.indexOf(item.time),1);slots.unshift(item.time);}
 for(const time of slots){const candidate={...item,date:nextDate,time};if(stamp(candidate)<last)continue;if(assess([...result,candidate],bookings).ok){chosen=candidate;break;}}
 }
 if(!chosen)return fail(allowOtherDays?'No schedule was found within seven days using the demo slots. Try another order or adjust your dates manually.':'These experiences cannot fit on the selected days using the demo slots. Edit your times, or opt in to suggestions on other days.');
 result.push(chosen);last=stamp(chosen);
 }
 const proposed=sorted(result),changes=proposed.filter(x=>{const old=original.find(o=>o.cartId===x.cartId);return old.date!==x.date||old.time!==x.time;}).map(x=>({before:original.find(o=>o.cartId===x.cartId),after:x}));
 return {ok:true,items:proposed,changes,snapshot,bookingSnapshot};
 }
 function applySuggestion(proposal){
 if(!proposal?.ok)throw new Error('Request a new schedule first.');
 if(JSON.stringify(pending())!==proposal.snapshot||JSON.stringify(window.VoyaraBookings.all())!==proposal.bookingSnapshot)throw new Error('Your cart or bookings changed. Request a fresh suggestion.');
 if(!assess(proposal.items).ok)throw new Error('The proposed schedule no longer passes the checks. Request a fresh suggestion.');
 const updates=new Map(proposal.items.map(x=>[x.cartId,x]));store().setItem('voyara-trip-cart-v1',JSON.stringify(cart().map(x=>updates.get(x.cartId)||x)));
 }
 function checkout(){const items=pending();if(!items.length)return;if(!assess(items).ok){alert('Your plan has schedule conflicts. Review the highlighted selections first.');location.href='trip-review.html';return;}if(!items.every(valid)){alert('Please edit selections with missing or past dates before checkout.');return;}if(items.length===1){store().setItem('voyara-booking-draft',JSON.stringify({...items[0],fromCart:true}));location.href='booking.html';}else location.href='booking.html?cart=1';}
 window.VoyaraPlan={store,read,minutes,amount,sorted,valid,pending,checkout,duration,transfer,assess,suggest,applySuggestion};
})();
