// Explicit local test setup; only runs from the requested preview URL.
(() => {
 if(!window.VoyaraDemo?.enabled||new URLSearchParams(location.search).get('foodDemo')!=='1')return;
 const store=window.VoyaraStore||localStorage;
 try {
 const old=store.getItem('voyara-trip-cart-v1')||'[]';
 store.setItem('voyara-food-demo-cart-backup',old);
 const day=new Date();day.setDate(day.getDate()+1);const date=new Date(day.getTime()-day.getTimezoneOffset()*60000).toISOString().slice(0,10);
 const common={date,travelers:{adults:2,kids:0},guests:2,location:'Nassau, The Bahamas',meeting:'Nassau Harbour'};
 store.setItem('voyara-trip-cart-v1',JSON.stringify([
 {...common,cartId:crypto.randomUUID(),id:'nassau-city',title:'Nassau Highlights & Tastings',category:'Culture & food',time:'9:30 AM',duration:'2.5 hours',price:59,image:'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=800&q=85'},
 {...common,cartId:crypto.randomUUID(),id:'sunset-sail',title:'Small-Group Sunset Sail',category:'Sailing',time:'3:00 PM',duration:'2.5 hours',price:72,image:'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=800&q=85'}
 ]));
 history.replaceState(null,'','trip-review.html#food-recommendations');
 }catch {document.querySelector('#plan-error').textContent='Could not set up the local food demo. Please try again.';}
})();
