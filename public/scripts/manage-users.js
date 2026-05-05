// ADD NEW USERS POPUP 
const addUserBtn = document.getElementById("new-user-btn");
const newUserForm = document.getElementById("add-new-users");
const closeAddUser = document.getElementById("close-add-user");


addUserBtn.addEventListener("click", ()=> {
    newUserForm.classList.add("active")
});

closeAddUser.addEventListener("click", ()=> {
    newUserForm.classList.remove("active")
});