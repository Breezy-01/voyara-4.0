(() => {
 const search=document.querySelector('#voyager-search'),tabs=[...document.querySelectorAll('[data-voyager-topic]')];let topic='all';
 const patterns={exumas:/\bexumas?\b/,family:/\bfamily(?:trip)?\b|\bchildren\b|\bkids\b/,water:/snorkel|diving|reef|boat|sandbar/,food:/food|conch|restaurant|tasting|eats/};
 window.filterVoyagersDesign=()=>{
  const query=search.value.trim().toLowerCase().replace(/#/g,'');const words=query.split(/\s+/).filter(Boolean);let count=0;
  document.querySelectorAll('[data-social-post]').forEach(item=>{
   const text=((item.dataset.searchable||'')+' '+(item.querySelector('.social-post-head')?.textContent||'')+' '+(item.querySelector('.social-post-copy > p')?.textContent||'')+' '+(item.querySelector('.post-chips')?.textContent||'')).toLowerCase();
   const show=item.dataset.archived!=='true'&&(topic==='all'||patterns[topic].test(text))&&words.every(word=>text.includes(word));
   item.classList.toggle('hidden-post',!show);if(show)count++;
  });
  document.querySelector('#voyager-match-count').textContent=`${count} ${count===1?'voyage':'voyages'}`;
  document.querySelector('#voyager-empty').hidden=count!==0;
  document.querySelector('.voyager-ads').hidden=topic!=='all'||!!query;
  document.querySelector('#reset-voyager-search').hidden=topic==='all'&&!query;
  tabs.forEach(tab=>{const active=tab.dataset.voyagerTopic===topic;tab.classList.toggle('active',active);tab.setAttribute('aria-pressed',active);});
 };
 tabs.forEach(tab=>tab.addEventListener('click',()=>{topic=tab.dataset.voyagerTopic;window.filterVoyagersDesign();}));
 const reset=()=>{topic='all';search.value='';window.filterVoyagersDesign();};
 document.querySelector('#reset-voyager-search').addEventListener('click',reset);document.querySelector('#reset-empty-voyagers').addEventListener('click',()=>{reset();search.focus();});
 window.filterVoyagersDesign();
})();
