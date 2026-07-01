// loading kyc cards 
const idType = document.getElementById("idType");

const backImageWrapper =
    document.getElementById("backImageWrapper");

idType.addEventListener("change", () => {
    if (idType.value === "passport") {
        backImageWrapper.style.display = "none";
    } else {
        backImageWrapper.style.display = "block";
    }
});


const pendingCard = document.getElementById("pending-card");
const verifiedCard = document.getElementById("verified-card");
const rejectedCard = document.getElementById("rejected-card");

function hideAllCards() {
    kycForm.style.display = "none";
    pendingCard.style.display = "none";
    verifiedCard.style.display = "none";
    rejectedCard.style.display = "none";
}


const loadKycStatus = async () => {
    try {
        const res = await fetch(`${API_URL}/api/users/profile`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await res.json();


        hideAllCards();

        switch (data.kycStatus) {

            case "unverified":
                kycForm.style.display = "block";
                break;

            case "pending":
                pendingCard.style.display = "block";
                break;

            case "verified":
                verifiedCard.style.display = "block";
                break;

            case "rejected":
                rejectedCard.style.display = "block";
                reason.textContent = data.rejectionReason;
                break;
        }
    } catch (error) {
        console.error(error)
    }

}

loadKycStatus()

// sendkyc application
const kycForm = document.getElementById("kyc-form");
const submitBtn = document.getElementById("submit-btn")

kycForm.addEventListener("submit", async(e)=> {
    e.preventDefault()

    const formData = new FormData(kycForm)
    
    try {
        submitBtn.disabled = true;
        submitBtn.innerText = "sending Application..."

        const res = await fetch(`${API_URL}/api/users/kyc`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`},
            body: formData
        })

        const data = await res.json();

        if (res.ok) {
            showToast(data.message);
            loadKycStatus()
            kycForm.reset();
        } else {
            showToast(data.message || "Failed to create payment method");
            console.log(data.message)
        }
    } catch (error) {
        console.error(error)
    }finally {
        submitBtn.disabled = false;
        submitBtn.innerText = "Submit KYC"
    }
})

// resubmit kyc button 
const resubmitBtn = document.getElementById("resubmit-kyc-Btn")

if(resubmitBtn) {
    resubmitBtn.addEventListener("click", ()=> {
        rejectedCard.style.display = "none";
        kycForm.style.display = "block";
    })
}