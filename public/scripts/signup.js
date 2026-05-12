const form = document.getElementById("registration");

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const dataObject = Object.fromEntries(formData.entries());

  // check passwords match
  if (dataObject.password !== dataObject.confirmPassword) {
    alert('Passwords do not match');
    return;
  }

  // remove fields server doesn't need
  delete dataObject.confirmPassword;
  delete dataObject.terms;

  // see exactly what is being sent
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
      window.location.href = '/dashboard/index.html';
    } else {
      alert(data.message);
    }

  } catch (err) {
    // this will show if fetch itself fails
    console.error('Fetch error:', err);
    alert('Something went wrong: ' + err.message);
  }
});