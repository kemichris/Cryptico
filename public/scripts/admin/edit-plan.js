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
                Authorization: `Bearer ${Auth.getToken()}`
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
    } finally {
        hideLoader();
    }
};

editPlanForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // collect form values
    const formData = new FormData(editPlanForm);
    const formObject = Object.fromEntries(formData.entries());

    try {
        const res = await fetch(`/api/admin/plans/${planId}`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${Auth.getToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formObject)
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.message || 'Failed to update plan');
            return;
        }

        alert('Plan updated successfully');

        // optional: go back to plans page
        window.location.href = '/admin/plans.html';

    } catch (error) {
        console.error('Update plan error:', error);
        alert('Something went wrong');
    }
});

loadPlanEdit();