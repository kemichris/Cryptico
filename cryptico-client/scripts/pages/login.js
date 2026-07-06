const form = document.getElementById("login");
const loginBtn = document.getElementById("login-btn")

form.addEventListener("submit", async (e) => {
    e.preventDefault()

    const formData = new FormData(form)
    const dataObject = Object.fromEntries(formData.entries())

    // see exactly what is being sent
    console.log('Sending:', dataObject);

    try {
        loginBtn.disabled = true;
        loginBtn.innerText = "signing in..."
        const res = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataObject)
        })

        const data = await res.json();
        console.log('Response:', data);
        if (res.ok) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            window.location.href = "/dashboard/users-dashboard.html";
        } else {
            // Handle unverified email specifically
            if (res.status === 403 && data.emailVerified === false) {
                sessionStorage.setItem("verifyEmail", data.email);
                window.location.href = "/pages/verify-email.html";
                return;
            }
            // Handle all other errors
            alert(data.message || "Login failed");
        }
    } catch (err) {
        // this will show if fetch itself fails
        console.error('Fetch error:', err);
        alert('Something went wrong: ' + err.message);
    } finally {
        loginBtn.disabled = false;
        loginBtn.innerText = "Login"
    }
})