/* ////// SIDE BAR VARs ////// */
const account = document.querySelector(".account");
const depWith = document.querySelector(".dep-with");
const packages = document.querySelector(".packages");

const accountDropdown = document.querySelector(".account-dropdown");
const depWithDropdown = document.querySelector(".dep-with-dropdown");
const packagesDropdown = document.querySelector(".packages-dropdown");

/* ////// NAV BAR ////// */
const sideBar = document.querySelector(".user-side-bar");
const NavIcon = document.querySelector(".nav-menu-icon");
const removeNav = document.querySelector(".remove-nav-icon");

if (NavIcon) {
  NavIcon.addEventListener("click", () => {
    sideBar.classList.remove("active");
    NavIcon.classList.add("inactive");
    removeNav.classList.remove("inactive");
  });
}

if (removeNav) {
  removeNav.addEventListener("click", () => {
    sideBar.classList.add("active");
    removeNav.classList.add("inactive");
    NavIcon.classList.remove("inactive");
  });
}

if (account) account.addEventListener("click", () => accountDropdown.classList.toggle("inactive"));
if (depWith) depWith.addEventListener("click", () => depWithDropdown.classList.toggle("inactive"));
if (packages) packages.addEventListener("click", () => packagesDropdown.classList.toggle("inactive"));

/* ////// AUTH CHECK ////// */
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

if (!token || !user) {
  window.location.href = '/pages/login.html';
}

/* ////// LOGOUT ////// */
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/pages/login.html';
  });
}

/* ////// LOAD DASHBOARD DATA ////// */
const loadDashboard = async () => {
  try {
    const res = await fetch('/api/users/dashboard', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await res.json();
    console.log('Dashboard data:', data);

    if (!res.ok) {
      localStorage.clear();
      window.location.href = '/pages/login.html';
      return;
    }

    const welcomeEl = document.getElementById('welcomeName');
    const balanceEl = document.getElementById('balance');
    const profitEl = document.getElementById('profit');
    const totalPackagesEl = document.getElementById('totalPackages');
    const activePackagesEl = document.getElementById('activePackages');

    if (welcomeEl) welcomeEl.textContent = data.user.userName;
    if (balanceEl) balanceEl.textContent = data.user.balance.toFixed(2);
    if (profitEl) profitEl.textContent = data.totalProfit.toFixed(2);
    if (totalPackagesEl) totalPackagesEl.textContent = data.totalInvestment.length;
    if (activePackagesEl) activePackagesEl.textContent = data.activeInvestments.length;

  } catch (err) {
    console.error('Dashboard error:', err);
  }finally {
    const loader = document.getElementById('pageLoader');
    if (loader) loader.style.display = 'none';
    
  }
};

/* ////// LOAD TOTAL DEPOSITS ////// */
const loadTransactions = async () => {
  try {
    const res = await fetch('/api/users/transactions', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const transactions = await res.json();
    console.log('Transactions:', transactions);

    const totalDepositEl = document.getElementById('totalDeposit');

    if (totalDepositEl) {
      const totalDeposit = transactions
        .filter(t => t.type === 'deposit' && t.status === 'approved')
        .reduce((sum, t) => sum + t.amount, 0);
      totalDepositEl.textContent = totalDeposit.toFixed(2);
    }

  } catch (err) {
    console.error('Transactions error:', err);
  }
};


loadDashboard();
loadTransactions();