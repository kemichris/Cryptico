/* ////// NAV BAR ////// */
const mobileNav = document.querySelector(".mobile-menu");
const NavIcon = document.querySelector(".nav-menu-icon");
const removeNav = document.querySelector(".remove-nav-icon");


NavIcon.addEventListener("click", ()=> {
    mobileNav.classList.remove("inactive");
    NavIcon.classList.add("inactive")
    removeNav.classList.remove("inactive")
});

removeNav.addEventListener("click", ()=> {
    mobileNav.classList.add("inactive");
    removeNav.classList.add("inactive")
    NavIcon.classList.remove("inactive")
});

