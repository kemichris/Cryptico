const userForm = document.getElementById("user-form");

// Display users info
const profile = async () => {
    const userData = new FormData(userForm)

    try {
        const res = await fetch('/api/users/profile', {
            headers: { Authorization: `Bearer ${token}` }
        });

        // check ok BEFORE parsing
        if (!res.ok) {
            localStorage.clear();
            window.location.href = '/pages/login.html';
            return;
        }

        const data = await res.json()
        console.log(data)

        // update the data on profile
        // Populate form fields
        Object.keys(data).forEach(key => {
            const input = userForm.querySelector(`[name="${key}"]`);
            if (input) input.value = data[key] || '';
        });

    } catch (error) {
        console.error('Profile loadind error', error)
    }
}

// Edit users info 
const editBtn = document.getElementById('edit-btn');
const saveBtn = document.getElementById('save-btn');
const editableFields = ['userName', 'phoneNumber'];

editBtn.addEventListener('click', () => {
    editableFields.forEach(field => {
        const input = userForm.querySelector(`[name="${field}"]`);
        if (input) {
            input.removeAttribute('readonly');
            input.classList.add('editable');
        }
    })

    editBtn.hidden = true;
    saveBtn.hidden = false;

})

userForm.addEventListener('submit', async (e) => { 
    e.preventDefault();

    editableFields.forEach(field => {
        const input = userForm.querySelector(`[name="${field}"]`);
        if (input) {
            input.setAttribute('readonly', true);
            input.classList.remove('editable');
        }
    });

    editBtn.hidden = false;
    saveBtn.hidden = true;

    try {
        const res = await fetch('/api/users/profile', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                userName: userForm.querySelector('[name="userName"]').value,
                phoneNumber: userForm.querySelector('[name="phoneNumber"]').value,
            })
        });

        if (!res.ok) {
            localStorage.clear();
            window.location.href = '/pages/login.html';
            return;
        }

        const data = await res.json();
        console.log(data);

    } catch (error) {
        console.error('Update error:', error);
    }
});




profile()