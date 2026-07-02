const loginForm = document.getElementById('admin-login');
const loginBtn = document.getElementById("login-btn")


loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(loginForm);
  const dataObject = Object.fromEntries(formData.entries());

  try {
    loginBtn.disabled = true;
    loginBtn.innerText = "signing in..."
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataObject)
    });

    const data = await res.json();
    console.log('Response:', data);

    if (res.ok) {
      // check if user is actually an admin
      if (data.user.role !== 'admin') {
        alert('Access denied. Admins only.');
        return;
      }

      // save token and user
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // redirect to admin dashboard
      window.location.href = '/admin/dashboard.html';

    } else {
      alert(data.message);
    }

  } catch (err) {
    console.error('Login error:', err);
    alert('Something went wrong: ' + err.message);
  } finally {
    loginBtn.disabled = false;
    loginBtn.innerText = "Login"
  }
});