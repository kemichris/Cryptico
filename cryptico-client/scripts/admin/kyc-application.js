// Get user ID from URL or session storage
const params = new URLSearchParams(window.location.search);
const applicationId = params.get("id") || sessionStorage.getItem("kycId");

if (!applicationId) {
    showToast("No application selected");
    window.location.href = "/admin/kyc.html";
}

// Application dom ellements
const fullName = document.getElementById("fullName");
const email = document.getElementById("email");
const country = document.getElementById("country");
const dob = document.getElementById("dob");
const idType = document.getElementById("idType");
const idNumber = document.getElementById("idNumber");
const submittedDate = document.getElementById("submittedDate");

const frontImage = document.getElementById("frontImage");
const backImage = document.getElementById("backImage");
const backImageContainer = document.getElementById("backImageContainer");

const rejectionReason = document.getElementById("rejectionReason");

const statusBadge = document.querySelector(".status");

const approveBtn = document.querySelector(".approve-btn");
const rejectBtn = document.querySelector(".reject-btn");

const modal = document.querySelector(".image-modal");
const modalImage = document.querySelector(".modal-image");
const closeModal = document.querySelector(".close-image");


// load kyc application 
const loadKyc = async () => {
    try {
        const res = await fetch(`${API_URL}/api/admin/kyc/${applicationId}`, {
            headers: {
                Authorization: `Bearer ${Auth.getToken()}`
            }
        });

        if (!res.ok) {
            window.location.href = "/admin/kyc.html";
        } else {
            hideLoader()
        }

        const kyc = await res.json();

        fullName.textContent = kyc.fullName;
        email.textContent = kyc.user.email;
        country.textContent = kyc.country;
        dob.textContent = new Date(kyc.dateOfBirth).toLocaleDateString();

        idType.textContent = kyc.idType;
        idNumber.textContent = kyc.idNumber;

        submittedDate.textContent =
            new Date(kyc.createdAt).toLocaleDateString();

        frontImage.src = kyc.frontImage;

        if (kyc.backImage) {
            backImage.src = kyc.backImage;

        } else {
            backImageContainer.style.display = "none";
        }

        statusBadge.textContent = kyc.applicationStatus;
        statusBadge.className = `status ${kyc.applicationStatus}`;

        // -----------------------------
        // Lock reviewed applications
        // -----------------------------
        if (kyc.applicationStatus !== "pending") {
            approveBtn.style.display = "none";
            rejectBtn.style.display = "none";

            if (kyc.applicationStatus === "approved") {
                approveBtn.textContent = "Approved";
                rejectionReason.style.display = "none";
            }

            if (kyc.applicationStatus === "rejected") {
                rejectBtn.textContent = "Rejected";
                rejectionReason.value = kyc.reviewComment || "";
                rejectionReason.readOnly = true;
                rejectionReason.style.backgroundColor = "#f5f5f5";
                rejectionReason.style.cursor = "not-allowed";
            }

        }

    } catch (error) {
        console.error(error);
    }
};


// ID image preview
document.querySelectorAll(".view-image-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const image =
            btn.previousElementSibling.src;
        modalImage.src = image;
        modal.classList.add("active");
    });

});

closeModal.addEventListener("click", () => {
    modal.classList.remove("active");
});

modal.addEventListener("click", e => {
    if (e.target === modal) {
        modal.classList.remove("active");
    }
});

// Approve application
approveBtn.addEventListener("click", async () => {
    const confirmed = await showConfirm("Are you sure you want to approve this KYC application?");

    if (!confirmed) return;

    try {
        approveBtn.disabled = true;
        const res = await fetch(`${API_URL}/api/admin/kyc/${applicationId}/review`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${Auth.getToken()}`
            },
            body: JSON.stringify({
                applicationStatus: "approved"
            })
        });

        const data = await res.json();
        if (res.ok) {
            showToast(data.message);
            loadKyc();
        } else {
            showToast(data.message)
        }
    } catch (error) {
        console.error(error);
    } finally {
        approveBtn.disabled = false;
    }
});

// Reject application
rejectBtn.addEventListener("click", async () => {

    const reason = rejectionReason.value.trim();
    const confirmed = await showConfirm("Are you sure you want to reject this KYC application?");

    if (!confirmed) return;

    try {
        rejectBtn.disabled = true;
        const res = await fetch(`${API_URL}/api/admin/kyc/${applicationId}/review`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${Auth.getToken()}`
            },
            body: JSON.stringify({
                applicationStatus: "rejected",
                reviewComment: reason
            })
        });

        const data = await res.json();


        if (res.ok) {
            showToast(data.message);
            loadKyc();
        } else {
            showToast(data.message);
        }

    } catch (error) {
        console.error(error);
    } finally {
        rejectBtn.disabled = false;
    }
});








loadKyc();