// Container holding all plans
const planContainer = document.querySelector(".available-plans");

// Load all available plans
const getPlans = async () => {
    try {
        const res = await fetch(`${API_URL}/api/users/plans`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!res.ok) {
            localStorage.clear();
            window.location.href = "/pages/login.html";
            return;
        }

        const planData = await res.json();

        console.log("Available plans:", planData);

        planContainer.innerHTML = "";

        if (!planData || planData.length === 0) {
            planContainer.innerHTML = `<p>No plans available.</p>`;
            return;
        }

        planData.forEach(plan => {

            const planCard = document.createElement("div");
            planCard.className = "package-card";

            planCard.innerHTML = `
                <p class="card-name">${plan.name}</p>

                <p class="card-amount">
                    $<span>${plan.price}</span>
                </p>

                <div>
                    <p>Minimum Possible Deposit:</p>
                    <p>$${plan.minAmount}</p>
                </div>

                <div>
                    <p>Maximum Possible Deposit:</p>
                    <p>$${plan.maxAmount}</p>
                </div>

                <div>
                    <p>Expected return:</p>
                    <p>${plan.totalExpectedReturn}%</p>
                </div>

                <div>
                    <p>Gift Bonus:</p>
                    <p>$${plan.giftBonus}</p>
                </div>

                <div>
                    <p>Duration:</p>
                    <p>${plan.duration} days</p>
                </div>

                <div>
                    <p>Top Up Interval:</p>
                    <p>${plan.topUpInterval}</p>
                </div>

                <p class="invested-amount">
                    Amount to invest
                </p>

                <input
                    type="number"
                    class="plan-amount-input"
                    value="${plan.minAmount}"
                    min="${plan.minAmount}"
                    max="${plan.maxAmount}"
                >

                <button
                    class="join-plan-btn"
                    data-id="${plan._id}"
                >
                    Join Plan
                </button>
            `;

            planContainer.appendChild(planCard);
        });

    } catch (error) {
        console.error("Plans error:", error);
        showToast("Unable to load investment plans.", "error");
    }
};

// Purchase plan
planContainer.addEventListener("click", async (e) => {

    const joinBtn = e.target.closest(".join-plan-btn");

    if (!joinBtn) return;

    // Ask for confirmation
    const confirmed = await showConfirm(
        "Are you sure you want to purchase this investment plan?"
    );

    if (!confirmed) return;

    // Get current card
    const card = joinBtn.closest(".package-card");

    // Get amount input
    const amountInput = card.querySelector(".plan-amount-input");

    const amount = Number(amountInput.value);

    const min = Number(amountInput.min);
    const max = Number(amountInput.max);

    // Frontend validation
    if (amount < min || amount > max) {
        showToast(
            `Amount must be between $${min} and $${max}.`,
            "error"
        );
        return;
    }

    const planId = joinBtn.dataset.id;

    try {

        // Prevent multiple clicks
        joinBtn.disabled = true;
        joinBtn.textContent = "Processing...";

        const res = await fetch(`${API_URL}/api/users/invest`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                planId,
                amount
            })
        });

        const data = await res.json();

        if (!res.ok) {
            showToast(data.message || "Investment failed.", "error");
            return;
        }

        showToast(data.message || "Investment successful!", "success");

        // Optional: reset amount back to minimum
        amountInput.value = min;

    } catch (error) {
        console.error("Investment Error:", error);
        showToast(
            "Something went wrong. Please try again.",
            "error"
        );

    } finally {
        // Enable button again
        joinBtn.disabled = false;
        joinBtn.textContent = "Join Plan";
    }
});

// Load plans
getPlans();