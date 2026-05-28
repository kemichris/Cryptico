const planContainer = document.getElementById("plan-container");

const loadPlans = async () => {
    try {
        const res = await fetch("/api/admin/plans", {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
            localStorage.clear();
            window.location.href = "/admin/login.html";
            return;
        }

        const data = await res.json();
        const plansData = data.plans;

        console.log("Plans data:", plansData);

        planContainer.innerHTML = "";

        // no plans
        if (!plansData || plansData.length === 0) {
            planContainer.innerHTML = `<p>No plan Available</p>`;
            return;
        }

        // loop through plans
        plansData.forEach((plan) => {

            // create card
            const planCard = document.createElement("div");

            // add class
            planCard.className = "package-card";

            // fill card content
            planCard.innerHTML = `
                <p class="card-name">${plan.name}</p>

                <p class="card-amount">
                    $<span>${plan.price}</span>
                </p>

                <div>
                    <p>Minimum Possible Deposit:</p>
                    <p>${plan.minAmount}</p>
                </div>

                <div>
                    <p>Maximum Possible Deposit:</p>
                    <p>${plan.maxAmount}</p>
                </div>

                <div>
                    <p>Minimum Return:</p>
                    <p>${plan.minRoi}</p>
                </div>

                <div>
                    <p>Maximum Return:</p>
                    <p>${plan.maxRoi}</p>
                </div>

                <div>
                    <p>Gift Bonus:</p>
                    <p>${plan.giftBonus}</p>
                </div>

                <div>
                    <p>Duration:</p>
                    <p>${plan.duration}</p>
                </div>

                <div class="plan-setting flex">
                    <a href="edit-plan.html">
                        <button class="edit-btn">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                    </a>

                    <button class="del-btn">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            `;

            // append card to container
            planContainer.appendChild(planCard);
        });

    } catch (error) {
        console.error("Plan error:", error);
    }
};

loadPlans();