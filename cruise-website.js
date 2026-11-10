const CRUISE_BUFFER_MINUTES = 90;
const cruiseActivities = [
  {id:"turtle-cove",title:"Turtle Cove Reef Cruise",port:"Nassau",start:"09:30",duration:210,price:145,image:"https://images.unsplash.com/photo-1544550285-f813152fb2fd?auto=format&fit=crop&w=900&q=82"},
  {id:"nassau-city",title:"Nassau Highlights Tour",port:"Nassau",start:"10:00",duration:150,price:59,image:"https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=900&q=82"},
  {id:"chef-table",title:"Island Chef’s Table",port:"Nassau",start:"12:30",duration:120,price:85,image:"https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=88"},
  {id:"ocean-spa",title:"Oceanfront Spa Ritual",port:"Nassau",start:"11:00",duration:90,price:160,image:"https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=82"},
  {id:"rose-island-sail",title:"Private Golden-Hour Sail to Rose Island",port:"Nassau",start:"13:00",duration:270,price:185,image:"https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=900&q=82"},
  {id:"exuma-cays",title:"Exuma Cays & Swimming Pigs",port:"Exuma",start:"08:30",duration:480,price:235,image:"https://images.pexels.com/photos/30029771/pexels-photo-30029771.jpeg?auto=compress&cs=tinysrgb&w=1400"},
];
const cruiseForm=document.querySelector("#website-cruise-form");
const dateInput=cruiseForm?.elements.date;
cruiseForm?.addEventListener('input', () => cruiseForm.elements.depart.setCustomValidity(''));
cruiseForm?.addEventListener('change', () => cruiseForm.elements.depart.setCustomValidity(''));
if(dateInput&&!dateInput.value){const tomorrow=new Date(Date.now()+86400000);dateInput.value=`${tomorrow.getFullYear()}-${String(tomorrow.getMonth()+1).padStart(2,"0")}-${String(tomorrow.getDate()).padStart(2,"0")}`;dateInput.min=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10)}
const toMinutes=value=>{const [h,m]=value.split(":").map(Number);return h*60+m};
const timeLabel=minutes=>{const h=Math.floor(minutes/60),m=minutes%60,period=h>=12?"PM":"AM";return `${h%12||12}:${String(m).padStart(2,"0")} ${period}`};
const durationLabel=minutes=>minutes%60?`${Math.floor(minutes/60)}h ${minutes%60}m`:`${minutes/60} hours`;
cruiseForm?.addEventListener("submit",event=>{
  event.preventDefault();
  const data=new FormData(cruiseForm),port=data.get("port"),arrive=toMinutes(data.get("arrive")),depart=toMinutes(data.get("depart"));
  if(depart<=arrive+CRUISE_BUFFER_MINUTES){cruiseForm.elements.depart.setCustomValidity("Choose a departure time at least 90 minutes after arrival.");cruiseForm.reportValidity();return}
  cruiseForm.elements.depart.setCustomValidity("");
  const fits=cruiseActivities.filter(item=>item.port===port&&toMinutes(item.start)>=arrive&&toMinutes(item.start)+item.duration+CRUISE_BUFFER_MINUTES<=depart);
  document.querySelector("#cruise-empty").hidden=true;
  const results=document.querySelector("#cruise-results");results.hidden=false;
  document.querySelector("#cruise-window-title").textContent=`${timeLabel(arrive)} – ${timeLabel(depart)}`;
  document.querySelector("#cruise-window-copy").textContent=`Experiences in ${port} with your 90-minute ship buffer included.`;
  document.querySelector("#cruise-result-count").textContent=`${fits.length} ${fits.length===1?"experience":"experiences"}`;
  document.querySelector("#cruise-result-list").innerHTML=fits.length?fits.map(item=>{const back=toMinutes(item.start)+item.duration;return `<a class="cruise-result-card" href="activity-detail.html?id=${item.id}&date=${encodeURIComponent(data.get("date"))}&time=${encodeURIComponent(timeLabel(toMinutes(item.start)))}"><span class="cruise-result-image" style="background-image:url('${item.image}')"></span><span class="cruise-result-copy"><span class="cruise-fit-pill">✓ FITS · BACK BY ${timeLabel(back)}</span><h3>${item.title}</h3><p>Departs ${timeLabel(toMinutes(item.start))} · ${durationLabel(item.duration)}</p><footer><strong>From $${item.price}</strong><span>View experience</span></footer></span></a>`}).join(""):`<div class="cruise-no-results"><strong>No activities fit this window</strong><span>Try a wider port time or another port day.</span></div>`;
  results.scrollIntoView({behavior:"smooth",block:"start"});
});
