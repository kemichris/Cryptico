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

const loadWithdrawalInfo = async () => {
  try {
    // STEP 1: Call backend API to get withdrawal info
    const res = await fetch('/api/users/withdrawal-info', {
      headers: {
        Authorization: `Bearer ${token}` // send login token for auth
      }
    });

    // STEP 2: If request failed or no data exists, stop here
    if (!res.ok) {
      console.log("No withdrawal info found or request failed");
      return;
    }

    // STEP 3: Convert response to JSON
    const data = await res.json();

    // STEP 4: Extract withdrawal info safely (could be undefined)
    const info = data?.withdrawalInfo;

    // STEP 5: If backend returned nothing, stop execution
    if (!info) {
      console.log("Withdrawal info is empty");
      return;
    }

    /*
      STEP 6: SAFE FORM FILLER (CORE LOGIC)

      - We loop through all keys in the object (bankName, cryptoType, etc)
      - For each key:
        → find matching input in form using [name="key"]
        → if input exists AND value exists → fill it
      - This works even if user has ONLY bank OR ONLY crypto OR BOTH
    */
    Object.entries(info).forEach(([key, value]) => {
      const input = document.querySelector(`[name="${key}"]`);

      // skip if input doesn't exist OR value is empty/null
      if (!input || value == null) return;

      // fill input with backend value
      input.value = value;
    });

  } catch (error) {
    console.error('Load withdrawal info error:', error);
  }
};

// STEP 8: Run function when page loads
loadWithdrawalInfo();

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
