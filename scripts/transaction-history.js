/* ////// SIDE BAR VARs ////// */
const account = document.querySelector(".account");
const depWith = document.querySelector(".dep-with");
const packages = document.querySelector(".packages");

const accountDropdown = document.querySelector(".account-dropdown");
const depWithDropdown = document.querySelector(".dep-with-dropdown");
const packagesDropdown = document.querySelector(".packages-dropdown");

/* ////// NAV BAR ////// */
const sideBar = document.querySelector(".user-side-bar");
const NavIcon = document.querySelector(".nav-menu-icon");
const removeNav = document.querySelector(".remove-nav-icon");

NavIcon.addEventListener("click", ()=> {
    sideBar.classList.remove("active");
    NavIcon.classList.add("inactive")
    removeNav.classList.remove("inactive")
});

removeNav.addEventListener("click", ()=> {
    sideBar.classList.add("active");
    removeNav.classList.add("inactive")
    NavIcon.classList.remove("inactive")
});



// side bar events 
account.addEventListener("click", ()=> {
    accountDropdown.classList.toggle("inactive")
});
depWith.addEventListener("click", ()=> {
    depWithDropdown.classList.toggle("inactive")
});
packages.addEventListener("click", ()=> {
    packagesDropdown.classList.toggle("inactive")
});



// Transaction history pagination 
const rows = document.querySelectorAll(".tr");
const tbBody = document.querySelector(".tbody");
const prevBtn = document.querySelector(".prev-btn");
const nextBtn = document.querySelector(".next-btn");
const pgBtn = document.querySelector(".pg-btn");

const startIdxSpan = document.getElementById('startIdx');
const endIdxSpan = document.getElementById('endIdx');
const totalEntriesSpan = document.getElementById('totalEntries');

const rowsPerPage = 5;

let currentPage = 1;

const totalRows = rows.length;


function showPage(page) {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    
    rows.forEach((row, index) => {
        if (index >= startIndex && index < endIndex) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
    
    startIdxSpan.textContent = startIndex + 1;
    endIdxSpan.textContent = Math.min(endIndex, totalRows);
    totalEntriesSpan.textContent = totalRows;
}

function updatePaginationButtons() {
    const pgBtnsContainer = document.querySelector('.entries-buttons');
    pgBtnsContainer.innerHTML = '';
    
    const totalPages = Math.ceil(totalRows / rowsPerPage);
    
    for (let i = 1; i <= totalPages; i++) {
        const pgBtn = document.createElement('button');
        pgBtn.className = 'pg-btn';
        pgBtn.textContent = i;
        pgBtn.addEventListener('click', function() {
            currentPage = i;
            showPage(currentPage);
            updatePaginationButtons();
        });
        pgBtnsContainer.appendChild(pgBtn);
    }

    if (currentPage > 1) {
        prevBtn.style.display = 'block';
        prevBtn.addEventListener('click', function() {
            currentPage--;
            showPage(currentPage);
            updatePaginationButtons();
        });
    } else {
        prevBtn.style.display = 'none';
    }
    
    if (currentPage < totalPages) {
        nextBtn.style.display = 'block';
        nextBtn.addEventListener('click', function() {
            currentPage++;
            showPage(currentPage);
            updatePaginationButtons();
        });
    } else {
        nextBtn.style.display = 'none';
    }
}

showPage(currentPage);
updatePaginationButtons();
