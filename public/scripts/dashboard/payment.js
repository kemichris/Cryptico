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

depositForm.addEventListener("submit", async (e)  =>{
    e.preventDefault();

    const formData = new FormData(depositForm);
    const dataObject = Object.fromEntries(formData.entries());

    // see exactly what is being sent
    console.log('Sending:', dataObject);


    try {
        // fetch deposit data
        const res = await fetch('/api/users/deposit', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: dataObject
        });


    } catch (error) {
        
    }

})
