// opening the payment method modal
const modal = document.getElementById("paymentModal");
const openBtn = document.getElementById("add-payment-method-btn");
const closeBtn = document.getElementById("closePaymentModal");

openBtn.addEventListener("click", () => {
    modal.classList.remove("active");
});

closeBtn.addEventListener("click", () => {
    modal.classList.add("active");
});

// click outside closes modal
modal.addEventListener("click", (e) => {

    if (e.target === modal) {
        modal.classList.add("active");

    }

});

// selecting the payment type 
const paymentType = document.getElementById("payment-type");

const bankFields = document.querySelectorAll(".bank-field");

const cryptoFields = document.querySelectorAll(".crypto-field");

function toggleFields() {

    if (paymentType.value === "currency") {

        bankFields.forEach(field => {
            field.classList.remove("active");
        });

        cryptoFields.forEach(field => {
            field.classList.add("active");
        });

    } else {

        bankFields.forEach(field => {
            field.classList.add("active");
        });

        cryptoFields.forEach(field => {
            field.classList.remove("active");
        });

    }

}

paymentType.addEventListener("change", toggleFields);

toggleFields();

// load payment methods
const tbBody = document.querySelector(".tbody");

const loadPaymentMethods = async () => {
    try {
        const res = await fetch("/api/admin/payment-methods", {
            headers: { Authorization: `Bearer ${Auth.getToken()}` }
        })

        if (!res.ok) {
            localStorage.clear();
            window.location.href = "/admin/login.html";
            return;
        }
        const paymentMethodData = await res.json();

        tbBody.innerHTML = "";

        // handle empty state
        if (!paymentMethodData || paymentMethodData.length === 0) {
            tbBody.innerHTML = '<tr><td colspan="5" style="text-align:center">No payment methods found</td></tr>';
            return;
        }

        paymentMethodData.forEach(paymentMethod => {
            const tr = document.createElement("tr")
            tr.className = "tr"
            tr.innerHTML = `
                <td>${paymentMethod.name}</td>
                <td>${paymentMethod.type}</td>
                <td>${paymentMethod.availableFor}</td>
                <td>${paymentMethod.status}</td>
                <td class="deposit-action">
                    <button class="manage-btn" data-id="${paymentMethod._id}"><i class="fa-solid fa-pen"></i></button>
                    <button class="del-btn" data-id="${paymentMethod._id}">Delete</button>
                    <button class="complete-btn toggle-status-btn" data-id="${paymentMethod._id}" data-status="${paymentMethod.status}">
                        ${paymentMethod.status === "enabled" ? "Disable" : "Enable"}
                    </button>
                </td>

            `;
            tbBody.appendChild(tr)
        })

    } catch (error) {
        console.error(error)
    } finally {
        hideLoader();
    }
}


// Create payment method
const paymentMethodForm = document.getElementById("payment-setting");

paymentMethodForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(paymentMethodForm);

    try {
        const res = await fetch("/api/admin/payment-methods", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${Auth.getToken()}`
            },
            body: formData
        });

        const data = await res.json();

        if (res.ok) {
            showToast(data.message);
            paymentMethodForm.reset();
            loadPaymentMethods()
        } else {
            showToast(data.message || "Failed to create payment method");
            console.log(data.message)
        }

    } catch (error) {
        console.error(error);
        showToast("Something went wrong");
    } finally {
        modal.classList.add("active");
    }
});

// Action buttons click
tbBody.addEventListener("click", async (e) => {
    // Edit payment setting 
    const editPaymentMethodBtn = e.target.closest(".manage-btn");

    if (editPaymentMethodBtn) {
        const methodId = editPaymentMethodBtn.dataset.id;
        sessionStorage.setItem("methodId", methodId);
        window.location.href = `/admin/edit-method.html?id=${methodId}`;
        return
    }

    // Delete payment method
    const delPaymentMethodBtn = e.target.closest(".del-btn");

    if (delPaymentMethodBtn) {
        const methodId = delPaymentMethodBtn.dataset.id;

        const confirmed = await showConfirm(
            "Are you sure you want to delete this payment method?"
        );

        if (!confirmed) return;

        try {
            const res = await fetch(`/api/admin/payment-methods/${methodId}`, {
                headers: {
                    Authorization: `Bearer ${Auth.getToken()}`
                }
            });

            const data = await res.json()

            if (!res.ok) {
                showToast(data.message || "Failed to delete payment method");
                return;
            }

            showToast(data.message);

        } catch (error) {
            console.error(error)
        }

        return
    }

    // toggle payment status
    const toggleStatusBtn = e.target.closest(".toggle-status-btn");

    if (toggleStatusBtn) {
        const methodId = toggleStatusBtn.dataset.id;
        try {
            const res = await fetch(`/api/admin/payment-methods/${methodId}/toggle-status`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${Auth.getToken()}`
                }
            });

            const data = await res.json();

            if (res.ok) {
                loadPaymentMethods(); // refresh UI
            } else {
                showToast(data.message);
            }

        } catch (error) {
            console.error(error);
        }

        return

    }
})


loadPaymentMethods()