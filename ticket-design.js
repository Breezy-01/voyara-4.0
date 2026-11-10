(() => { if (window.voyaraTicketMissing) return;
(() => {
  let confirmation;
  try { confirmation = window.voyaraSelectedTicket || JSON.parse((window.VoyaraStore || localStorage).getItem('voyara-latest-confirmation') || 'null'); } catch {}
  const item = confirmation?.item || {};
  if (new URLSearchParams(location.search).get('print-preview') === '1') document.querySelector('#ticket-print-styles').media = 'all';
  document.querySelector('#ticket-meeting').textContent = item.meeting || (item.id === 'turtle-cove' ? 'Paradise Island Ferry Terminal, Dock B' : 'Confirm the meeting point with your activity partner.');
  const meeting = document.querySelector('#ticket-meeting').textContent;
  const map = document.querySelector('#ticket-map');
  if ((item.meeting && !/^Confirm /i.test(item.meeting)) || item.id === 'turtle-cove') map.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(meeting + ', ' + (item.location || 'The Bahamas'))}`;
  else map.hidden = true;
  const guests = item.travelers || {adults:item.guests || 2,kids:0};
  document.querySelector('#ticket-guests').textContent = `${guests.adults} adult${guests.adults === 1 ? '' : 's'}${guests.kids ? ` · ${guests.kids} ${guests.kids === 1 ? 'child' : 'children'}` : ''}`;
  const rawDate = document.querySelector('#ticket-date').textContent;
  if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) document.querySelector('#ticket-date').textContent = new Intl.DateTimeFormat('en-US',{weekday:'short',month:'long',day:'numeric',year:'numeric'}).format(new Date(rawDate+'T12:00:00'));
  document.querySelector('#print-ticket').addEventListener('click', () => window.print());
  document.querySelectorAll('[data-wallet]').forEach(button => button.addEventListener('click', () => { document.querySelector('#wallet-status').textContent = `${button.dataset.wallet} preview: a real pass cannot be added yet. Use Print / save PDF to keep a copy of this sample ticket.`; }));
  const dialog = document.querySelector('#ticket-share-dialog');
  document.querySelector('#share-ticket').addEventListener('click', () => {
    document.querySelector('#voyage-caption').value = `Looking forward to ${document.querySelector('#ticket-title').textContent}!`;
    dialog.showModal();
  });
  document.querySelector('#close-ticket-share').addEventListener('click', () => dialog.close());
  document.querySelector('#continue-voyage').addEventListener('click', () => {
    sessionStorage.setItem('voyara-ticket-share-draft', JSON.stringify({caption:document.querySelector('#voyage-caption').value,location:item.location || ''}));
    location.href = 'voyagers.html?compose=ticket';
  });
})();

})();
