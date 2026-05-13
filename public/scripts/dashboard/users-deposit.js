// USER DEPOSTI POPUP 
const newDepostiBtn = document.querySelector(".new-deposit-btn");
const depositPopup = document.querySelector(".deposit-popup");
const closeDepositPopup = document.querySelector(".close-deposit-popup");
const depositAmount = document.getElementById("depositAmount")
const continueBtn = document.getElementById("cnt-btn");


newDepostiBtn.addEventListener("click", ()=>{
    depositPopup.classList.remove("inactive");
});

closeDepositPopup.addEventListener("click", ()=>{
    depositPopup.classList.add("inactive");
});

// SAVE AMOUNT + GO TO NEXT PAGE
continueBtn.addEventListener("click", () => {

    const amount = depositAmount.value;

    // validation
    if (!amount || amount <= 0) {
        alert("Please enter a valid amount");
        return;
    }

    // store in localStorage
    localStorage.setItem("depositAmount", amount);

    // go to payment page
    window.location.href = "/dashboard/users-payment.html";
});
