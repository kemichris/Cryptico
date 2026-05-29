const params = new URLSearchParams(window.location.search);
const planId = params.get("id") || sessionStorage.getItem("editPlanId");
const editPlanForm = document.getElementById('edit-plan-form')

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
        document.querySelector('[name="topUpInterval"]').value = plan.topUpInterval;
        document.querySelector('[name="topUpAmount"]').value = plan.topUpAmount;
        document.querySelector('[name="duration"]').value = plan.duration;

    } catch (err) {
        console.error(err);
    }
};

editPlanForm.addEventListener('submit', async (e)=> {
    e.preventDefault()

    try {
        
    } catch (error) {
        
    }
})

loadPlanEdit();