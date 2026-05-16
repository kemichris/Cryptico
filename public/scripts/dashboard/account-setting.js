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


profile()