/* ////// form variables ////// */
const openWithdrawInfo = document.querySelectorAll(".open-info-dropdown");
const closeWithdrawInfo = document.querySelectorAll(".close-info-dropdown");
const bankForm = document.querySelector(".bank-form")
const cryptoForm = document.querySelector(".crypto-form")


// open dropdowns 
openWithdrawInfo[0].addEventListener("click", ()=>{
    bankForm.classList.add("active");
    openWithdrawInfo[0].classList.add("inactive");
    closeWithdrawInfo[0].classList.remove("inactive");
});

openWithdrawInfo[1].addEventListener("click", ()=>{
    cryptoForm.classList.add("active");
    openWithdrawInfo[1].classList.add("inactive");
    closeWithdrawInfo[1].classList.remove("inactive");
});

// close dropdowns
closeWithdrawInfo[0].addEventListener("click", ()=>{
    bankForm.classList.remove("active");
    closeWithdrawInfo[0].classList.add("inactive");
    openWithdrawInfo[0].classList.remove("inactive");
});

closeWithdrawInfo[1].addEventListener("click", ()=>{
    cryptoForm.classList.remove("active");
    closeWithdrawInfo[1].classList.add("inactive");
    openWithdrawInfo[1].classList.remove("inactive");
});
