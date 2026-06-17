// USER DEPOSTI POPUP 
const withdrawalBtns = document.querySelectorAll(".request-btn");
const withdrawPopup = document.querySelector(".withdraw-popup");
const closewithdrawPopup = document.querySelector(".close-deposit-popup");
const paymentOptionDisplay = document.getElementById("payment-option");
const withdrawalForm = document.getElementById("withdrawal-form");


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

withdrawalForm.addEventListener("submit", async (e)=> {
    e.preventDefault()

    const form = new FormData(withdrawalForm);
    const formObject = Object.fromEntries(form.entries());

    try {
        const res = await fetch("/api/users/withdraw", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(formObject)
        })

        const data = await res.json();

        console.log("📥 Server response:", data);

        if (!res.ok) {
            showToast(data.message || "Something went wrong");
            return;
        }

        // ✅ SUCCESS MESSAGE
        showToast(data.message || "Withdrawal request sent");

    } catch (error) {
        console.error(error)
    }

})