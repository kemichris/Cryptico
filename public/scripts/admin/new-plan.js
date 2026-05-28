const planForm = document.getElementById('plan-form');

planForm.addEventListener('submit', async (e)=> {
    e.preventDefault() 

    const formData = new FormData(planForm);
    const formObject = Object.fromEntries(formData.entries())

    

    try {
        const res = await fetch('/api/admin/plans', {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataObject)        
        })
    } catch (error) {
        
    }
})