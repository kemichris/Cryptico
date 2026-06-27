const params = new URLSearchParams(window.location.search);
const paymentMethodId = params.get("id") || sessionStorage.getItem("methodId");
const paymentMethodForm = document.getElementById("payment-setting");

if (!paymentMethodId) {
    showToast("No payment method selected")
    window.location.href = "/admin/payment-setting.html";
}

// load form fields 
const loadPaymentMethod = async () => {
    try {
        const res = await fetch(`/api/admin/payment-methods/${paymentMethodId}`, {
            headers: {
                Authorization: `Bearer ${Auth.getToken()}`
            }
        });

        const data = await res.json();

        if (!res.ok) {
            showToast(data.message);
            return;
        }

        const method = data.method;
        console.log(method)

        // Fill every input/select/textarea that has a matching name
        paymentMethodForm.querySelectorAll("[name]").forEach(field => {

            // Don't try to set file inputs
            if (field.type === "file") return;

            if (method[field.name] !== undefined && method[field.name] !== null) {
                field.value = method[field.name];
            }
        });
    } catch (error) {
        console.error(error.message);
    } finally {
        hideLoader()
    }
};


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



// edit payment setting 

paymentMethodForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = paymentMethodForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Updating...';

    const formData = new FormData(paymentMethodForm);

    try {
        const res = await fetch(`/api/admin/payment-methods/${paymentMethodId}`, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${Auth.getToken()}`
            },
            body: formData
        }
        );

        const data = await res.json();

        showToast(data.message);

        if (res.ok) {
            loadPaymentMethod();
        }

    } catch (error) {
        console.error(error);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save changes';
    }
});


loadPaymentMethod()