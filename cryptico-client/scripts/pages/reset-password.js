const resetPwdForm = document.getElementById("reset-pwd-form");
const resetToken = sessionStorage.getItem("resetToken");
const resetBtn = document.getElementById("reset-pwd");

resetPwdForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    const formInputs = new FormData(resetPwdForm);
    const formObject = Object.fromEntries(formInputs.entries());

    if (formObject.password !== formObject.confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    try {
        resetBtn.disabled = true;
        resetBtn.textContent = "Resetting...";
        const res = await fetch(`${API_URL}/api/auth/reset-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${resetToken}`,
            },
            body: JSON.stringify(formObject)
        });
        const data = await res.json();

        if (res.ok) {
            alert(data.message);

            // Clear reset session
            sessionStorage.removeItem("resetToken");
            sessionStorage.removeItem("resetEmail");

            // Redirect to login
            window.location.href = "/pages/login.html";
        } else {
            alert(data.message || "Failed to reset password.");
        }

    } catch (error) {
        console.error(error);
        alert("Something went wrong. Please try again.");
    } finally {
        resetBtn.disabled = false;
        resetBtn.textContent = "Reset Password";
    }
});