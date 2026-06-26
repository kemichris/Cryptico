hideLoader()

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
        } else {
            showToast(data.message || "Failed to create payment method");
            console.log(data.message)
        }

    } catch (error) {
        console.error(error);
        showToast("Something went wrong");
    }finally {
        modal.classList.add("active");
    }
});