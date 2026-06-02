// Get user ID from URL or session storage
const params = new URLSearchParams(window.location.search);
const userId = params.get("id") || sessionStorage.getItem("userId");

if (!userId) {
    alert("No user selected");
    window.location.href = "/admin/manage-users.html";
}

// Get user details and display

const getUserDetails = async () => {
    try {
        const res = await fetch(`/api/admin/users/${userId}`, {
            headers: {
                Authorization: `Bearer ${Auth.getToken()}`
            }
        });

        const data = await res.json();
        const user = data.oneUser;

        console.log("User details:", user);

        // display user details
        const userNameDisplayEl = document.getElementById("userNameDisplay");
        const accountBalanceEl = document.getElementById("account-balance");
        const profitEl = document.getElementById("profit");
        // const referralBonusEl = document.getElementById("referral-bonus");
        // const bonusEl = document.getElementById("bonus");
        const accountStatusEl = document.getElementById("account-status");
        const kycStatusEl = document.getElementById("kyc-status");
        // const roiModeEl = document.getElementById("roi-mode");
        const fullNameEl = document.getElementById("fullName");
        const userNameEl = document.getElementById("userName");
        const emailEl = document.getElementById("email");
        const phoneNumberEl = document.getElementById("phoneNumber");
        const countryEl = document.getElementById("country");
        const registrationDateEl = document.getElementById("registrationDate");

        if (userNameDisplayEl) userNameDisplayEl.textContent = user.userName;
        if (accountBalanceEl) accountBalanceEl.textContent = user.balance.toFixed(2);
        if (profitEl) profitEl.textContent = user.totalEarnings.toFixed(2);
        // if (referralBonusEl) referralBonusEl.textContent = user.referralBonus.toFixed(2);
        // if (bonusEl) bonusEl.textContent = user.bonus.toFixed(2);
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

getUserDetails();

