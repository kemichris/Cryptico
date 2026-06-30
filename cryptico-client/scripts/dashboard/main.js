// Modal and toaster
const toast = document.getElementById("toast");

function showToast(message, type = "success") {
    const toast = document.getElementById("toast");

    if (!toast) {
        console.warn("Toast element not found");
        return;
    }

    toast.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

const confirmModal = document.getElementById("confirmModal");
const confirmText = document.getElementById("confirmText");
const confirmYes = document.getElementById("confirmYes");
const confirmNo = document.getElementById("confirmNo");

function showConfirm(message) {
    const confirmModal = document.getElementById("confirmModal");
    const confirmText = document.getElementById("confirmText");
    const confirmYes = document.getElementById("confirmYes");
    const confirmNo = document.getElementById("confirmNo");

    if (!confirmModal || !confirmText || !confirmYes || !confirmNo) {
        return Promise.resolve(false);
    }

    confirmText.textContent = message;
    confirmModal.classList.remove("hidden");

    return new Promise((resolve) => {
        confirmYes.onclick = () => {
            confirmModal.classList.add("hidden");
            resolve(true);
        };

        confirmNo.onclick = () => {
            confirmModal.classList.add("hidden");
            resolve(false);
        };
    });
}