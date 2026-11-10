(() => {
 if(new URLSearchParams(location.search).get("cart")==="1")return;
 if (!document.querySelector('#confirm-booking')) return;
  let method = 'guest', signedIn = false;
  const tabs = [...document.querySelectorAll('.checkout-tabs [role=tab]')];
  function select(tab) {
    method = tab.id === 'guest-tab' ? 'guest' : 'signin';
    tabs.forEach(button => { const active = button === tab; button.setAttribute('aria-selected', active); button.tabIndex = active ? 0 : -1; document.getElementById(button.getAttribute('aria-controls')).hidden = !active; });
    document.querySelector('#checkout-error').hidden = true;
    document.querySelectorAll('.field-error').forEach(node => node.remove());
    document.querySelectorAll('[aria-invalid=true]').forEach(node => {node.removeAttribute('aria-invalid');node.removeAttribute('aria-describedby');});
  }
  tabs.forEach((tab,index) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', event => { if (['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) {event.preventDefault(); const target = tabs[event.key === 'Home' ? 0 : event.key === 'End' ? 1 : 1-index]; select(target); target.focus();} });
  });
  const account = window.VoyaraDemo?.getUser();
  const signInButton = document.querySelector('#preview-signin');
  const status = document.querySelector('#signin-status');
  if (account) {
    signedIn = true;
    signInButton.textContent = 'Signed in as User';
    signInButton.disabled = true;
    status.textContent = 'User · user@voyara.local · local demo account';
    document.querySelector('#signin-tab').textContent = 'Your account';
    document.querySelector('#checkout-name').value = 'User';
    document.querySelector('#checkout-email').value = account.email;
    select(document.querySelector('#signin-tab'));
  } else {
    signInButton.textContent = 'Sign in to your account';
    status.textContent = 'Use your demo account, or continue as a guest.';
    signInButton.addEventListener('click', () => { location.href = 'index.html?signin=1&returnTo=booking.html'; });
  }
  document.querySelectorAll('input').forEach(input => input.addEventListener('input', () => {document.querySelector('#checkout-error').hidden = true;}));
  document.addEventListener('input', event => {
    const target = event.target;
    if (target.getAttribute('aria-invalid') === 'true') {
      document.getElementById(target.getAttribute('aria-describedby'))?.remove();
      target.removeAttribute('aria-invalid'); target.removeAttribute('aria-describedby');
    }
  });
  window.checkoutPreviewCustomer = () => method === 'signin' ? {name:account?.user_metadata.display_name || '',email:account?.email || '',accountId:account?.id} : {name:document.querySelector('#checkout-name').value.trim(),email:document.querySelector('#checkout-email').value.trim()};
  window.validateCheckoutPreview = () => {
    const error = document.querySelector('#checkout-error');
    const fail = (message, target) => {
      document.querySelectorAll('.field-error').forEach(node => node.remove());
      document.querySelectorAll('[aria-invalid=true]').forEach(node => {node.removeAttribute('aria-invalid');node.removeAttribute('aria-describedby');});
      const inline = document.createElement('span'); inline.id = target.id + '-error'; inline.className = 'field-error'; inline.textContent = message;
      target.setAttribute('aria-invalid','true'); target.setAttribute('aria-describedby',inline.id);
      (target.closest('label') || target).insertAdjacentElement('afterend',inline);
      error.textContent = message;error.hidden = false;target.focus();target.scrollIntoView({block:'center'});return false;
    };
    const date = document.querySelector('#booking-date');
    if (date.value && date.min && date.value < date.min) return fail('This date has passed. Choose a future experience or event.', date);
    if (!date.value || !date.checkValidity()) return fail(date.validity.rangeUnderflow ? 'Choose today or a future date for your experience.' : 'Choose a date for your experience.', date);
    if (method === 'guest') {
      const name = document.querySelector('#checkout-name'), email = document.querySelector('#checkout-email');
      if (!name.value.trim()) return fail('Enter a name for this sample booking.', name);
      if (!email.value.trim() || !email.checkValidity()) return fail('Enter a valid email address for this sample booking.', email);
    } else if (!signedIn) return fail('Sign in to your account, or choose Guest checkout.', document.querySelector('#preview-signin'));
    const waiver = document.querySelector('#waiver-check');
    if (!document.querySelector('#activity-waiver').hidden && !waiver.checked) return fail('Review the sample activity safety section before continuing.',waiver);
    const terms = document.querySelector('#terms-check');
    if (!terms.checked) return fail('Confirm that you understand this is a sample booking.',terms);
    error.hidden = true;return true;
  };
})();
