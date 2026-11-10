(() => {
  const back=document.querySelector('.community-detail-back');
  if(new URLSearchParams(location.search).get('from')==='voyagers'||document.referrer.includes('/voyagers.html')){
    back.href=location.pathname.includes('rose-island')?'voyagers.html#voyage-voyager-post-rose':location.pathname.includes('nassau-food')?'voyagers.html#voyage-voyager-post-conch':'voyagers.html';back.textContent='Back to Voyagers';
  }
  if(new URLSearchParams(location.search).get('from')==='trending'){back.href='events.html';back.textContent='Back to Trending';}
  const tabs=[...document.querySelectorAll('[role=tab]')];
  function select(tab){tabs.forEach(t=>{const active=t===tab;t.setAttribute('aria-selected',active);t.tabIndex=active?0:-1;document.getElementById(t.getAttribute('aria-controls')).hidden=!active;});}
  tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>select(tab));tab.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const n=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;select(tabs[n]);tabs[n].focus();});});
  if(location.hash.startsWith('#place-'))select(tabs[1]);
  const hero=document.querySelector('.community-detail-hero');
  const cover=hero.style.backgroundImage.match(/url\(["']?(.*?)["']?\)$/)?.[1];
  const images=[...new Set([cover,...[...document.querySelectorAll('.detail-place img')].map(img=>img.src)])].filter(Boolean);
  let index=0;
  const controls=document.createElement('div');controls.className='detail-gallery-controls';controls.setAttribute('role','group');controls.setAttribute('aria-label','Choose a photo');
  const dots=images.map((image,i)=>{const button=document.createElement('button');button.type='button';button.setAttribute('aria-label',`Show photo ${i+1} of ${images.length}`);button.addEventListener('click',()=>show(i));controls.append(button);return button;});
  hero.append(controls);hero.setAttribute('aria-roledescription','carousel');hero.setAttribute('aria-label','Route photo gallery');
  function show(n){index=(n+images.length)%images.length;hero.style.backgroundImage=`url("${images[index]}")`;dots.forEach((dot,i)=>dot.setAttribute('aria-pressed',String(i===index)));}
  controls.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();show(index+(e.key==='ArrowRight'?1:-1));dots[index].focus();}});
  let start;hero.addEventListener('touchstart',e=>{start=e.changedTouches[0].clientX;},{passive:true});hero.addEventListener('touchend',e=>{if(start==null)return;const dx=e.changedTouches[0].clientX-start;if(Math.abs(dx)>60)show(index+(dx<0?1:-1));start=null;},{passive:true});show(0);
})();
