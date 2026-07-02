/* ////// SIDE BAR VARs ////// */
const account = document.querySelector(".account");
const depWith = document.querySelector(".dep-with");
const packages = document.querySelector(".packages");

const accountDropdown = document.querySelector(".account-dropdown");
const depWithDropdown = document.querySelector(".dep-with-dropdown");
const packagesDropdown = document.querySelector(".packages-dropdown");

/* ////// NAV BAR ////// */
const sideBar = document.querySelector(".user-side-bar");
const NavIcon = document.querySelector(".nav-menu-icon");
const removeNav = document.querySelector(".remove-nav-icon");

if (NavIcon) {
  NavIcon.addEventListener("click", () => {
    sideBar.classList.remove("active");
    NavIcon.classList.add("inactive");
    removeNav.classList.remove("inactive");
  });
}

if (removeNav) {
  removeNav.addEventListener("click", () => {
    sideBar.classList.add("active");
    removeNav.classList.add("inactive");
    NavIcon.classList.remove("inactive");
  });
}

if (account) account.addEventListener("click", () => accountDropdown.classList.toggle("inactive"));
if (depWith) depWith.addEventListener("click", () => depWithDropdown.classList.toggle("inactive"));
if (packages) packages.addEventListener("click", () => packagesDropdown.classList.toggle("inactive"));

function hideLoader() {
    const loader = document.getElementById("pageLoader");
    if (loader) loader.style.display = "none";
}

// Modal and toaster
const toast = document.getElementById("toast");

function showToast(message, type = "success") {
    const toast = document.getElementById("toast");

    if (!toast) {
        console.warn("Toast element not found");
        return;
    }

    toast.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

const confirmModal = document.getElementById("confirmModal");
const confirmText = document.getElementById("confirmText");
const confirmYes = document.getElementById("confirmYes");
const confirmNo = document.getElementById("confirmNo");

function showConfirm(message) {
    const confirmModal = document.getElementById("confirmModal");
    const confirmText = document.getElementById("confirmText");
    const confirmYes = document.getElementById("confirmYes");
    const confirmNo = document.getElementById("confirmNo");

    if (!confirmModal || !confirmText || !confirmYes || !confirmNo) {
        return Promise.resolve(false);
    }

    confirmText.textContent = message;
    confirmModal.classList.remove("hidden");

    return new Promise((resolve) => {
        confirmYes.onclick = () => {
            confirmModal.classList.add("hidden");
            resolve(true);
        };

        confirmNo.onclick = () => {
            confirmModal.classList.add("hidden");
            resolve(false);
        };
    });
}

window.hideLoader = hideLoader;
window.showToast = showToast;
window.showConfirm = showConfirm;