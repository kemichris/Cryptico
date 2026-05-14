const bankMode = document.querySelector(".bank-mode");
const cryptoMode = document.querySelector(".crypto-mode");
const bankDetails = document.querySelector(".bank-details");
const cryptoDetails = document.querySelector(".crypto-details");

bankMode?.addEventListener("click", () => toggleAttribute(bankDetails));
cryptoMode?.addEventListener("click", () => toggleAttribute(cryptoDetails));

function toggleAttribute(item) {
  item.classList.toggle("inactive");
}

// get deposit amount from localStorage
const amount = localStorage.getItem("depositAmount");
if (!amount) {
  alert("No deposit amount found");
  window.location.href = "/dashboard/users-deposits.html";
}

// display amount
document.getElementById("paymentAmount").textContent = amount;
document.getElementById("deposit-value").value = amount;

/* ////// SUBMIT DEPOSIT ////// */
const depositForm = document.getElementById("depositForm");

depositForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // use FormData directly — needed for file upload
  const formData = new FormData(depositForm);

  console.log('Sending deposit...');

  try {
    const res = await fetch('/api/users/deposit', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}` 
        // DO NOT set Content-Type — browser sets it automatically for FormData
      },
      body: formData  // send FormData directly
    });

    const data = await res.json();
    console.log('Response:', data);

    if (res.ok) {
      // clear amount from localStorage
      localStorage.removeItem("depositAmount");
      alert('Deposit submitted successfully! Awaiting approval.');
      window.location.href = '/dashboard/users-deposits.html';
    } else {
      alert(data.message);
    }

  } catch (error) {
    console.error('Deposit error:', error);
    alert('Something went wrong: ' + error.message);
  }
});