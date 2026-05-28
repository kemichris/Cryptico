const form = document.getElementById("registration");

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const dataObject = Object.fromEntries(formData.entries());

  // check passwords match before sending to server
  if (dataObject.password !== dataObject.confirmPassword) {
    alert('Passwords do not match');
    return;
  }

  // remove confirmPassword and terms — server doesn't need them
  delete dataObject.confirmPassword;
  delete dataObject.terms;

  console.log('Sending:', dataObject);

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataObject)
    });

    const data = await res.json();
    console.log('Response:', data);

    if (res.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = '/dashboard/users-dashboard.html';
    } else {
      alert(data.message);
    }

  } catch (err) {
    console.error('Fetch error:', err);
    alert('Something went wrong: ' + err.message);
  }
});