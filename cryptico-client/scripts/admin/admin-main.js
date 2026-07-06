// profile setting
const profile = document.getElementById("account");

const profileDropdown = document.querySelector(".user-setting-dropdown");

profile.addEventListener("click", () => {
    toggleDropdown(profileDropdown);
});

// script for the side menu functionality
const investment = document.querySelector(".investment");
const investmentDropdown = document.querySelector(".investment-dropdown");
const administrator = document.querySelector(".administrator");
const administratorDropdown = document.querySelector(".administrator-dropdown");
const setting = document.querySelector(".setting");
const settingDropdown = document.querySelector(".setting-dropdown");
const navMenuIcon = document.querySelector(".nav-menu-icon");
const sieMenu = document.getElementById("side-menu");

investment.addEventListener("click", () => {
    toggleDropdown(investmentDropdown);
});
administrator.addEventListener("click", () => {
    toggleDropdown(administratorDropdown);
});
setting.addEventListener("click", () => {
    toggleDropdown(settingDropdown);
});

navMenuIcon.addEventListener("click", () => {
    sieMenu.classList.toggle("active");
});

function toggleDropdown(dropdown) {
    dropdown.classList.toggle("inactive");
}

const adminName = document.getElementById("admin-name");

if (adminName) {
    const user = Auth.getUser();
    adminName.textContent = user?.userName || user?.fullName || "Admin";
}

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
    }, 7000);
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

/* ////// LOGOUT ////// */
const adminLogout = document.getElementById('admin-logout');
if (adminLogout) {
    adminLogout.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/admin/login.html';
    });
}

// CHANGE PASSWORD LINk
const changePasswordBtn = document.getElementById("change-password");

changePasswordBtn.addEventListener("click", ()=> {
    window.location.href = "/admin/change-password.html"
});

// ACCOUNT SETTING LINk
const accSettingBtn = document.getElementById("account-setting");

accSettingBtn.addEventListener("click", ()=> {
    window.location.href = "/admin/account-setting.html"
});

window.hideLoader = hideLoader;
window.showToast = showToast;
window.showConfirm = showConfirm;
