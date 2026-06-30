hideLoader()
const adminForm = document.getElementById("admin-form");
const saveBtn = document.getElementById("save-btn")

adminForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(adminForm);
  const dataObject = Object.fromEntries(formData.entries());

  // check passwords match before sending to server
  if (dataObject.password !== dataObject.confirmPassword) {
    showToast('Passwords do not match');
    return;
  }

  // remove confirmPassword and terms — server doesn't need them
  delete dataObject.confirmPassword;

  console.log('Sending:', dataObject);

  try {

    // Prevent multiple clicks
    saveBtn.disabled = true;
    saveBtn.textContent = "Processing...";

    const res = await fetch(`${API_URL}/api/auth/register-admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataObject)
    });

    const data = await res.json();
    console.log('Response:', data);

    if (res.ok) {
      showToast(data.message);
      window.location.href = "/admin/manage-admins.html";
    } else {
      showToast(data.message);
    }

  } catch (err) {
    console.error('Fetch error:', err);
    showToast('Something went wrong: ' + err.message);
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerHTML = `<i class="fa-solid fa-plus"></i> Save`;
  }
});