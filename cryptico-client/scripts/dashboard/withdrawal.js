// USER DEPOSTI POPUP
const withdrawalBtns = document.querySelectorAll(".request-btn");
const withdrawPopup = document.querySelector(".withdraw-popup");
const closewithdrawPopup = document.querySelector(".close-deposit-popup");
const paymentOptionDisplay = document.getElementById("payment-option");
const withdrawalForm = document.getElementById("withdrawal-form");

// Load withdrawal cards
const withdrawalCardsContainer = document.getElementById(
    "withdrawal-card-container",
);

const loadWithdrawalCards = async () => {
    try {
        const res = await fetch("/api/users/payment-method/withdrawal", {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
            window.location.href = "/pages/login.html";
            return
        }

        const withdrawCardData = await res.json();
        withdrawalCardsContainer.innerHTML = "";

        withdrawCardData.forEach((card) => {
            const withdrawCard = document.createElement("div");
            withdrawCard.className = "withdraw-card";

            withdrawCard.innerHTML = `
                <h3>${card.name}</h3>
                <div>
                    <p>Minimum amount:</p>
                    <p><strong>$${card.minWithdrawal.toFixed(2)}</strong></p>
                </div>
                <div>
                    <p>Maximum amount:</p>
                    <p><strong>$${card.maxWithdrawal.toFixed(2)}</strong></p>
                </div>
                <div>
                    <p>charges type</p>
                    <p><strong>${card.withdrawalChargeType}</strong></p>
                </div>
                <div>
                    <p>Charges</p>
                    ${card.withdrawalChargeType === "percentage" ? `
                        <p><strong>${card.withdrawalCharge}%</strong></p>` : 
                        `<p><strong>$${card.withdrawalCharge}</strong></p>`}
                </div>
                <div>
                    <p>Duration</p>
                    <p><strong>3 hours</strong></p>
                </div>
                <button class="request-btn" data-id="${card.name}"><i class="fa-solid fa-plus"></i> Request Withdrawal</button>
            `;

            withdrawalCardsContainer.appendChild(withdrawCard)

        });
    } catch (error) { 
        console.error(error)
    }
};

withdrawalCardsContainer.addEventListener("click", (e)=> {
    const requestBtn = e.target.closest(".request-btn");

    if (requestBtn) {
        const requestName = requestBtn.dataset.id;
        paymentOptionDisplay.value = requestName;
        withdrawPopup.classList.remove("inactive");
        return
    }
})

closewithdrawPopup.addEventListener("click", () => {
    withdrawPopup.classList.add("inactive");
});


// withdrawal form
withdrawalForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const form = new FormData(withdrawalForm);
    const formObject = Object.fromEntries(form.entries());

    try {
        const res = await fetch("/api/users/withdraw", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(formObject),
        });

        const data = await res.json();

        console.log("📥 Server response:", data);

        if (!res.ok) {
            showToast(data.message || "Something went wrong");
            return;
        }

        // ✅ SUCCESS MESSAGE
        showToast(data.message || "Withdrawal request sent");
    } catch (error) {
        console.error(error);
    } finally {
        withdrawPopup.classList.add("inactive");
    }
});


loadWithdrawalCards()