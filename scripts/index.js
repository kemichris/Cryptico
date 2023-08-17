/* ////// NAV BAR ////// */
const mobileNav = document.querySelector(".mobile-menu");
const NavIcon = document.querySelector(".nav-menu-icon");
const removeNav = document.querySelector(".remove-nav-icon");


NavIcon.addEventListener("click", ()=> {
    mobileNav.classList.remove("inactive");
    NavIcon.classList.add("inactive")
    removeNav.classList.remove("inactive")
});

removeNav.addEventListener("click", ()=> {
    mobileNav.classList.add("inactive");
    removeNav.classList.add("inactive")
    NavIcon.classList.remove("inactive")
});


/* ////// TESTIMONY SECTION ////// */
const testimonyContainer = document.querySelector(".testimony-container");
const testimonys = document.querySelectorAll(".testimony");

let currentSlide = 0;

function updateSlide() {
    testimonyContainer.style.transform = `translateX(${-currentSlide * testimonys[0].clientWidth}px)`;
    
}

function nextSlide() {
    if (currentSlide < testimonys.length - 1) {
        currentSlide++;
    } else {
        currentSlide = 0;
    }
    updateSlide();

}

document.addEventListener('DOMContentLoaded', () => {
    updateSlide();
    setInterval(nextSlide, 5000); // Run autoSlide every 3 seconds (3000 milliseconds)
});