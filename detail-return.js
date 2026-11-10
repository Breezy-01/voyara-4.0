(() => {
  const raw=new URLSearchParams(location.search).get('returnTo');
  if(!raw)return;
  try{
    const target=new URL(raw,location.href),expected=new URL('things-to-do.html',location.href);
    if(target.origin!==expected.origin||target.pathname!==expected.pathname||target.username||target.password)return;
    const link=document.querySelector('.detail-back');if(link){link.href=target.href;link.textContent='Back to search results';}
  }catch{}
})();
