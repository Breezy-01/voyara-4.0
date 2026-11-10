(() => {
  if(window.voyaraTicketMissing)return;
  const $=selector=>document.querySelector(selector), api=window.VoyaraBookings;
  const number=window.voyaraSelectedTicket.number, dialog=$('#manage-dialog');
  let action,expected,owner;
  const get=()=>api.all().find(record=>record.number===number);
  const dateLabel=value=>/^\d{4}-\d{2}-\d{2}$/.test(value||'')?new Intl.DateTimeFormat('en-US',{weekday:'short',month:'long',day:'numeric',year:'numeric'}).format(new Date(value+'T12:00:00')):'Date to be confirmed';
  function render() {
    const booking=get();if(!booking){location.reload();return;}
    window.voyaraSelectedTicket=booking;
    const status=api.status(booking),cancelled=status==='cancelled',upcoming=status==='upcoming';
    document.title=(cancelled?'Cancelled booking':status==='past'?'Past booking':'Your booking')+' | Voyara';
    $('.confirmation-top .eyebrow').textContent=status.toUpperCase()+' · SAMPLE BOOKING';
    $('.confirmation-top h1').textContent=cancelled?'Your sample booking is cancelled.':status==='past'?'Your island memories, all in one place.':'Your island day, all in one place.';
    $('.confirmation-top > p:not(.eyebrow)').textContent=cancelled?'This record is saved for reference. No payment was taken and no refund is due.':status==='past'?'Keep this sample booking for your travel records.':'Review your plans or manage your sample booking below.';
    $('#ticket-date').textContent=dateLabel(booking.item.date);
    $('#booking-status').textContent=status[0].toUpperCase()+status.slice(1)+' · '+booking.number;
    $('#reschedule-booking').hidden=!upcoming||booking.item.kind==='event';$('#cancel-booking').hidden=!upcoming;
    $('#booking-change-note').textContent=cancelled?'Cancelled bookings cannot be rescheduled. You can make a new sample booking from Discover.':!upcoming?'Past bookings are kept for reference and cannot be changed.':booking.item.kind==='event'?'This event has a fixed date. You can cancel this sample booking, but cannot move the event.':'Rescheduling changes the date only. Your time, guests, add-ons and sample total stay the same. Host availability is not connected.';
    if(cancelled&&$('#ticket-share-dialog').open)$('#ticket-share-dialog').close();
    $('.ticket-entry').hidden=cancelled;$('.ticket-wallet').hidden=cancelled;$('#share-ticket').hidden=cancelled;
    $('.ticket .eyebrow').textContent=cancelled?'VOYARA · CANCELLED SAMPLE TICKET':'VOYARA · SAMPLE TICKET';
    const details=$('#booking-extra-details');details.replaceChildren();
    const add=(label,value)=>{const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;row.append(dt,dd);details.append(row);};
    add('Booked for',booking.customer?.name||'Guest');add('Contact',booking.customer?.email||'Not provided');
    add('Add-ons',booking.addons?.length?booking.addons.map(x=>`${x.name} ($${x.price})`).join(', '):'None');
    add('Sample total','$'+Number(booking.total).toLocaleString('en-US'));
    const changes=booking.changes||[];const last=changes[changes.length-1];
    if(last)add('Latest change',last.action==='cancel'?'Cancelled on '+new Date(last.at).toLocaleDateString('en-US'):'Rescheduled from '+dateLabel(last.from)+' to '+dateLabel(last.to));
  }
  function open(kind){const booking=get();if(!booking)return;action=kind;expected=api.version(booking);owner=window.VoyaraDemo?.owner();$('#manage-error').hidden=true;$('#management-result').textContent='';
    $('#manage-dialog-title').textContent=kind==='cancel'?'Cancel this sample booking?':'Choose your new date';
    $('#manage-explanation').textContent=kind==='cancel'?`${booking.item.title} on ${dateLabel(booking.item.date)} will move to Cancelled. This keeps the record and cannot be undone here. No real reservation or payment is affected.`:`Reschedule ${booking.item.title}. The start time remains ${booking.item.time}. No real reservation is changed.`;
    $('#reschedule-field').hidden=kind==='cancel';$('#reschedule-date').required=kind==='reschedule';
    // Hidden date controls still participate in native form validation unless disabled.
    $('#reschedule-date').disabled=kind!=='reschedule';
    const tomorrow=new Date();tomorrow.setDate(tomorrow.getDate()+1);$('#reschedule-date').min=new Date(tomorrow.getTime()-tomorrow.getTimezoneOffset()*60000).toISOString().slice(0,10);$('#reschedule-date').value=booking.item.date;
    $('#save-management').textContent=kind==='cancel'?'Yes, cancel sample booking':'Save new date';$('#dismiss-management').textContent=kind==='cancel'?'Keep booking':'Go back';dialog.showModal();
  }
  $('#reschedule-booking').addEventListener('click',()=>open('reschedule'));$('#cancel-booking').addEventListener('click',()=>open('cancel'));
  $('#dismiss-management').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{const target=action==='cancel'?$('#cancel-booking'):$('#reschedule-booking');if(!target.hidden)target.focus();else $('#manage-heading').focus();});$('#manage-heading').tabIndex=-1;
  $('#manage-form').addEventListener('submit',event=>{event.preventDefault();try{
    if(owner!==window.VoyaraDemo?.owner())throw new Error('Your account changed. Reopen the booking to continue.');
    api.change(number,action,$('#reschedule-date').value,expected);dialog.close();render();$('#management-result').textContent=action==='cancel'?'Sample booking cancelled. It is now in your Cancelled trips.':'Date updated. My Trips and your ticket now show the new date.';
  }catch(error){$('#manage-error').textContent=error.message;$('#manage-error').hidden=false;}});
  window.addEventListener('voyara:collections-change',render);window.addEventListener('storage',render);window.addEventListener('pageshow',render);render();
})();
