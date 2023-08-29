/* ////// SIDE BAR ////// */
const account = document.querySelector(".account");
const depWith = document.querySelector(".dep-with");
const packages = document.querySelector(".packages");

const accountDropdown = document.querySelector(".account-dropdown");
const depWithDropdown = document.querySelector(".dep-with-dropdown");
const packagesDropdown = document.querySelector(".packages-dropdown");

account.addEventListener("click", ()=> {
    accountDropdown.classList.toggle("inactive")
});
depWith.addEventListener("click", ()=> {
    depWithDropdown.classList.toggle("inactive")
});
packages.addEventListener("click", ()=> {
    packagesDropdown.classList.toggle("inactive")
});