// Shared identity and browser-local collections for the Islandly demo.
(() => {
  const enabled = true; // Standalone design preview: browser-local demo on every host.
  const sessionKey = 'voyara-islandly-demo-session';
  const ownedKeys = new Set(['voyara-business-state','voyara-business-mode','voyara-food-demo-cart-backup','voyara-food-plan-v1','voyara-trip-cart-v1','voyara-favorites-v1','voyara-bookings-v1','voyara-latest-confirmation','voyara-booking-draft','voyara-social-interactions','voyara-community-posts','voyara-creator-follows','voyara-profile-preview']);
  const user = () => {
    try {
      if(enabled && (localStorage.getItem(sessionKey)==='Business'||sessionStorage.getItem(sessionKey)==='Business')) return {id:'islandly-demo-business',email:'business@voyara.local',user_metadata:{display_name:'Business',account_type:'business'},is_demo:true};
      if (enabled && (localStorage.getItem(sessionKey) === 'User' || sessionStorage.getItem(sessionKey) === 'User'))
        return {id:'islandly-demo-user',email:'user@voyara.local',user_metadata:{display_name:'User',account_type:'customer'},is_demo:true};
    } catch {}
    return null;
  };
  const owner = () => user()?.id || 'guest';
  const keyFor = key => enabled && ownedKeys.has(key) && user() ? `voyara-islandly:${owner()}:${key}` : key;
  window.VoyaraDemo = {enabled,getUser:user,owner};
  window.VoyaraStore = {
    getItem: key => localStorage.getItem(keyFor(key)),
    setItem: (key,value) => {localStorage.setItem(keyFor(key),value);window.dispatchEvent(new CustomEvent('voyara:collections-change',{detail:{key}}));},
    removeItem: key => {localStorage.removeItem(keyFor(key));window.dispatchEvent(new CustomEvent('voyara:collections-change',{detail:{key}}));}
  };
  // Saved post cards derive current captions and archive destinations without copying post data.
  window.VoyaraResolveFavorites=items=>{
    let posts=[];try{const value=JSON.parse(window.VoyaraStore.getItem('voyara-community-posts')||'[]');if(Array.isArray(value))posts=value;}catch{}
    return items.filter(item=>item&&typeof item==='object').map(item=>{const post=posts.find(p=>p&&p.id===item.id);return post?{...item,title:(post.archived?'Archived · ':'')+(post.author||'Voyager')+' '+post.caption,link:post.archived?'voyager-profile.html#archive':'voyagers.html#voyage-'+post.id.replace(/[^a-z0-9-]/gi,'-'),image:post.image,type:post.archived?'Archived voyage':'Voyage'}:item;});
  };
  const initialOwner = owner();
  const refreshPrivatePage = () => {
    if (owner() !== initialOwner && /\/(booking|booking-confirmation)\.html$/.test(location.pathname)) location.reload();
  };
  window.addEventListener('storage',event=>{if(event.key===sessionKey||event.key===null)refreshPrivatePage();});
  window.addEventListener('pageshow',refreshPrivatePage);
})();
