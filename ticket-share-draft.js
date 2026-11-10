(() => {
  if (new URLSearchParams(location.search).get('compose') !== 'ticket') return;
  let draft; try {draft = JSON.parse(sessionStorage.getItem('voyara-ticket-share-draft') || 'null');} catch {}
  const form = document.querySelector('#create-post-form'), modal = document.querySelector('#create-post-modal');
  if (!draft || !form || !modal) return;
  form.elements.caption.value = draft.caption || '';
  form.elements.location.value = draft.location || '';
  modal.classList.add('open');
  form.elements.caption.focus();
  sessionStorage.removeItem('voyara-ticket-share-draft');
})();
