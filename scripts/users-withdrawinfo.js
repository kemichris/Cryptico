
/* ////// SIDE BAR VARs ////// */
const account = document.querySelector(".account");
const depWith = document.querySelector(".dep-with");
const packages = document.querySelector(".packages");

const accountDropdown = document.querySelector(".account-dropdown");
const depWithDropdown = document.querySelector(".dep-with-dropdown");
const packagesDropdown = document.querySelector(".packages-dropdown");

/* ////// form variables ////// */
const openWithdrawInfo = document.querySelectorAll(".open-info-dropdown");
const closeWithdrawInfo = document.querySelectorAll(".close-info-dropdown");
const bankForm = document.querySelector(".bank-form")
const btcForm = document.querySelector(".btc-form")
const ethForm = document.querySelector(".eth-form")




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



// open dropdowns 
openWithdrawInfo[0].addEventListener("click", ()=>{
    bankForm.classList.add("active");
    openWithdrawInfo[0].classList.add("inactive");
    closeWithdrawInfo[0].classList.remove("inactive");
});
openWithdrawInfo[1].addEventListener("click", ()=>{
    btcForm.classList.add("active");
    openWithdrawInfo[1].classList.add("inactive");
    closeWithdrawInfo[1].classList.remove("inactive");
});
openWithdrawInfo[2].addEventListener("click", ()=>{
    ethForm.classList.add("active");
    openWithdrawInfo[2].classList.add("inactive");
    closeWithdrawInfo[2].classList.remove("inactive");
});

// close dropdowns
closeWithdrawInfo[0].addEventListener("click", ()=>{
    bankForm.classList.remove("active");
    closeWithdrawInfo[0].classList.add("inactive");
    openWithdrawInfo[0].classList.remove("inactive");
});
closeWithdrawInfo[1].addEventListener("click", ()=>{
    btcForm.classList.remove("active");
    closeWithdrawInfo[1].classList.add("inactive");
    openWithdrawInfo[1].classList.remove("inactive");
});
closeWithdrawInfo[2].addEventListener("click", ()=>{
    ethForm.classList.remove("active");
    closeWithdrawInfo[2].classList.add("inactive");
    openWithdrawInfo[2].classList.remove("inactive");
});