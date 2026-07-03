const forgetEmail = document.getElementById("forget-email");
const forgetForm = document.getElementById("forget-form");
const forgetBtn = document.getElementById("forget-btn");

forgetForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = forgetEmail.value.trim();

    try {
        forgetBtn.disabled = true;
        forgetBtn.textContent = "Sending...";

        const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
        });

        const data = await res.json();

        if (res.ok) {
            sessionStorage.setItem("resetEmail", email);
            alert(data.message);
            window.location.href = "/pages/verify-reset-code.html";
        } else {
            alert(data.message || "Failed to send reset code.");
        }

    } catch (error) {
        console.error(error);
        alert("Something went wrong.");
    } finally {
        forgetBtn.disabled = false;
        forgetBtn.textContent = "Send Reset Code";
    }
});