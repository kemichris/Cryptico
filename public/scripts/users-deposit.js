// USER DEPOSTI POPUP 
const newDepostiBtn = document.querySelector(".new-deposit-btn");
const depositPopup = document.querySelector(".deposit-popup");
const closeDepositPopup = document.querySelector(".close-deposit-popup");


newDepostiBtn.addEventListener("click", ()=>{
    depositPopup.classList.remove("inactive");
});

closeDepositPopup.addEventListener("click", ()=>{
    depositPopup.classList.add("inactive");
});