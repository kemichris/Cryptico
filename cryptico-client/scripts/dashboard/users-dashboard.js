/* ////// AUTH CHECK ////// */
if (!Auth.getToken() || !Auth.getUser()) {
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

const logoutBtnSideMenu = document.getElementById('logoutBtnSide');
if (logoutBtnSideMenu) {
  logoutBtnSideMenu.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/pages/login.html';
  });
}


/* ////// LOAD DASHBOARD DATA ////// */
const loadDashboard = async () => {
  try {
    const res = await fetch(`${API_URL}/api/users/dashboard`, {
      headers: { 'Authorization': `Bearer ${Auth.getToken()}` }
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
    const totalProfit = document.getElementById('total-profit');
    const runningProfit = document.getElementById('running-profit');
    const totalPackagesEl = document.getElementById('totalPackages');
    const activePackagesEl = document.getElementById('activePackages');

    if (welcomeEl) welcomeEl.textContent = data.user.userName;
    if (balanceEl) balanceEl.textContent = data.user.balance.toFixed(2);
    if (totalProfit) totalProfit.textContent = data.totalProfit.toFixed(2);
    if (runningProfit) runningProfit.textContent = data.runningProfit.toFixed(2);
    if (totalPackagesEl) totalPackagesEl.textContent = data.totalPackages;
    if (activePackagesEl) activePackagesEl.textContent = data.activePackages;

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
    const res = await fetch(`${API_URL}/api/users/transactions`, {
      headers: { 'Authorization': `Bearer ${Auth.getToken()}` }
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