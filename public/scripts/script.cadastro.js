document.addEventListener("DOMContentLoaded", () => {
    const pageDescription = document.getElementById("page-description");
    const companyForm = document.getElementById("company-form");
    const addressForm = document.getElementById("address-form");
    const btnSelectors = document.getElementById("selectors").querySelectorAll("*");

    companyForm.addEventListener("submit", (e) => {
        e.preventDefault();
        console.log("OPAA");
    });
});