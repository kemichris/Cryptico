const inputs = document.querySelectorAll(".otp-input");
const form = document.getElementById("verify-form");
const emailText = document.getElementById("user-email");
const resendBtn = document.getElementById("resend-btn");

// Get email from session storage
const email = sessionStorage.getItem("verifyEmail");

if (!email) {
  alert("No verification session found. Please register again.");
  window.location.href = "/pages/register.html";
}

// show email on UI
emailText.textContent = email;

// ─── AUTO MOVE BETWEEN INPUTS ───────────────
inputs.forEach((input, index) => {
  input.addEventListener("input", () => {
    if (input.value.length === 1 && index < inputs.length - 1) {
      inputs[index + 1].focus();
    }
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" && !input.value && index > 0) {
      inputs[index - 1].focus();
    }
  });
});

// ─── SUBMIT OTP ──────────────────────────────
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const code = Array.from(inputs).map(i => i.value).join("");

  if (code.length !== 6) {
    alert("Please enter the full 6-digit code");
    return;
  }

  try {
    const btn = form.querySelector(".verify-btn");
    btn.disabled = true;
    btn.textContent = "Verifying...";

    const res = await fetch("/api/auth/verify-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        code
      })
    });

    const data = await res.json();

    if (res.ok) {
      alert("Email verified successfully 🎉");

      sessionStorage.removeItem("verifyEmail");

      window.location.href = "/pages/login.html";
    } else {
      alert(data.message || "Verification failed");
    }

  } catch (err) {
    console.error(err);
    alert("Server error. Try again.");
  } finally {
    const btn = form.querySelector(".verify-btn");
    btn.disabled = false;
    btn.textContent = "Verify Email";
  }
});

// ─── RESEND CODE (HOOK READY) ───────────────
resendBtn.addEventListener("click", async () => {
  try {
    resendBtn.disabled = true;
    resendBtn.textContent = "Sending...";

    const res = await fetch("/api/auth/resend-code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    });

    const data = await res.json();

    if (res.ok) {
      alert("New verification code sent");
    } else {
      alert(data.message || "Failed to resend code");
    }

  } catch (err) {
    console.error(err);
    alert("Server error");
  } finally {
    resendBtn.disabled = false;
    resendBtn.textContent = "Resend Code";
  }
});