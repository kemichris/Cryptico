/* ////// form variables ////// */
const openWithdrawInfo = document.querySelectorAll(".open-info-dropdown");
const closeWithdrawInfo = document.querySelectorAll(".close-info-dropdown");
const bankForm = document.querySelector(".bank-form")
const cryptoForm = document.querySelector(".crypto-form")


// open dropdowns 
openWithdrawInfo[0].addEventListener("click", () => {
    bankForm.classList.add("active");
    openWithdrawInfo[0].classList.add("inactive");
    closeWithdrawInfo[0].classList.remove("inactive");
});

openWithdrawInfo[1].addEventListener("click", () => {
    cryptoForm.classList.add("active");
    openWithdrawInfo[1].classList.add("inactive");
    closeWithdrawInfo[1].classList.remove("inactive");
});

// close dropdowns
closeWithdrawInfo[0].addEventListener("click", () => {
    bankForm.classList.remove("active");
    closeWithdrawInfo[0].classList.add("inactive");
    openWithdrawInfo[0].classList.remove("inactive");
});

closeWithdrawInfo[1].addEventListener("click", () => {
    cryptoForm.classList.remove("active");
    closeWithdrawInfo[1].classList.add("inactive");
    openWithdrawInfo[1].classList.remove("inactive");
});


const withdrawalInfoForm = document.getElementById("withdrawal-info")

// Load withdrawal Info


// Add withdrawal Info
withdrawalInfoForm.addEventListener('submit',  async (e) => {
    e.preventDefault()

    const formData = new FormData(withdrawalInfoForm);
    const dataObject = Object.fromEntries(formData.entries());

    const hasBankInfo = dataObject.bankName && dataObject.accountName && dataObject.accountNumber;
    const hasCryptoInfo = dataObject.cryptoType && dataObject.cryptoNetwork && dataObject.walletAddress;

    if (!hasBankInfo && !hasCryptoInfo) {
        alert('Please fill in at least one withdrawal method');
        return;
    }

    try {
        const res = await fetch('/api/users/withdrawal-info', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataObject)
        });
        const data = await res.json();

        if (res.ok) {
            alert('Withdrawal info saved successfully!');
        } else {
            alert(data.message);
        }

    } catch (err) {
        console.error('Error:', err);
        alert('Something went wrong: ' + err.message);
    }

});
