hideLoader()

const passwordForm = document.getElementById("password-form");
const pwdBtn = document.getElementById("change-pwd-btn")

passwordForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    const form = new FormData(passwordForm);
    const formObject = Object.fromEntries(form.entries());

    // check passwords match before sending to server
    if (formObject.newPassword !== formObject.confirmPassword) {
        showToast('New passwords do not match');
        return;
    }

    delete formObject.confirmPassword;

    try {
        pwdBtn.disabled = true;
        pwdBtn.innerText = "Saving password..."

        const res = await fetch(`${API_URL}/api/auth/change-password`, {
            method: "PUT",

            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${Auth.getToken()}`
             },
            body: JSON.stringify(formObject)
        });

        const data = await res.json()

        if (res.ok) {
            showToast(data.message)
        } else {
            showToast(data.message)
        }

    } catch (error) {
        console.error(error)
        // showToast("something went wrong")
    } finally {
        pwdBtn.disabled = false;
        pwdBtn.innerText = "Submit"
    }
})