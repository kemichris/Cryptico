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

// displaying payment details
const paymentModeContainer = document.getElementById("payment-mode")
const paymentSelect = document.getElementById("select-method")

const showPaymentMethods = async () => {
    try {
        const res = await fetch(`${API_URL}/api/users/payment-method/deposit`, {
            headers: { Authorization: `Bearer ${Auth.getToken()}` }
        });

        if (!res.ok) {
            window.location.href = "/dashboard/users-deposits.html";
            return
        }
        const paymentMethods = await res.json()

        paymentModeContainer.innerHTML = ""
        paymentSelect.innerHTML = ""


        paymentMethods.forEach(method => {
            const methodCard = document.createElement("div");
            methodCard.className = "payment-method";

            methodCard.innerHTML = `
               <h3>${method.name}</h3>
                <div class="payment-method-details">
                    ${method.type === "crypto" ? `
                            <p><strong>Address:</strong> <Span>${method.walletAddress}</Span></p>
                            <p><strong>Network:</strong> <Span>${method.network}</Span></p>
                            ${method.qrCode ? ` <div class="qr-code">
                                <img src="${method.qrCode}" alt="${method.name} QR Code">
                            </div> `: ""}
                        ` : `
                                <p><strong>Bank Name:</strong> <span>${method.bankName || "-"}</span></p>

                                <p><strong>Account Name:</strong> <span>${method.accountName || "-"}</span></p>

                                <p><strong>Account Number:</strong> <span>${method.accountNumber || "-"}</span></p>
                                ${method.swiftCode ? `<p><strong>Swift Code:</strong> 
                                    <span>${method.swiftCode}</span></p>` : ""}
                        `

                }
                    ${method.instructions ? ` <div class="payment-note"> <strong>Note:</strong><br>
                        ${method.instructions}
                        </div>
                    ` : ""}
                </div>
            `;

            const methodOption = document.createElement("option");
            methodOption.value = `${method.name}`
            methodOption.innerText = ` ${method.name}
                        
            `

            paymentSelect.appendChild(methodOption)
            paymentModeContainer.appendChild(methodCard);
        });

    } catch (error) {
        console.error(error)
    }
}


paymentModeContainer.addEventListener("click", (e) => {
    const card = e.target.closest(".payment-method");
    if (!card) return;
    const details = card.querySelector(".payment-method-details");
    details.classList.toggle("inactive");
})




/* ////// USER MAKING DEPOSIT ////// */
const depositForm = document.getElementById("depositForm")

depositForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(depositForm);

    // 🔥 LOG WHAT YOU ARE SENDING
    const preview = Object.fromEntries(formData.entries());
    console.log("📤 Sending to backend:", preview);

    try {
        const res = await fetch(`${API_URL}/api/users/deposit`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${Auth.getToken()}`
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
    }
});


showPaymentMethods()