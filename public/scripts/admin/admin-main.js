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

window.hideLoader = hideLoader;
