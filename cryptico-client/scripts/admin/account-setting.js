const profileForm = document.getElementById("profile-form");

// load profile
const loadProfile = async () => {
    try {
        const res = await fetch(`${API_URL}/api/admin/profile`, {
            headers: {
                Authorization: `Bearer ${Auth.getToken()}`
            }
        });

        const data = await res.json();

        if (res.ok) {
            hideLoader()
        } else {
            showToast(data.message || "Failed to load profile");
            setTimeout(() => {
                window.location.href = "/admin/dashboard.html";
            }, 2000);
            return
        }

        profileForm.userName.value = data.userName || "";
        profileForm.fullName.value = data.fullName || "";
        profileForm.email.value = data.email || "";
        profileForm.phoneNumber.value = data.phoneNumber || "";

    } catch (error) {
        console.error(error);
        showToast("Something went wrong");
    }
};


// updte profile 
const updateBtn = document.getElementById("update-btn");

profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(profileForm);
    const dataObject = Object.fromEntries(formData.entries());

    try {
        updateBtn.disabled = true;
        updateBtn.innerText = "Updating...";

        const res = await fetch(`${API_URL}/api/admin/profile`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${Auth.getToken()}`
            },
            body: JSON.stringify(dataObject)
        });

        const data = await res.json();

        if (res.ok) {
            showToast(data.message || "Profile updated successfully");

            // Refresh the form with the latest data
            loadProfile();
        } else {
            showToast(data.message || "Failed to update profile");
        }

    } catch (error) {
        console.error(error);
        showToast("Something went wrong");
    } finally {
        updateBtn.disabled = false;
        updateBtn.innerText = "Update Profile";
    }
});

loadProfile();