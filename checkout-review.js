(() => {
 if(new URLSearchParams(location.search).get("cart")==="1")return;
 if (!document.querySelector('#confirm-booking')) return;
 const text = selector => document.querySelector(selector)?.textContent.trim() || '';
 const put = (id,value) => document.getElementById(id).textContent=value;
 function renderReview() {
   put('review-title',text('#booking-title'));
   put('review-schedule',text('#mobile-booking-schedule'));
   put('review-guests',text('#mobile-booking-guests'));
   const signed = document.querySelector('#signin-tab').getAttribute('aria-selected')==='true';
   const name=document.querySelector('#checkout-name').value.trim(), email=document.querySelector('#checkout-email').value.trim();
   put('review-contact',signed ? (document.querySelector('#preview-signin').disabled?document.querySelector('#signin-status').textContent:'Sign in to continue') : (name&&email?`${name} · ${email}`:'Add your name and email'));
   put('review-payment',document.querySelector('input[name=payment]:checked')?.value || 'Choose a payment preview');
   const prices=document.querySelector('#review-prices');prices.replaceChildren();
   const lines=[[text('#adult-price-label'),text('#adult-price-total')]];
   if(!document.querySelector('#child-price-row').hidden)lines.push([text('#child-price-label'),text('#child-price-total')]);
   document.querySelectorAll('input[name=addon]:checked').forEach(input=>lines.push([input.dataset.addonName,'$'+Number(input.value).toLocaleString('en-US')]));
   lines.push(['Service fee','$14']);
   lines.forEach(([label,value])=>{const row=document.createElement('div'),span=document.createElement('span'),strong=document.createElement('strong');span.textContent=label;strong.textContent=value;row.append(span,strong);prices.append(row);});
   put('review-total',text('#summary-total'));
 }
 document.querySelectorAll('[data-review-edit]').forEach(button=>button.addEventListener('click',()=>{
   const target=document.getElementById(button.dataset.reviewEdit);
   const section=target.closest('.booking-card') || target;
   const focus=section.querySelector('input:not([disabled]),button:not([disabled])') || target;
   if(!focus.matches('input,button'))focus.tabIndex=-1;
   section.scrollIntoView({block:'center',behavior:'smooth'});focus.focus({preventScroll:true});
 }));
 document.addEventListener('input',renderReview);
 document.addEventListener('change',renderReview);
 document.querySelector('#checkout-account').addEventListener('click',()=>queueMicrotask(renderReview));
 const observer=new MutationObserver(renderReview);
 ['#mobile-booking-schedule','#mobile-booking-guests','#summary-total'].forEach(selector=>observer.observe(document.querySelector(selector),{childList:true,subtree:true,characterData:true}));
 renderReview();
})();
