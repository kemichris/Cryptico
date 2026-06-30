const form = document.getElementById("registration");
const regBtn = document.getElementById("reg-btn")

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

    // Prevent multiple clicks
    regBtn.disabled = true;
    regBtn.textContent = "Processing...";

    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataObject)
    });

    const data = await res.json();
    console.log('Response:', data);

    if (res.ok) {
      alert(data.message);
      // store email temporarily for OTP page
      sessionStorage.setItem("verifyEmail", data.email);

      // redirect to OTP page
      window.location.href = "/pages/verify-email.html";
    } else {
      alert(data.message);
    }

  } catch (err) {
    console.error('Fetch error:', err);
    alert('Something went wrong: ' + err.message);
  } finally {
    regBtn.disabled = false;
    regBtn.textContent = "Register";
  }
});