(() => {
 const read=key=>{try{return JSON.parse((window.VoyaraStore || localStorage).getItem(key)||'null');}catch{return null;}};
 function render() {
 const card=document.querySelector('#hero-voyage');
 card.hidden=true;document.querySelector('.hero-content').classList.remove('has-voyage');
 const user=window.VoyaraAuth?.getUser?.();
 if(!window.VoyaraAuth?.isAuthenticated?.() || !user?.email)return;
 const items=window.VoyaraBookings.all().filter(x=>x?.item?.date&&window.VoyaraBookings.status(x)==='upcoming');
 const today=new Date();today.setHours(0,0,0,0);
 const next=items.filter(x=>(x.accountId===user.id || x.customer?.email?.toLowerCase()===user.email.toLowerCase()) && new Date(x.item.date+'T23:59:59')>=today).sort((a,b)=>a.item.date.localeCompare(b.item.date))[0];
 if(!next)return;
 card.hidden=false;document.querySelector('.hero-content').classList.add('has-voyage');
 document.querySelector('#hero-voyage-title').textContent=next.item.title;
 document.querySelector('#hero-voyage-date').textContent=new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric'}).format(new Date(next.item.date+'T12:00:00'))+' · '+(next.item.time||'Time to be confirmed')+' · Sample booking';
 document.querySelector('#hero-voyage-link').href='booking-confirmation.html?booking='+encodeURIComponent(next.number);
 }
 window.addEventListener('voyara:auth-ready',render);
 window.addEventListener('voyara:auth-change',render);
 window.addEventListener('storage',render);
 window.addEventListener('voyara:collections-change',render);
 window.addEventListener('pageshow',render);
 render();
})();
