const bankMode = document.querySelector(".bank-mode");
const cryptoMode = document.querySelector(".crypto-mode");
const bankDetails = document.querySelector(".bank-details");
const cryptoDetails = document.querySelector(".crypto-details");

bankMode.addEventListener("click", ()=> {
    toggleAttribut(bankDetails);
});

cryptoMode.addEventListener("click", ()=> {
    toggleAttribut(cryptoDetails);
});

function toggleAttribut(item) {
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


