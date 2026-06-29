const kycForm = document.getElementById("kyc-form");
const submitBtn = document.getElementById("submit-btn")

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

const resubmitBtn = document.getElementById("resubmitBtn");

const loadKycStatus = async () => {
    try {
        const res = await fetch("/api/users/profile", {
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