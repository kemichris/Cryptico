const params = new URLSearchParams(window.location.search);
const planId = params.get("id") || sessionStorage.getItem("editPlanId");

if (!planId) {
    alert("No plan selected");
    window.location.href = "/admin/plans.html";
}

const loadPlanEdit = async () => {
    try {
        const res = await fetch(`/api/admin/plans/${planId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await res.json();
        const plan = data.plan;

        // fill form
        document.querySelector('[name="name"]').value = plan.name;
        document.querySelector('[name="price"]').value = plan.price;
        document.querySelector('[name="minAmount"]').value = plan.minAmount;
        document.querySelector('[name="maxAmount"]').value = plan.maxAmount;
        document.querySelector('[name="minRoi"]').value = plan.minRoi;
        document.querySelector('[name="maxRoi"]').value = plan.maxRoi;
        document.querySelector('[name="giftBonus"]').value = plan.giftBonus;
        document.querySelector('[name="duration"]').value = plan.duration;

    } catch (err) {
        console.error(err);
    }
};

loadPlanEdit();