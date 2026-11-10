// Move existing DOM nodes: their listeners, state and accessible names survive.
(() => {
  const details = {
    'voyager-post-rose': ['Rose Island boat day', 'Rose Island · On the water', 'rose-island-itinerary.html?from=voyagers', 'View itinerary'],
    'voyager-post-conch': ['A taste of Nassau', 'Arawak Cay · Local food', 'nassau-food-guide.html?from=voyagers', 'View guide'],
    'voyager-post-sunset': ['Golden hour at Cable Beach', 'Cable Beach · Beach & sunset', 'things-to-do.html?q=beach', 'Explore beach days']
  };
  document.querySelectorAll('[data-social-post]').forEach(post => {
    const copy = post.querySelector('.social-post-copy');
    const actions = post.querySelector('.social-post-actions');
    if (!copy || !actions) return;
    const detail = details[post.dataset.postId];
    if (detail) {
      const title = document.createElement('h2');
      title.className = 'voyage-tile-title';
      const titleLink = document.createElement('a'); titleLink.href = detail[2]; titleLink.textContent = detail[0]; title.append(titleLink);
      const location = document.createElement('span');
      location.className = 'voyage-tile-location'; location.textContent = detail[1];
      copy.prepend(title, location);
      const end = document.createElement('div'); end.className = 'voyage-tile-end';
      const save = actions.querySelector('.social-save'); if (save) end.append(save);
      const link = document.createElement('a'); link.className = 'voyage-tile-link';
      link.href = detail[2]; link.textContent = detail[3]; end.append(link); actions.append(end);
    }
    const like = actions.querySelector('.social-like'), count = copy.querySelector('.like-count');
    if (like && count) like.after(count);
    // Keep keyboard order consistent with the visual card order.
    copy.after(actions);
  });
})();
