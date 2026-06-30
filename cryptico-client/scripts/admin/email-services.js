/*
|--------------------------------------------------------------------------
| SHOW/HIDE THE USER SELECTION SECTION
|--------------------------------------------------------------------------
| The "Choose Users" search box should only be visible when the admin
| selects the "Choose Users" category.
|--------------------------------------------------------------------------
*/

const category = document.querySelector('[name="category"]');
const chooseUsers = document.querySelector(".choose-users-container");

category.addEventListener("change", () => {
    // If admin selected "Choose Users"
    if (category.value === "chooseUser") {
        chooseUsers.classList.remove("active");
    }
    // Otherwise hide it
    else {
        chooseUsers.classList.add("active");
    }

});


/*
|--------------------------------------------------------------------------
| GET ALL REQUIRED HTML ELEMENTS
|--------------------------------------------------------------------------
*/

// Search input where admin types a user's name
const searchInput = document.getElementById("userSearch");

// Dropdown that will display matching users
const results = document.getElementById("userResults");

// Container that will display selected users as tags
const selectedContainer = document.getElementById("selectedUsersContainer");

// Span showing how many users have been selected
const count = document.getElementById("selectedCount");


/*
|--------------------------------------------------------------------------
| ARRAYS
|--------------------------------------------------------------------------
*/

// Stores EVERY user returned from the server
let allUsers = [];

// Stores ONLY users selected by the admin
let selectedUsers = [];


/*
|--------------------------------------------------------------------------
| LOAD ALL USERS FROM DATABASE
|--------------------------------------------------------------------------
*/

const loadUsers = async () => {
     try {
        const response = await fetch(`${API_URL}/api/admin/users`, {
            headers: {
                Authorization: `Bearer ${Auth.getToken()}`
            }
        });

        const data = await response.json();

        /*
        Save every user inside our array.
        */
        allUsers = data.allUsers;

    }
    catch (error) {
        console.error(error);
    }
    finally {
        hideLoader();
    }
}

loadUsers();


/*
|--------------------------------------------------------------------------
| SEARCH USERS
|--------------------------------------------------------------------------
*/

searchInput.addEventListener("input", () => {

    // Get whatever has been typed
    const keyword = searchInput.value.trim().toLowerCase();

    // Clear previous search results
    results.innerHTML = "";

    // If search box is empty, hide dropdown
    if (!keyword) {

        results.style.display = "none";
        return;

    }


    /*
    Filter users.

    Only return users:

    ✔ whose name/email matches the search

    ✔ who have NOT already been selected
    */

    const filtered = allUsers.filter(user => {

        /*
        Check whether this user already exists
        inside selectedUsers.
        */

        if (selectedUsers.find(u => u._id === user._id)) {

            // Already selected.
            // Don't show again.
            return false;

        }

        /*
        Search by:

        Full name

        OR

        Email
        */

        return (

            user.fullName.toLowerCase().includes(keyword)

            ||

            user.email.toLowerCase().includes(keyword)

        );

    });


    // No matching user
    if (!filtered.length) {

        results.style.display = "none";
        return;

    }


    /*
    Create one dropdown item for every matching user.
    */

    filtered.forEach(user => {

        const div = document.createElement("div");

        div.className = "user-result";

        div.innerHTML = `
            <strong>${user.fullName}</strong><br>
            <small>${user.email}</small>
        `;


        /*
        Clicking the user adds them to the selected list.
        */

        div.onclick = () => addUser(user);

        results.appendChild(div);

    });


    // Show dropdown
    results.style.display = "block";

});


/*
|--------------------------------------------------------------------------
| ADD USER
|--------------------------------------------------------------------------
| Runs when admin clicks a user from the dropdown.
|--------------------------------------------------------------------------
*/

function addUser(user) {
    // Add user into selectedUsers array.
    selectedUsers.push(user);

    // Update the UI
    renderSelectedUsers();


    // Clear search input.
    searchInput.value = "";

    // Hide dropdown.
    results.innerHTML = "";

    results.style.display = "none";
}


/*
|--------------------------------------------------------------------------
| DISPLAY SELECTED USERS
|--------------------------------------------------------------------------
*/

function renderSelectedUsers() {

    // Remove old tags
    selectedContainer.innerHTML = "";

    selectedUsers.forEach(user => {

        const tag = document.createElement("div");

        tag.className = "selected-user";

        tag.innerHTML = `
            ${user.fullName}

            <span
                class="remove-user"
                data-id="${user._id}">
                &times;
            </span>
        `;

        selectedContainer.appendChild(tag);

    });


    // Update counter.
    count.textContent = selectedUsers.length;

}


/*
|--------------------------------------------------------------------------
| REMOVE A USER
|--------------------------------------------------------------------------
| Clicking the X removes that user.
|--------------------------------------------------------------------------
*/

selectedContainer.addEventListener("click", e => {

    if (!e.target.classList.contains("remove-user")) return;

    const id = e.target.dataset.id;


    /*
    Remove that user from selectedUsers.
    */

    selectedUsers = selectedUsers.filter(user => user._id !== id);


    /*
    Re-render tags.
    */

    renderSelectedUsers();

});


/*
|--------------------------------------------------------------------------
| HIDE DROPDOWN WHEN CLICKING OUTSIDE
|--------------------------------------------------------------------------
*/

document.addEventListener("click", e => {

    if (

        !searchInput.contains(e.target)

        &&

        !results.contains(e.target)

    ) {

        results.style.display = "none";

    }

});


/*
|--------------------------------------------------------------------------
| GET THE IDS WHEN SENDING EMAIL
|--------------------------------------------------------------------------
|
| When the admin clicks Send Email:
|
| const ids = selectedUsers.map(user => user._id);
|
| Result:
|
| [
|   "6844a....",
|   "6844b....",
|   "6844c...."
| ]
|
| Send this array to the backend.
|--------------------------------------------------------------------------
*/

const emailForm = document.getElementById("email-form");

emailForm.addEventListener("submit", sendEmail);

const sendEmailBtn = document.getElementById("send-email-btn")

async function sendEmail(e) {
    e.preventDefault();

    try {
        sendEmailBtn.disabled = true;
        sendEmailBtn.textContent = "Processing...";

        // Get form values
        const category = document.querySelector('[name="category"]').value;
        const greeting = document.querySelector('[name="greeting"]').value.trim();
        const greetingTitle = document.querySelector('[name="greetingTitle"]').value.trim();
        const subject = document.querySelector('[name="subject"]').value.trim();

        // Get CKEditor content
        const message = window.editor.getData();

        // Get selected user ids
        const selectedUserIds = selectedUsers.map(user => user._id);

        const res = await fetch(`${API_URL}/api/admin/send-email`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${Auth.getToken()}`
            },
            body: JSON.stringify({
                category,
                greeting,
                greetingTitle,
                subject,
                message,
                selectedUsers: selectedUserIds
            })
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message);
        }

        showToast(data.message || "Email sent successfully.", "success");

        // Reset form
        emailForm.reset();

        // Clear selected users
        selectedUsers = [];
        renderSelectedUsers();

        // Clear editor
       window.editor.setData("");

    } catch (error) {

        console.error(error);

        showToast(error.message || "Unable to send email.", "error");

    } finally {

        sendEmailBtn.disabled = false;
        sendEmailBtn.textContent = `<i class="fa-solid fa-paper-plane"></i> Send Email`;

    }
}