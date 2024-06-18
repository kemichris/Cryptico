// USER DEPOSTI POPUP 
const newDepostiBtn = document.querySelector(".new-deposit-btn");
const depositPopup = document.querySelector(".deposit-popup");
const closeDepostiPopup = document.querySelector(".close-deposit-popup");


newDepostiBtn.addEventListener("click", ()=>{
    depositPopup.classList.remove("inactive");
});

closeDepostiPopup.addEventListener("click", ()=>{
    depositPopup.classList.add("inactive");
});