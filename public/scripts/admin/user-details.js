const usersActionDropdown = document.querySelector(".users-action-dropdown");
const usersActionBtn = document.getElementById("users-action-btn");

// Toggle dropdown visibility
usersActionBtn.addEventListener("click", () => {
    usersActionDropdown.classList.toggle("active");
});

// Get user ID from URL or session storage
const params = new URLSearchParams(window.location.search);
const userId = params.get("id") || sessionStorage.getItem("userId");

if (!userId) {
    alert("No user selected");
    window.location.href = "/admin/manage-users.html";
}

//////// Get user details and display ////////
const getUserDetails = async () => {
    try {
        const res = await fetch(`/api/admin/users/${userId}`, {
            headers: {
                Authorization: `Bearer ${Auth.getToken()}`
            }
        });

        if (!res.ok) {
            localStorage.clear();
            window.location.href = "/admin/login.html";
            return;
        }

        const data = await res.json();
        const user = data.oneUser;

        console.log("User details:", user);

        // display user details
        const actionContainerUserName = document.getElementById("account-action-user")
        const userNameDisplayEl = document.getElementById("userNameDisplay");
        const accountBalanceEl = document.getElementById("account-balance");
        const profitEl = document.getElementById("profit");
        const referralBonusEl = document.getElementById("referral-bonus");
        const totalInvestedEl = document.getElementById("total-invested");
        const accountStatusEl = document.getElementById("account-status");
        const kycStatusEl = document.getElementById("kyc-status");
        // const roiModeEl = document.getElementById("roi-mode");
        const fullNameEl = document.getElementById("fullName");
        const userNameEl = document.getElementById("userName");
        const emailEl = document.getElementById("email");
        const phoneNumberEl = document.getElementById("phoneNumber");
        const countryEl = document.getElementById("country");
        const registrationDateEl = document.getElementById("registrationDate");

        if (actionContainerUserName) actionContainerUserName.textContent = user.userName;
        if (userNameDisplayEl) userNameDisplayEl.textContent = user.userName;
        if (accountBalanceEl) accountBalanceEl.textContent = user.balance.toFixed(2);
        if (profitEl) profitEl.textContent = user.totalEarnings.toFixed(2);
        if (referralBonusEl) referralBonusEl.textContent = user.referralBonus.toFixed(2);
        if (totalInvestedEl) totalInvestedEl.textContent = user.totalInvested.toFixed(2);
        if (accountStatusEl) accountStatusEl.textContent = user.isActive ? 'Active' : 'Inactive';
        if (kycStatusEl) kycStatusEl.textContent = user.kycStatus;
        // if (roiModeEl) roiModeEl.textContent = user.roiMode ? "On" : "Off";

        if (fullNameEl) fullNameEl.textContent = user.fullName;
        if (userNameEl) userNameEl.textContent = user.userName;
        if (emailEl) emailEl.textContent = user.email;
        if (phoneNumberEl) phoneNumberEl.textContent = user.phoneNumber;
        if (countryEl) countryEl.textContent = user.country;
        if (registrationDateEl) registrationDateEl.textContent = new Date(user.createdAt).toLocaleDateString();

    } catch (error) {
        console.error("Error fetching user details:", error);
    } finally {
        hideLoader();
    }
}

///////// view plans button click ////////
const viewPlansBtn = document.querySelector(".view-plans-btn");
if (viewPlansBtn) {
    viewPlansBtn.addEventListener("click", () => {
        // Store userId in session storage and navigate to plans page
        sessionStorage.setItem("userId", userId);
        window.location.href = `/admin/user-investment-plans.html?id=${userId}`;
    });
}

