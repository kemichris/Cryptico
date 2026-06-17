const bankMode = document.querySelector(".bank-mode");
const cryptoMode = document.querySelector(".crypto-mode");
const bankDetails = document.querySelector(".bank-details");
const cryptoDetails = document.querySelector(".crypto-details");

bankMode?.addEventListener("click", ()=> {
    toggleAttribute(bankDetails);
});
cryptoMode?.addEventListener("click", ()=> {
    toggleAttribute(cryptoDetails);
});
function toggleAttribute(item) {
    item.classList.toggle("inactive");
}



// Get deposit amount and display
const amount = localStorage.getItem("depositAmount");
if (!amount) {
    alert("No deposit amount found");
    window.location.href = "/dashboard/users-deposits.html";
}
// display it
document.getElementById("paymentAmount").textContent = amount;
const depositValue = document.getElementById("deposit-value")
depositValue.value = amount;

/* ////// USER MAKING DEPOSIT ////// */

const depositForm = document.getElementById("depositForm")

depositForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(depositForm);

    // 🔥 LOG WHAT YOU ARE SENDING
    const preview = Object.fromEntries(formData.entries());
    console.log("📤 Sending to backend:", preview);

    try {
        const res = await fetch('/api/users/deposit', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData
        });

        const data = await res.json();

        // 🔥 LOG RESPONSE FROM SERVER
        console.log("📥 Server response:", data);

        if (!res.ok) {
            showToast(data.message || "Something went wrong");
            return;
        }

        // ✅ SUCCESS MESSAGE
        showToast("Deposit submitted successfully");

        // 🚀 REDIRECT TO TRANSACTION HISTORY
        window.location.href = "/dashboard/transact-history.html";

    } catch (error) {
        console.error("❌ Frontend error:", error);
        alert("Network error, try again");
    }
});
