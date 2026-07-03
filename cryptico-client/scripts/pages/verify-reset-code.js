const inputs = document.querySelectorAll(".otp-input");
const form = document.getElementById("verify-form");
const emailText = document.getElementById("user-email");
const resendBtn = document.getElementById("resend-btn");

// Get email from session storage
const email = sessionStorage.getItem("resetEmail");

if (!email) {
    alert("No verification session found. Please register again.");
    window.location.href = "/pages/forget.html";
}

// show email on UI
emailText.textContent = email;

// ─── AUTO MOVE BETWEEN INPUTS ───────────────
// inputs.forEach((input, index) => {
//     input.addEventListener("input", () => {
//         if (input.value.length === 1 && index < inputs.length - 1) {
//             inputs[index + 1].focus();
//         }
//     });

//     input.addEventListener("keydown", (e) => {
//         if (e.key === "Backspace" && !input.value && index > 0) {
//             inputs[index - 1].focus();
//         }
//     });
// });
inputs.forEach((input, index) => {
  input.addEventListener("input", () => {
    // Only allow numbers
    input.value = input.value.replace(/\D/g, "");

    // Move to the next input
    if (input.value.length === 1 && index < inputs.length - 1) {
      inputs[index + 1].focus();
    }

    // Auto-submit when all 6 digits are entered
    const code = Array.from(inputs).map(i => i.value).join("");

    if (code.length === 6) {
      form.requestSubmit();
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

        const res = await fetch(`${API_URL}/api/auth/verify-reset-code`, {
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
            sessionStorage.setItem("resetToken", data.resetToken);
            alert(data.message);
            window.location.href = "/pages/reset-password.html";
        } else {
            alert(data.message || "Verification failed");
        }

    } catch (err) {
        console.error(err);
        alert("Server error. Try again.");
    } finally {
        const btn = form.querySelector(".verify-btn");
        btn.disabled = false;
        btn.textContent = "Verify Code";
    }
});

// ─── RESEND CODE ───────────────
resendBtn.addEventListener("click", async () => {
    try {
        resendBtn.disabled = true;
        resendBtn.textContent = "Sending...";

        const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email })
        });

        const data = await res.json();

        if (res.ok) {
            alert(data.message);

            let countdown = 60;
            resendBtn.disabled = true;

            const timer = setInterval(() => {
                countdown--;
                resendBtn.textContent = `Resend (${countdown}s)`;

                if (countdown <= 0) {
                    clearInterval(timer);
                    resendBtn.disabled = false;
                    resendBtn.textContent = "Resend Code";
                }
            }, 1000);

        } else {
            resendBtn.disabled = false;
            resendBtn.textContent = "Resend Code";
            alert(data.message || "Failed to resend code");
        }

    } catch (error) {
        console.error(error);
        alert("Server error");
    } finally {
        resendBtn.disabled = false;
        resendBtn.textContent = "Resend Code";
    }
});