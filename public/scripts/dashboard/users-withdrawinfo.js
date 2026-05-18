/* ////// form variables ////// */
const openWithdrawInfo = document.querySelectorAll(".open-info-dropdown");
const closeWithdrawInfo = document.querySelectorAll(".close-info-dropdown");
const bankForm = document.querySelector(".bank-form")
const btcForm = document.querySelector(".btc-form")
const ethForm = document.querySelector(".eth-form")






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