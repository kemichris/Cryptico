const profile = document.getElementById("account");

const profileDropdown = document.querySelector(".user-setting-dropdown");

profile.addEventListener("click", ()=> {
    toggleDropdown(profileDropdown)
})









// script for the side menu functionality 
const investment = document.querySelector(".investment");
const investmentDropdown = document.querySelector(".investment-dropdown");
const administrator = document.querySelector(".administrator");
const administratorDropdown = document.querySelector(".administrator-dropdown");
const setting = document.querySelector(".setting");
const settingDropdown = document.querySelector(".setting-dropdown");


investment.addEventListener("click", ()=>{
    toggleDropdown(investmentDropdown);
});
administrator.addEventListener("click", ()=>{
    toggleDropdown(administratorDropdown);
});
setting.addEventListener("click", ()=>{
    toggleDropdown(settingDropdown);
});


function toggleDropdown(dropdown) {
    dropdown.classList.toggle("inactive");
}

