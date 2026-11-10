const businessPanels = [...document.querySelectorAll("[data-business-panel]")];
const businessTabButtons = [...document.querySelectorAll("[data-business-tab]")];
const businessTabLinks = [...document.querySelectorAll("[data-business-tab-link]")];
const businessToast = document.querySelector(".business-toast");
const operatorMenu = document.querySelector(".operator-menu");
const operatorMenuButton = document.querySelector(".operator-account");
const operatorDropdown = document.querySelector(".operator-dropdown");
let toastTimer;

function setOperatorMenu(open) {
  if (!operatorMenuButton || !operatorDropdown) return;
  operatorMenuButton.setAttribute("aria-expanded", String(open));
  operatorDropdown.hidden = !open;
}

function openBusinessPanel(panelName, updateHash = true) {
  const panelExists = businessPanels.some((panel) => panel.dataset.businessPanel === panelName);
  if (!panelExists) return;

  businessPanels.forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.businessPanel === panelName);
  });

  businessTabButtons.forEach((button) => {
    const isActive = button.dataset.businessTab === panelName;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  if (updateHash) history.replaceState(null, "", `#${panelName}`);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showBusinessToast(message) {
  if (!businessToast || !message) return;
  clearTimeout(toastTimer);
  businessToast.textContent = message;
  businessToast.hidden = false;
  toastTimer = window.setTimeout(() => {
    businessToast.hidden = true;
  }, 3200);
}

businessTabButtons.forEach((button) => {
  button.addEventListener("click", () => openBusinessPanel(button.dataset.businessTab));
});

businessTabLinks.forEach((button) => {
  button.addEventListener("click", () => openBusinessPanel(button.dataset.businessTabLink));
});

document.querySelectorAll("[data-business-notice]").forEach((button) => {
  button.addEventListener("click", () => showBusinessToast(button.dataset.businessNotice));
});

businessToast?.addEventListener("click", () => {
  clearTimeout(toastTimer);
  businessToast.hidden = true;
});

operatorMenuButton?.addEventListener("click", () => {
  setOperatorMenu(operatorMenuButton.getAttribute("aria-expanded") !== "true");
});

operatorDropdown?.addEventListener("click", (event) => {
  if (event.target.closest("button, a")) setOperatorMenu(false);
});

document.addEventListener("click", (event) => {
  if (operatorMenu && !operatorMenu.contains(event.target)) setOperatorMenu(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setOperatorMenu(false);
    operatorMenuButton?.focus();
  }
});

const initialPanel = window.location.hash.slice(1);
if (initialPanel) openBusinessPanel(initialPanel, false);
