const form = document.getElementById("login");

form.addEventListener("submit", async (e) => {
    e.preventDefault()

    const formDate = new FormData(form)
    const dataObject = Object.fromEntries(formDate.entries())

    // see exactly what is being sent
    console.log('Sending:', dataObject);

    try {
        const res = await fetch("/api/auth/login", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataObject)
        })

        const data = await res.json();
        console.log('Response:', data);
        if (res.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = '/dashboard/users-dashboard.html';
        } else {
            alert(data.message);
        }
    } catch (err) {
        // this will show if fetch itself fails
        console.error('Fetch error:', err);
        alert('Something went wrong: ' + err.message);
    }
})