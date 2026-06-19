const params = new URLSearchParams(window.location.search);
const planId = params.get("id") || sessionStorage.getItem("editPlanId");
const editPlanForm = document.getElementById('edit-plan-form')

if (!planId) {
   showToast("No plan selected")
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
        document.querySelector('[name="totalExpectedReturn"]').value = plan.totalExpectedReturn;
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

const totalExpectedInput = document.querySelector('input[name="totalExpectedReturn"]');
const topUpAmountInput = document.querySelector('input[name="topUpAmount"]');
const durationInput = document.querySelector('input[name="duration"]');
const intervalSelect = document.querySelector('select[name="topUpInterval"]');


// Convert interval to frequency per day
function getFrequency(interval) {
    switch (interval) {
        case 'hourly':
            return 24;
        case 'daily':
            return 1;
        case 'weekly':
            return 1 / 7;
        case 'monthly':
            return 1 / 30;
        case '10 minutes':
            return 144;
        case '30 minutes':
            return 48;
        default:
            return 0;
    }
}


// Calculate expected return
function calculateExpectedReturn() {
    const topUpAmount = Number(topUpAmountInput.value) || 0;
    const duration = Number(durationInput.value) || 0;
    const interval = intervalSelect.value;

    const frequencyPerDay = getFrequency(interval);

    const total = topUpAmount * duration * frequencyPerDay;

    totalExpectedInput.value = total.toFixed(2);
}


// Live updates
topUpAmountInput.addEventListener('input', calculateExpectedReturn);
durationInput.addEventListener('input', calculateExpectedReturn);
intervalSelect.addEventListener('change', calculateExpectedReturn);


editPlanForm.addEventListener('submit', async (e) => {
    e.preventDefault();

     const submitBtn = editPlanForm.querySelector('button[type="submit"]');
     submitBtn.disabled = true;
     submitBtn.textContent = 'Updating...';

    
    // ensure final calculation before submit
    calculateExpectedReturn();

    const formData = new FormData(planForm);
    const formObject = Object.fromEntries(formData.entries());

    // convert number fields
    formObject.price = Number(formObject.price);
    formObject.minAmount = Number(formObject.minAmount);
    formObject.maxAmount = Number(formObject.maxAmount);
    formObject.totalExpectedReturn = Number(formObject.totalExpectedReturn);
    formObject.giftBonus = Number(formObject.giftBonus);
    formObject.topUpAmount = Number(formObject.topUpAmount);
    formObject.duration = Number(formObject.duration);

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
            showToast(data.message || 'Failed to update plan')
            return;
        }

        showToast('Plan updated successfully');

        // optional: go back to plans page
        window.location.href = '/admin/plans.html';

    } catch (error) {
        console.error('Update plan error:', error);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save';
    }
});

loadPlanEdit();