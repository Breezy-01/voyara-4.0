(() => {
  const id = new URLSearchParams(location.search).get('booking');
  let latest;
  try { latest=JSON.parse((window.VoyaraStore||localStorage).getItem('voyara-latest-confirmation')||'null'); } catch {}
  const selected=window.VoyaraBookings.all().find(record=>record.number===(id||latest?.number));
  if(selected?.item&&typeof selected.item.title==='string')window.voyaraSelectedTicket=selected;
  else window.voyaraTicketMissing=true;
})();
