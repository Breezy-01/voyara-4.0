(() => {
  const track = document.querySelector("#profile-favorites-track");
  const count = document.querySelector("#profile-favorite-count");
  const readFavorites = () => { try { const items = JSON.parse((window.VoyaraStore || localStorage).getItem("voyara-favorites-v1") || "[]"); return Array.isArray(items) ? (window.VoyaraResolveFavorites||((items)=>items))(items) : []; } catch { return []; } };
  const renderFavorites = () => {
    const items = readFavorites();
    if (count) count.textContent = `${items.length} saved`;
    if (!track) return;
    if (!items.length) { track.innerHTML = `<div class="profile-favorites-empty"><strong>No favourites yet.</strong> <a href="things-to-do.html">Explore experiences</a></div>`; return; }
    track.replaceChildren();
    items.filter(item=>item&&typeof item.title==='string').forEach(item=>{
      const link=document.createElement('a'),cover=document.createElement('div'),tag=document.createElement('span'),section=document.createElement('section'),small=document.createElement('small'),title=document.createElement('h3'),copy=document.createElement('p');
      link.className='profile-experience-card';link.href=item.link||'favorites.html';cover.style.backgroundImage='url('+JSON.stringify(item.image||'assets/voyara-hero-v2.png')+')';tag.textContent=item.type||'FAVOURITE';small.textContent='Saved for your next trip';title.textContent=item.title;copy.textContent='View favourite';cover.append(tag);section.append(small,title,copy);link.append(cover,section);track.append(link);
    });
  };
  document.querySelectorAll("[data-profile-carousel]").forEach((carousel) => {
    const track = carousel.querySelector(".profile-card-track");
    carousel.querySelectorAll("[data-slide]").forEach((button) => button.addEventListener("click", () => track?.scrollBy({ left: Number(button.dataset.slide) * 532, behavior: "smooth" })));
  });
  const renderIdentity = () => {
    const user = window.VoyaraAuth?.getUser?.();
    if (user?.is_demo) {
      const name = document.querySelector('.profile-person h1');
      if (name) name.textContent = 'User’s Voyara';
      const photo = document.querySelector('.profile-person img');
      if (photo) { photo.alt = 'User demo avatar'; photo.src = 'assets/demo-user-avatar.svg'; }
    } else {
      const name = document.querySelector('.profile-person h1');
      if (name) name.textContent = 'Your Voyara';
    }
  };
  window.addEventListener('voyara:auth-ready', renderIdentity);
  window.addEventListener('voyara:auth-change', renderIdentity);
  renderIdentity();
  window.addEventListener('voyara:auth-change', renderFavorites);
  window.addEventListener('voyara:collections-change', renderFavorites);
  window.addEventListener('storage', renderFavorites);
  window.addEventListener('pageshow', renderFavorites);
  renderFavorites();
})();
