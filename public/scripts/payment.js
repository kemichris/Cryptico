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