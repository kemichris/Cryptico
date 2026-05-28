// profile setting
const profile = document.getElementById("account");

const profileDropdown = document.querySelector(".user-setting-dropdown");

profile.addEventListener("click", () => {
    toggleDropdown(profileDropdown);
});

// script for the side menu functionality
const investment = document.querySelector(".investment");
const investmentDropdown = document.querySelector(".investment-dropdown");
const administrator = document.querySelector(".administrator");
const administratorDropdown = document.querySelector(".administrator-dropdown");
const setting = document.querySelector(".setting");
const settingDropdown = document.querySelector(".setting-dropdown");
const navMenuIcon = document.querySelector(".nav-menu-icon");
const sieMenu = document.getElementById("side-menu");

investment.addEventListener("click", () => {
    toggleDropdown(investmentDropdown);
});
administrator.addEventListener("click", () => {
    toggleDropdown(administratorDropdown);
});
setting.addEventListener("click", () => {
    toggleDropdown(settingDropdown);
});

navMenuIcon.addEventListener("click", () => {
    sieMenu.classList.toggle("active");
});

function toggleDropdown(dropdown) {
    dropdown.classList.toggle("inactive");
}

/* ////// ADMIN AUTH CHECK ////// */
const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

// redirect if not logged in
if (!token || !user) {
    window.location.href = "/admin/login.html";
}

// redirect if not admin
if (user.role !== "admin") {
    window.location.href = "/pages/login.html";
}

/* ////// ADMIN LOGOUT ////// */
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/admin/login.html";
    });
}

const loadDashboardData = async () => {
    try {
        const res = await fetch("/api/admin/dashboard", {
            headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        console.log("Dashboard data:", data);

        if (!res.ok) {
            localStorage.clear();
            window.location.href = "/admin/login.html";
            return;
        }

        const adminName = document.getElementById("admin-name")
        const totalUsers = document.getElementById("total-users");
        const activeSubs = document.getElementById("active-subs");
        const totalWithdrawals = document.getElementById("total-with");
        const totalDepostis = document.getElementById("total-deposits");
        const blockedUsers = document.getElementById("blocked-users");
        const activeUsers = document.getElementById("active-users");
        const pendingWithdrawals = document.getElementById("pending-with");
        const pendingDeposits = document.getElementById("pending-deposits");

        if(adminName) adminName.textContent = adminName.userName;
        if (totalUsers) totalUsers.textContent = data.totalUsers;
        if (activeSubs) activeSubs.textContent = data.activeSubscribers || 0;
        if (totalWithdrawals)
            totalWithdrawals.textContent = data.totalWithdrawals.toFixed(2);
        if (totalDepostis)
            totalDepostis.textContent = data.totalDeposits.toFixed(2);
        if (blockedUsers) blockedUsers.textContent = data.blockedUsers;
        if (activeUsers) activeUsers.textContent = data.activeUsers;
        if (pendingWithdrawals)
            pendingWithdrawals.textContent = data.pendingWithdrawals;
        if (pendingDeposits) pendingDeposits.textContent = data.pendingDeposits;

        // loading Latest users
        const latestUsers = document.getElementById("latest-users");


        if (latestUsers) {
            latestUsers.innerHTML = "";

            if (!data.recentUsers.length) {
                latestUsersContainer.innerHTML = `<p>No users found</p>`;
            }

            data.recentUsers.forEach((user) => {
                latestUsers.innerHTML += `
            <div class="user flex">
                <div class="user-name-email">
                    <p class="latest-user-name">${user.fullName}</p>
                    <p class="latest-user-mail">${user.email}</p>
                </div>
                <i class="fa-solid fa-arrow-right"></i>
            </div>
        `;
            });
        }
    } catch (error) {
        console.error("Dashboard error:", error);
    } finally {
        const loader = document.getElementById("pageLoader");
        if (loader) loader.style.display = "none";
    }
};

loadDashboardData();