//////// KYC status update ////////
const verifyKycBtn = document.getElementById("verify-kyc-btn");
if (verifyKycBtn) {
    verifyKycBtn.addEventListener("click", async () => {
        try {
            const res = await fetch(`/api/admin/kyc/${userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${Auth.getToken()}`
                },
                body: JSON.stringify({ kycStatus: "verified" })
            });

            const data = await res.json();
            if (res.ok) {
                alert(data.message || "KYC verified successfully");
                getUserDetails(); // Refresh user details to show updated KYC status
            } else {
                alert(data.message || "Failed to verify KYC");
            }
        } catch (error) {
            console.error("Error verifying KYC:", error);
            alert("An error occurred while verifying KYC");
        }
    });
}

//////// Toggle account status //////// 
const toggleStatusBtn = document.getElementById("toggle-account-status-btn");
toggleStatusBtn.addEventListener("click", async () => {
    try {
        const res = await fetch(`/api/admin/users/${userId}/toggle-status`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${Auth.getToken()}`
            }
        });

        const data = await res.json();

        if (res.ok) {
            alert(data.message);
            getUserDetails(); // refresh UI
        } else {
            alert(data.message);
        }

    } catch (error) {
        console.error(error);
    }
});

///////// Edit user ////////
const editUserBtn = document.getElementById("edit-user");
const closeEdit = document.getElementById("close-edit-user");
const editUserContainer = document.getElementById("edit-user-container")
const editUserForm = document.getElementById("edit-user-form");

editUserBtn.addEventListener("click", async () => {
    usersActionDropdown.classList.toggle("active");

    try {
        const res = await fetch(`/api/admin/users/${userId}`, {
            headers: {
                Authorization: `Bearer ${Auth.getToken()}`
            }
        });

        const data = await res.json();
        const user = data.oneUser;

        document.getElementById('edit-display-name').innerHTML = `Edit ${user.fullName} details`
        document.querySelector('[name="userName"]').value = user.userName;
        document.querySelector('[name="fullName"]').value = user.fullName;
        document.querySelector('[name="email"]').value = user.email
        document.querySelector('[name="phoneNumber"]').value = user.phoneNumber;
        document.querySelector('[name="country"]').value = user.country;

    } catch (error) {
        console.error(error)
    } finally {
        editUserContainer.classList.add("active")
    }

});

closeEdit.addEventListener("click", () => {
    editUserContainer.classList.remove("active")
});

editUserForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    const formEditData = new FormData(editUserForm);
    const formEditObject = Object.fromEntries(formEditData.entries());

    try {
        const res = await fetch(`/api/admin/users/${userId}`, {
            method: 'PATCH',
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${Auth.getToken()}`
            },
            body: JSON.stringify(formEditObject)
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.message || 'Failed to update user');
            return;
        }

        alert('User updated successfully');

        // optional: go back to plans page
        window.location.href = '/admin/user-details.html';

    } catch (error) {
        console.error('Update user error:', error)
    }
})

//////// Login as User ////////
const loginAsUserBtn = document.getElementById("login-as-user-btn")
loginAsUserBtn.addEventListener("click", async () => {
    const confirmLogin = confirm("You are about to login as this User?");
    if (!confirmLogin) {
        alert("login cancelled");
        return;
    }

    try {
        const res = await fetch(`/api/admin/users/${userId}/impersonate`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${Auth.getToken()}`
            }
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.message);
            return;
        }

        // store NEW token (user token, not admin token)
        localStorage.setItem("token", data.token);

        // redirect to user dashboard
        window.location.href = "/dashboard/users-dashboard.html";

    } catch (err) {
        console.error(err);
    }
});

//////// Delete User ////////
const deleteUserBtn = document.getElementById("delete-user-btn")
if (deleteUserBtn) {
    deleteUserBtn.addEventListener("click", async () => {
        const confirmDelete = confirm("Are you sure you want to delete this User?");
        if (!confirmDelete) {
            alert("Deletion cancelled");
            return;
        }

        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${Auth.getToken()}`
                }
            });

            const data = await res.json()

            if (!res.ok) {
                alert(data.message || "Failed to delete User");
                return;
            }

            alert(data.message)

            window.location.href = '/admin/manage-users.html';

        } catch (error) {
            console.error(error)
            alert("Something went wrong");
        }
    })
}




getUserDetails();

