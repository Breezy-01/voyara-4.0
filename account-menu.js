(() => {
  if (window.voyaraAuthLoaded) return;
  window.voyaraAuthLoaded = true;
  const SUPABASE_URL = "https://ynkxklabllaizieqaptd.supabase.co";
  const SUPABASE_KEY = "sb_publishable_2i_nP_0xiZRhzcvjgHFAxA_y0t4424I";
  const SUPABASE_JS = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.105.0/dist/umd/supabase.min.js";
  const headerActions = document.querySelector(".header .header-actions");
  const oldAvatar = headerActions?.querySelector(".avatar-button");
  const oldChevron = headerActions?.querySelector(".account-chevron");
  if (!headerActions || !oldAvatar) return;

  if (!document.querySelector("style[data-google-auth-style]")) {
    const googleStyle = document.createElement("style");
    googleStyle.dataset.googleAuthStyle = "true";
    googleStyle.textContent = `.auth-google{height:43px;display:flex;align-items:center;justify-content:center;gap:9px;border:1px solid #ffffff29!important;border-radius:11px;background:#fff!important;color:#173c41!important;font-size:10px!important;font-weight:800!important}.auth-google:hover{background:#f5fbfa!important}.auth-google:disabled{cursor:wait;opacity:.65}.auth-google svg{width:18px;height:18px}`;
    document.head.append(googleStyle);
  }

  const localDemo = Boolean(window.VoyaraDemo?.enabled);
  const demoSessionKey = 'voyara-islandly-demo-session';
  const demoUser = () => window.VoyaraDemo.getUser();
  const readDemoSession = () => Boolean(demoUser());

  const state = { user: null, client: null, accountType: "customer", mode: "signin" };
  const anchor = document.createElement("div");
  anchor.className = "account-menu-anchor auth-account-anchor";
  oldAvatar.replaceWith(anchor);
  oldChevron?.remove();
  anchor.innerHTML = `<button class="guest-account-button" type="button" aria-label="Account sign in" aria-haspopup="menu" aria-expanded="false"><span data-account-face aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.5"/><path d="M5.5 20c.5-4 2.8-6 6.5-6s6 2 6.5 6"/></svg></span></button><section class="voyara-account-menu auth-account-menu" hidden aria-label="Account menu"></section>`;
  const accountButton = anchor.querySelector(".guest-account-button");
  const accountFace = anchor.querySelector("[data-account-face]");
  const menu = anchor.querySelector(".auth-account-menu");

  const modal = document.createElement("div");
  modal.className = "voyara-auth-modal";
  modal.hidden = true;
  modal.innerHTML = `<div class="voyara-auth-backdrop" data-auth-close></div><section class="voyara-auth-stage" role="dialog" aria-modal="true" aria-labelledby="voyara-auth-title">
    <button class="voyara-auth-close" type="button" data-auth-close aria-label="Close sign in">×</button>
    <div class="auth-orb auth-orb-one"></div><div class="auth-orb auth-orb-two"></div>
    <article class="voyara-auth-card" data-auth-card>
      <span class="auth-beam auth-beam-top"></span><span class="auth-beam auth-beam-right"></span><span class="auth-beam auth-beam-bottom"></span><span class="auth-beam auth-beam-left"></span>
      <div class="auth-card-content"><div class="auth-mark" aria-hidden="true">V</div><p class="auth-kicker" data-auth-kicker>CUSTOMER ACCOUNT</p><h2 id="voyara-auth-title" data-auth-title>Welcome back</h2><p class="auth-intro" data-auth-intro>Sign in to save favourites and manage your island plans.</p>
        <div class="auth-account-tabs" role="group" aria-label="Account type"><button type="button" class="active" data-auth-type="customer">Customer</button><button type="button" data-auth-type="business">Business</button></div>
        <form class="voyara-auth-form" data-auth-form novalidate>
          <button class="auth-google" type="button" data-auth-google><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.41Z"/><path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.62-2.36l-3.24-2.54c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.6-4.12H3.06v2.62A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.4 13.94A6 6 0 0 1 6.08 12c0-.67.12-1.32.32-1.94V7.44H3.06A10 10 0 0 0 2 12c0 1.61.39 3.14 1.06 4.56l3.34-2.62Z"/><path fill="#EA4335" d="M12 5.94c1.47 0 2.79.5 3.82 1.5l2.87-2.87A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.94 5.44l3.34 2.62c.8-2.36 3-4.12 5.6-4.12Z"/></svg><span data-google-label>Continue with Google</span></button>
          <div class="auth-divider"><span>or continue with email</span></div>
          <label class="auth-name-field" hidden><span>Full name</span><div><i>○</i><input type="text" name="displayName" autocomplete="name" placeholder="Your name"></div></label>
          <label><span>Email address</span><div><i>✉</i><input type="email" name="email" autocomplete="email" placeholder="you@example.com" required></div></label>
          <label><span>Password</span><div><i>⌑</i><input type="password" name="password" autocomplete="current-password" placeholder="At least 8 characters" minlength="8" required><button type="button" class="auth-show-password" data-show-password aria-label="Show password">◉</button></div></label>
          <label class="auth-confirm-field" hidden><span>Confirm password</span><div><i>⌑</i><input type="password" name="confirmPassword" autocomplete="new-password" placeholder="Repeat your password" minlength="8"></div></label>
          <div class="auth-form-options"><label class="auth-remember"><input type="checkbox" name="remember" checked><span>Remember me</span></label><button type="button" data-forgot-password>Forgot password?</button></div>
          <p class="auth-message" data-auth-message aria-live="polite"></p>
          <button class="auth-submit" type="submit"><span data-submit-label>Sign in</span><b aria-hidden="true"></b></button><button class="auth-switch-mode" type="button" data-auth-switch>New to Voyara? <strong>Create an account</strong></button>
        </form>
      </div>
    </article>
  </section>`;
  document.body.append(modal);
  if (localDemo) {
    const style = document.createElement('style');
    style.textContent = '.local-demo-login :is(.auth-account-tabs,.auth-google,.auth-divider,.auth-name-field,.auth-confirm-field,[data-auth-switch],[data-forgot-password]){display:none!important}';
    document.head.append(style);
  }

  const bookingGate = document.createElement("div");
  bookingGate.className = "voyara-booking-gate";
  bookingGate.hidden = true;
  bookingGate.innerHTML = `<div class="booking-gate-backdrop" data-booking-gate-close></div><section class="booking-gate-card" role="dialog" aria-modal="true" aria-labelledby="booking-gate-title"><button type="button" class="booking-gate-close" data-booking-gate-close aria-label="Close checkout options">×</button><span class="booking-gate-icon" aria-hidden="true">⛵</span><p>CONTINUE YOUR BOOKING</p><h2 id="booking-gate-title">How would you like to check out?</h2><small>You can book immediately as a guest, or sign in to keep this trip with your Voyara account.</small><button type="button" class="booking-gate-login" data-booking-gate-login>Log in to Voyara </button><button type="button" class="booking-gate-guest" data-booking-gate-guest>Checkout as guest</button><b>Secure prototype checkout · You won’t be charged yet</b></section>`;
  document.body.append(bookingGate);
  let guestCheckoutAction = null;

  const form = modal.querySelector("[data-auth-form]");
  const message = modal.querySelector("[data-auth-message]");
  const submit = modal.querySelector(".auth-submit");
  const googleButton = modal.querySelector("[data-auth-google]");
  const card = modal.querySelector("[data-auth-card]");
  const setMessage = (text, type = "") => { message.textContent = text; message.dataset.type = type; };
  const setLoading = (loading) => { submit.disabled = loading; submit.classList.toggle("loading", loading); };
  const displayName = (user) => user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Voyara traveler";

  function renderForm() {
    form.elements.password.type = "password";
    modal.querySelector("[data-show-password]").setAttribute("aria-label", "Show password");
    modal.querySelector("[data-show-password]").textContent = "◉";
    const signup = state.mode === "signup";
    modal.querySelector("[data-auth-kicker]").textContent = `${state.accountType.toUpperCase()} ACCOUNT`;
    modal.querySelector("[data-auth-title]").textContent = signup ? "Join Voyara" : "Welcome back";
    modal.querySelector("[data-auth-intro]").textContent = signup ? "Create one account for your Voyara website and app." : `Sign in to your ${state.accountType} account to continue.`;
    modal.querySelector(".auth-name-field").hidden = !signup;
    modal.querySelector(".auth-confirm-field").hidden = !signup;
    form.elements.displayName.required = signup;
    form.elements.confirmPassword.required = signup;
    form.elements.password.autocomplete = signup ? "new-password" : "current-password";
    modal.querySelector("[data-submit-label]").textContent = signup ? "Create account" : "Sign in";
    modal.querySelector("[data-google-label]").textContent = signup ? "Sign up with Google" : "Continue with Google";
    modal.querySelector("[data-auth-switch]").innerHTML = signup ? `Already have an account? <strong>Sign in</strong>` : `New to Voyara? <strong>Create an account</strong>`;
    modal.querySelectorAll("[data-auth-type]").forEach((button) => button.classList.toggle("active", button.dataset.authType === state.accountType));
    if (localDemo) {
      modal.classList.add('local-demo-login');
      modal.querySelector('[data-auth-kicker]').textContent = 'LOCAL DEMO ACCOUNT';
      modal.querySelector('[data-auth-title]').textContent = 'Welcome back';
      modal.querySelector('[data-auth-intro]').textContent = 'Sign in to explore your local Voyara preview.';
      form.elements.email.type = 'text';
      form.elements.email.autocomplete = 'username';
      form.elements.email.placeholder = 'User';
      form.elements.email.closest('label').querySelector('span').textContent = 'Username';
      form.elements.password.minLength = 5;
      form.elements.password.placeholder = 'Demo password';
      form.elements.displayName.required = false;
      form.elements.confirmPassword.required = false;
      modal.querySelector('[data-submit-label]').textContent = 'Sign in';
    }
    setMessage("");
  }
  function closeMenu() { menu.hidden = true; anchor.classList.remove("open"); accountButton.setAttribute("aria-expanded", "false"); }
  function openAuth(type = "customer", reason = "") { closeMenu(); state.accountType = type; state.mode = "signin"; renderForm(); if (reason) setMessage(reason); modal.hidden = false; document.body.classList.add("auth-modal-open"); window.setTimeout(() => form.elements.email.focus(), 80); }
  function closeAuth() { modal.hidden = true; document.body.classList.remove("auth-modal-open"); card.style.transform = ""; }
  function closeBookingGate() { bookingGate.hidden = true; guestCheckoutAction = null; document.body.classList.remove("auth-modal-open"); }
  function openBookingGate(onGuest) { closeMenu(); guestCheckoutAction = onGuest; bookingGate.hidden = false; document.body.classList.add("auth-modal-open"); bookingGate.querySelector("[data-booking-gate-login]").focus(); }
  bookingGate.querySelectorAll("[data-booking-gate-close]").forEach((button) => button.addEventListener("click", closeBookingGate));
  bookingGate.querySelector("[data-booking-gate-login]").addEventListener("click", () => { closeBookingGate(); openAuth("customer", "Sign in to save this booking to your Voyara account."); });
  bookingGate.querySelector("[data-booking-gate-guest]").addEventListener("click", () => { const action = guestCheckoutAction; closeBookingGate(); action?.(); });
  async function logout() {
    if (localDemo) { localStorage.removeItem(demoSessionKey); sessionStorage.removeItem(demoSessionKey); }
    else { await state.client?.auth.signOut(); }
    state.user = null; closeMenu(); renderAccount();
  }
  window.VoyaraAuth = { logout, isAuthenticated: () => Boolean(state.user), open: openAuth, openBookingGate, getUser: () => state.user };
  window.dispatchEvent(new CustomEvent("voyara:auth-ready"));

  function accountIcon(name) {
    const paths = {
      profile: '<circle cx="12" cy="8" r="3.5"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/>',
      favourites: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
      business: '<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12a20 20 0 0 0 18 0M12 12v3"/>',
      logout: '<path d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4M9 12h12m-4-4 4 4-4 4"/>'
    };
    return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${paths[name]}</svg>`;
  }

  function renderAccount() {
    const loggedIn = Boolean(state.user);
    document.documentElement.dataset.authState = loggedIn ? "authenticated" : "guest";
    document.querySelectorAll("a[href$='voyager-profile.html'] img").forEach((image) => { image.hidden = !loggedIn; });
    accountButton.classList.toggle("is-authenticated", loggedIn);
    accountButton.setAttribute("aria-label", loggedIn ? `Account menu for ${displayName(state.user)}` : "Sign in or create an account");
    accountFace.innerHTML = loggedIn ? `<span class="account-initials">${displayName(state.user).split(/\s+/).map((part) => part[0]).join("").slice(0,2).toUpperCase()}</span>` : `<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.5"/><path d="M5.5 20c.5-4 2.8-6 6.5-6s6 2 6.5 6"/></svg>`;
    if (!loggedIn) menu.innerHTML = `<div class="guest-menu-heading"><span>WELCOME TO VOYARA</span><strong>Sign in to continue</strong><p>Access favourites, trips and personalized plans.</p></div><button type="button" class="guest-signin-option" data-open-auth="customer"><i aria-hidden="true">${accountIcon("profile")}</i><span><strong>Customer sign in</strong><small>Explore, save and book experiences</small></span></button><button type="button" class="guest-signin-option business" data-open-auth="business"><i aria-hidden="true">${accountIcon("business")}</i><span><strong>Business sign in</strong><small>Manage listings and reservations</small></span></button>`;
    else menu.innerHTML = `<div class="signed-in-menu-user"><span>${accountFace.textContent}</span><div><strong>${displayName(state.user)}</strong><small>${state.user.email}</small></div><b>${localDemo ? "LOCAL DEMO" : "ONLINE"}</b></div><div class="account-menu-group"><button type="button" class="account-menu-row" data-auth-page="profile.html"><span class="account-row-icon" aria-hidden="true">${accountIcon("profile")}</span><span>Profile</span></button><button type="button" class="account-menu-row" data-auth-page="favorites.html"><span class="account-row-icon" aria-hidden="true">${accountIcon("favourites")}</span><span>Favourites</span></button>${state.user?.user_metadata?.account_type==='business'?`<button type="button" class="account-menu-row" data-auth-page="business.html"><span class="account-row-icon" aria-hidden="true">${accountIcon("business")}</span><span>Switch to Business</span></button>`:''}</div><div class="account-menu-group"><button type="button" class="account-menu-row account-logout" data-auth-logout><span class="account-row-icon" aria-hidden="true">${accountIcon("logout")}</span><span>Log out</span></button></div>`;
    menu.querySelectorAll("[data-open-auth]").forEach((button) => button.addEventListener("click", () => openAuth(button.dataset.openAuth)));
    menu.querySelectorAll("[data-auth-page]").forEach((button) => button.addEventListener("click", () => { window.location.href = button.dataset.authPage; }));
    menu.querySelector("[data-auth-logout]")?.addEventListener("click", logout);
    window.dispatchEvent(new CustomEvent("voyara:auth-change", { detail: { user: state.user } }));
  }

  accountButton.addEventListener("click", (event) => { event.preventDefault(); event.stopPropagation(); const open = menu.hidden; menu.hidden = !open; anchor.classList.toggle("open", open); accountButton.setAttribute("aria-expanded", String(open)); });
  modal.querySelectorAll("[data-auth-close]").forEach((button) => button.addEventListener("click", closeAuth));
  modal.querySelectorAll("[data-auth-type]").forEach((button) => button.addEventListener("click", () => { state.accountType = button.dataset.authType; renderForm(); }));
  modal.querySelector("[data-auth-switch]").addEventListener("click", () => { state.mode = state.mode === "signin" ? "signup" : "signin"; renderForm(); });
  modal.querySelector("[data-show-password]").addEventListener("click", (event) => { const input = form.elements.password; input.type = input.type === "password" ? "text" : "password"; event.currentTarget.textContent = input.type === "password" ? "◉" : "◎"; event.currentTarget.setAttribute("aria-label", input.type === "password" ? "Show password" : "Hide password"); });
  modal.querySelector("[data-forgot-password]").addEventListener("click", async () => { const email = form.elements.email.value.trim(); if (!email) { setMessage("Enter your email address first.", "error"); return; } if (!state.client) { setMessage("Sign-in service is still loading.", "error"); return; } const { error } = await state.client.auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}${location.pathname}` }); setMessage(error ? error.message : "Password reset instructions have been sent.", error ? "error" : "success"); });
  googleButton.addEventListener("click", async () => {
    if (!state.client) { setMessage("The secure sign-in service is still loading. Please try again.", "error"); return; }
    googleButton.disabled = true;
    sessionStorage.setItem("voyara-oauth-account-type", state.accountType);
    const { error } = await state.client.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${location.origin}${location.pathname}` } });
    if (error) { googleButton.disabled = false; setMessage(error.message, "error"); }
  });
  card.addEventListener("pointermove", (event) => { if (matchMedia("(prefers-reduced-motion: reduce)").matches) return; const rect = card.getBoundingClientRect(); const rx = ((event.clientY - rect.top) / rect.height - .5) * -7; const ry = ((event.clientX - rect.left) / rect.width - .5) * 7; card.style.transform = `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg)`; });
  card.addEventListener("pointerleave", () => { card.style.transform = ""; });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (localDemo) {
      if (!form.reportValidity()) return;
      if ((form.elements.email.value.trim() !== 'User' && form.elements.email.value.trim() !== 'Business') || form.elements.password.value !== '12345') {
        setMessage('Incorrect username or password. Please try again.', 'error');
        return;
      }
      try {
        localStorage.removeItem(demoSessionKey); sessionStorage.removeItem(demoSessionKey);
        (form.elements.remember.checked ? localStorage : sessionStorage).setItem(demoSessionKey, form.elements.email.value.trim());
      } catch { setMessage('Allow browser storage to keep this demo session signed in.', 'error'); return; }
      state.user = demoUser();
      const returningToCheckout = new URLSearchParams(location.search).get('returnTo') === 'booking.html';
      if (returningToCheckout) {
        const draft = localStorage.getItem('voyara-booking-draft');
        if (draft) window.VoyaraStore.setItem('voyara-booking-draft', draft);
      }
      form.elements.password.value = '';
      renderAccount(); closeAuth(); accountButton.focus();
      if (returningToCheckout) location.href = 'booking.html'; else if(state.user?.user_metadata?.account_type==='business') location.href='business.html';
      return;
    }
    if (!state.client) { setMessage("The secure sign-in service is still loading. Please try again.", "error"); return; }
    const email = form.elements.email.value.trim(); const password = form.elements.password.value;
    if (!form.reportValidity()) return;
    if (state.mode === "signup" && password !== form.elements.confirmPassword.value) { setMessage("Passwords do not match.", "error"); return; }
    setLoading(true); setMessage("");
    const response = state.mode === "signup" ? await state.client.auth.signUp({ email, password, options: { data: { display_name: form.elements.displayName.value.trim(), account_type: state.accountType }, emailRedirectTo: `${location.origin}${location.pathname}` } }) : await state.client.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (response.error) { setMessage(response.error.message, "error"); return; }
    if (state.mode === "signup" && !response.data.session) { state.mode = "signin"; renderForm(); setMessage("Account created. Check your email to confirm your address, then sign in.", "success"); return; }
    state.user = response.data.user; renderAccount(); closeAuth();
    if (state.accountType === "business") window.location.href = "business.html";
  });

  document.addEventListener("click", (event) => { if (!anchor.contains(event.target)) closeMenu(); });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") { closeMenu(); closeAuth(); } });
  document.addEventListener("click", (event) => {
    if (state.user || modal.contains(event.target)) return;
    const protectedTarget = event.target.closest(".favorites-trigger,.trip-cart-trigger,.heart,.experience-heart,.save-card,.community-save-guide,.social-like,.social-comment,.social-save,.explore-modal-like,.explore-modal-comment,.explore-modal-save,.social-comment-form input,.social-comment-form button,.explore-modal-comment-form input,.explore-modal-comment-form button,[data-create-post],[data-edit-profile],a[href$='voyager-profile.html'],a[href$='favorites.html'],a[href$='profile.html'],.header .bag-icon");
    if (!protectedTarget) return;
    // Browser-local collections remain usable in the isolated design preview.
    if (['localhost', '127.0.0.1'].includes(location.hostname) && protectedTarget.matches(".favorites-trigger,.heart,.experience-heart,.save-card,.community-save-guide,a[href='favorites.html'],a[href='profile.html']")) return;
    event.preventDefault(); event.stopImmediatePropagation();
    const trips = protectedTarget.matches(".trip-cart-trigger,.header .bag-icon,a[href='profile.html']") || protectedTarget.closest(".trip-cart-trigger");
    const social = protectedTarget.matches(".social-like,.social-comment,.social-save,.explore-modal-like,.explore-modal-comment,.explore-modal-save,.social-comment-form input,.social-comment-form button,.explore-modal-comment-form input,.explore-modal-comment-form button,[data-create-post],[data-edit-profile],a[href$='voyager-profile.html']");
    openAuth("customer", trips ? "Sign in to view your trips and bookings." : social ? "Log in to Voyara to like, comment on, or save community posts." : "Sign in to save and view your favourites.");
  }, true);
  document.addEventListener("submit", (event) => {
    if (state.user || !event.target.matches(".social-comment-form,.explore-modal-comment-form,#edit-profile-form")) return;
    event.preventDefault(); event.stopImmediatePropagation();
    openAuth("customer", "Log in to Voyara to like, comment on, or save community posts.");
  }, true);

  function loadSupabase() { return new Promise((resolve, reject) => { if (window.supabase?.createClient) { resolve(); return; } const script = document.createElement("script"); script.src = SUPABASE_JS; script.crossOrigin = "anonymous"; script.onload = resolve; script.onerror = reject; document.head.append(script); }); }
  async function initialize() {
    if (localDemo) {
      state.user = readDemoSession() ? demoUser() : null;
      renderAccount();
      if (new URLSearchParams(location.search).get('signin') === '1' && !state.user) openAuth();
      window.addEventListener('storage', event => { if (event.key === demoSessionKey || event.key === null) { state.user = readDemoSession() ? demoUser() : null; renderAccount(); } });
      return;
    }
    renderAccount();
    try {
      await loadSupabase();
      state.client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
      const { data } = await state.client.auth.getSession(); state.user = data.session?.user || null; renderAccount();
      const oauthAccountType = sessionStorage.getItem("voyara-oauth-account-type");
      if (state.user && oauthAccountType) {
        sessionStorage.removeItem("voyara-oauth-account-type");
        await state.client.auth.updateUser({ data: { account_type: oauthAccountType } });
        if (oauthAccountType === "business" && !location.pathname.endsWith("business.html")) { location.href = "business.html"; return; }
      }
      state.client.auth.onAuthStateChange((_event, session) => { state.user = session?.user || null; renderAccount(); });
    } catch (error) { console.error("Voyara authentication failed to initialize.", error); setMessage("Secure sign-in is temporarily unavailable. Please try again shortly.", "error"); }
  }
  initialize();
})();
