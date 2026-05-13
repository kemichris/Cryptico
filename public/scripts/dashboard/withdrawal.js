// USER DEPOSTI POPUP 
const withdrawalBtns = document.querySelectorAll(".request-btn");
const withdrawPopup = document.querySelector(".withdraw-popup");
const closewithdrawPopup = document.querySelector(".close-deposit-popup");
const paymentOptionDisplay = document.getElementById("payment-option");


withdrawalBtns.forEach((withdrawalBtn)=>{
    
    
    withdrawalBtn.addEventListener("click", ()=>{
        let buttonValue = withdrawalBtn.value;
        paymentOptionDisplay.value = buttonValue
        withdrawPopup.classList.remove("inactive");
    })
})




closewithdrawPopup.addEventListener("click", ()=>{
    withdrawPopup.classList.add("inactive");
});