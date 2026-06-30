// redirect if not logged in
if (!Auth.getToken() || !Auth.getUser()) {
    window.location.href = "/admin/login.html";
}

// redirect if not admin
if (Auth.getUser().role !== "admin") {
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

 const latestUsers = document.getElementById("latest-users");


const loadDashboardData = async () => {
    try {
        const res = await fetch(`${API_URL}/api/admin/dashboard`, {
            headers: { Authorization: `Bearer ${Auth.getToken()}` },
        });

        const data = await res.json();
        console.log("Dashboard data:", data);

        if (!res.ok) {
            localStorage.clear();
            window.location.href = "/admin/login.html";
            return;
        }

        const adminNameMain = document.getElementById("admin-name-main")
        const adminName = document.getElementById("admin-name")
        const totalUsers = document.getElementById("total-users");
        const activeSubs = document.getElementById("active-subs");
        const totalWithdrawals = document.getElementById("total-with");
        const totalDepostis = document.getElementById("total-deposits");
        const blockedUsers = document.getElementById("blocked-users");
        const activeUsers = document.getElementById("active-users");
        const pendingWithdrawals = document.getElementById("pending-with");
        const pendingDeposits = document.getElementById("pending-deposits");

        if(adminNameMain) adminNameMain.textContent = data.adminName;
        if(adminName) adminName.textContent = data.adminName;
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
       
        if (latestUsers) {
            latestUsers.innerHTML = "";

            if (!data.recentUsers.length) {
                latestUsersContainer.innerHTML = `<p>No users found</p>`;
            }

            data.recentUsers.forEach((user) => {
                latestUsers.innerHTML += `
            <div class="user latest-u flex" data-id="${user._id}">
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
        hideLoader();
    }
};



latestUsers.addEventListener("click", (e) => {
    const userCard = e.target.closest(".latest-u");
    if (!userCard) return;
    
    const userId = userCard.dataset.id;
    sessionStorage.setItem("userId", userId);
    window.location.href = `/admin/user-details.html?id=${userId}`;
});

loadDashboardData();
