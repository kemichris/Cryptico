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

NavIcon.addEventListener("click", () => {
  sideBar.classList.remove("active");
  NavIcon.classList.add("inactive");
  removeNav.classList.remove("inactive");
});

removeNav.addEventListener("click", () => {
  sideBar.classList.add("active");
  removeNav.classList.add("inactive");
  NavIcon.classList.remove("inactive");
});

account.addEventListener("click", () => {
  accountDropdown.classList.toggle("inactive");
});
depWith.addEventListener("click", () => {
  depWithDropdown.classList.toggle("inactive");
});
packages.addEventListener("click", () => {
  packagesDropdown.classList.toggle("inactive");
});

/* ////// AUTH CHECK ////// */
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

if (!token || !user) {
  window.location.href = '/pages/login.html';
}

/* ////// LOGOUT ////// */
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/pages/login.html';
});

/* ////// LOAD DASHBOARD DATA ////// */
const loadDashboard = async () => {
  try {
    // fetch dashboard data
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

    // populate welcome name
    document.getElementById('welcomeName').textContent = data.user.fullName;

    // populate balance and profit
    document.getElementById('balance').textContent = 
      data.user.balance.toFixed(2);
    document.getElementById('profit').textContent = 
      data.user.totalEarnings.toFixed(2);

    // populate packages
    document.getElementById('totalPackages').textContent = 
      data.activeInvestments.length;
    document.getElementById('activePackages').textContent = 
      data.activeInvestments.length;

  } catch (err) {
    console.error('Dashboard error:', err);
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

    // sum only approved deposits
    const totalDeposit = transactions
      .filter(t => t.type === 'deposit' && t.status === 'approved')
      .reduce((sum, t) => sum + t.amount, 0);

    document.getElementById('totalDeposit').textContent = 
      totalDeposit.toFixed(2);

  } catch (err) {
    console.error('Transactions error:', err);
  }
};

// run both on page load
loadDashboard();
loadTransactions();