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

NavIcon.addEventListener("click", ()=> {
    sideBar.classList.remove("active");
    NavIcon.classList.add("inactive")
    removeNav.classList.remove("inactive")
});

removeNav.addEventListener("click", ()=> {
    sideBar.classList.add("active");
    removeNav.classList.add("inactive")
    NavIcon.classList.remove("inactive")
});



// side bar events 
account.addEventListener("click", ()=> {
    accountDropdown.classList.toggle("inactive")
});
depWith.addEventListener("click", ()=> {
    depWithDropdown.classList.toggle("inactive")
});
packages.addEventListener("click", ()=> {
    packagesDropdown.classList.toggle("inactive")
});