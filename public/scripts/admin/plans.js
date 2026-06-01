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
                    <button class="edit-btn" data-id="${plan._id}">
                        <i class="fa-solid fa-pen"></i>
                    </button>

                    <button class="del-btn" data-id="${plan._id}">
                         <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            `;

            // append card to container
            planContainer.appendChild(planCard);
        });

    } catch (error) {
        console.error("Plan error:", error);
    } finally {
        hideLoader();
    }
};

// handle ALL clicks here
planContainer.addEventListener("click", async (e) => {
    const editBtn = e.target.closest(".edit-btn");

    if (editBtn) {
        const planId = editBtn.dataset.id;

        // store fallback
        sessionStorage.setItem("editPlanId", planId);

        // preferred navigation (clean + REST style)
        window.location.href = `/admin/edit-plan.html?id=${planId}`;
    }

    // DELETE
    const deleteBtn = e.target.closest(".del-btn");

    if (deleteBtn) {
        const planId = deleteBtn.dataset.id;

        const confirmDelete = confirm("Are you sure you want to delete this plan?");
        if (!confirmDelete) return;

        try {
            const res = await fetch(`/api/admin/plans/${planId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Failed to delete plan");
                return;
            }

            // remove from UI instantly
            deleteBtn.closest(".package-card").remove();

            alert("Plan deleted successfully");

        } catch (err) {
            console.error("Delete error:", err);
            alert("Something went wrong");
        }
    };
});


loadPlans();