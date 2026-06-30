 hideLoader();
const planForm = document.getElementById('plan-form');

const totalExpectedInput = document.querySelector('input[name="totalExpectedReturn"]');
const topUpAmountInput = document.querySelector('input[name="topUpRate"]');
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


// Submit handler
planForm.addEventListener('submit', async (e) => {

    e.preventDefault();

    const submitBtn = planForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';

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

        const res = await fetch(`${API_URL}/api/admin/plans`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${Auth.getToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formObject)
        });

        const data = await res.json();

        console.log('Response:', data);

        if (res.ok) {
            showToast('Plan created successfully')
            planForm.reset();
            window.location.href = '/admin/plans.html';
        } else {
            showToast(data.message || 'Something went wrong')
        }

    } catch (error) {
        console.error('Plan error:', error);
    } finally {
        hideLoader();
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save';
    }
});