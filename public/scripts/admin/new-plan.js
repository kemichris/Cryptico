const planForm = document.getElementById('plan-form');

planForm.addEventListener('submit', async (e) => {

    e.preventDefault();

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

        // send request
        const res = await fetch('/api/admin/plans', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${Auth.getToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formObject)
        });

        // parse response
        const data = await res.json();

        console.log('Response:', data);

        // success
        if (res.ok) {

            alert('Plan created successfully');

            planForm.reset();

            window.location.href = '/admin/plans.html';

        } else {

            alert(data.message || 'Something went wrong');
        }

    } catch (error) {

        console.error('Plan error:', error);

        alert('Server error');
    } finally {
        hideLoader();
    }
});