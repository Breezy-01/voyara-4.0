// Shared source of truth for browser-local sample bookings.
(() => {
  const store = () => window.VoyaraStore || localStorage;
  const read = key => {try{return JSON.parse(store().getItem(key)||'null');}catch{return null;}};
  const today = () => new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);
  const all = () => {
    const history=read('voyara-bookings-v1'),latest=read('voyara-latest-confirmation');
    const records=Array.isArray(history)?history.filter(x=>x?.number&&x?.item):[];
    if(latest?.number&&latest?.item&&!records.some(x=>x.number===latest.number))records.unshift(latest);
    return records.filter((record,index)=>records.findIndex(x=>x.number===record.number)===index);
  };
  const status = record => record.status==='cancelled'?'cancelled':record.item.date&&record.item.date<today()?'past':'upcoming';
  const version = record => JSON.stringify([record.updatedAt||'',record.status||'',record.item.date]);
  function change(number,action,date,expected) {
    const records=all(),record=records.find(x=>x.number===number);
    if(!record)throw new Error('This booking is no longer available in this account.');
    if(expected&&expected!==version(record))throw new Error('This booking changed in another tab. Close this dialog and review its latest details.');
    if(status(record)!=='upcoming')throw new Error('Only upcoming sample bookings can be changed.');
    if(!['cancel','reschedule'].includes(action))throw new Error('Choose a supported booking action.');
    if(action==='reschedule'){
      if(record.item.kind==='event')throw new Error('Events have a fixed date and cannot be rescheduled.');
      const parsed=new Date(date+'T12:00:00');
      if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(parsed.getTime())||parsed.getFullYear()+'-'+String(parsed.getMonth()+1).padStart(2,'0')+'-'+String(parsed.getDate()).padStart(2,'0')!==date||date<=today())throw new Error('Choose a valid date from tomorrow onward.');
      if(date===record.item.date)throw new Error('Choose a different date from your current booking.');
      const plan=window.VoyaraPlan;
      if(plan){
        const candidate={...record.item,date,cartId:record.item.cartId||number};
        const otherBookings=records.filter(b=>b.number!==number);
        const cartBookings=plan.pending().filter(x=>x.cartId!==record.cartItemId&&x.cartId!==record.item.cartId).map(item=>({item}));
        const check=plan.assess([candidate],[...otherBookings,...cartBookings]);
        if(!check.ok)throw new Error('This date conflicts with your plan. '+check.issues.map(x=>x.text).join(' '));
      }
    }
    const updatedAt=new Date().toISOString();
    const updated={...record,item:{...record.item},updatedAt,changes:[...(Array.isArray(record.changes)?record.changes:[]),{action,at:updatedAt,from:record.item.date,to:action==='reschedule'?date:null}]};
    if(action==='cancel'){updated.status='cancelled';updated.cancelledAt=updatedAt;}
    else updated.item.date=date;
    store().setItem('voyara-bookings-v1',JSON.stringify(records.map(x=>x.number===number?updated:x)));
    if(read('voyara-latest-confirmation')?.number===number){try{store().setItem('voyara-latest-confirmation',JSON.stringify(updated));}catch{}}
    return updated;
  }
  window.VoyaraBookings={all,status,version,change,today};
})();
