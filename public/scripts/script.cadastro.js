import { maskInput } from "./utils/script.masks.js";
import { saveStep, loadProgress, clearProgress } from "./utils/script.localstorage.js";

document.addEventListener("DOMContentLoaded", () => {
    // Variables
    const pageDescription = document.getElementById("page-description");
    const forms = document.getElementById("register-forms").querySelectorAll("form");
    const selectors = document.getElementById("selectors").querySelectorAll("*");

    const pagesIndex = {
        "selector-company": {
            description: "PREENCHA AS INFORMAÇÕES",
            form: forms[0]
        },
        "selector-address": {
            description: "INSIRA O ENDEREÇO DA EMPRESA",
            form: forms[1]
        },
        "selector-documents": {
            description: "ENVIE OS DOCUMENTOS",
            form: forms[2]
        },
        "selector-terms": {
            description: "POLÍTICA DE PRIVACIDADE E TERMOS",
            form: forms[3]
        }
    };

    // Functions
    function handleRegisterForm(e, form) {
        e.preventDefault();

        if(form.id == "terms-form") registerUser();

        const formData = new FormData(form);
        const data = Object.fromEntries(formData)

        switch(form.id) {
            case "company-form":
                saveStep(0, data);
                break;
            case "address-form":
                saveStep(1, data);
                break;
            default:
                break;
        }

        nextStep();
    }

    function nextStep() {
        const nextPage = document.getElementById("selectors").querySelector(".bg-mainblue").nextElementSibling;
        changeStep(nextPage);
    }

    function changeStep(nextPage) {
        const currentPage = document.getElementById("selectors").querySelector(".bg-mainblue");
        const currentPageIndex = pagesIndex[currentPage.id];
        const nextPageIndex = pagesIndex[nextPage.id];
        
        currentPage.classList.remove("bg-mainblue");
        currentPage.classList.add("cursor-pointer");

        nextPage.classList.add("bg-mainblue");
        nextPage.classList.remove("cursor-pointer");

        togglePage(currentPageIndex.form);
        togglePage(nextPageIndex.form);

        pageDescription.textContent = nextPageIndex.description;
    }

    function togglePage(form) {
        form.classList.toggle("flex");
        form.classList.toggle("hidden");
    }

    function loadLastSession() {
        const progress = loadProgress();

        if(!progress) return;

        fillForms(progress);
    }

    function fillForms(progress) {
        for(let i = 0; i < 2; i++) {
            if(progress.steps[i]){
                Object.entries(progress.steps[i]).forEach(([name, value]) => {
                    const field = forms[i].elements[name];
                    if (!field) return;

                    field.value = value;
                });

                nextStep();
            }
        }
        
    }

    function registerUser() {

    }

    // Mask necessary inputs
    maskInput(forms[0].querySelector("input[name='cnpj']"), "99.999.999/9999-99");
    maskInput(forms[0].querySelector("input[name='telefone']"), "(99) 99999-9999");
    maskInput(forms[0].querySelector("input[name='cpf-responsavel']"), "999.999.999-99");
    maskInput(forms[1].querySelector("input[name='cep']"), "99999-999");

    // Handle Event Listeners
    forms.forEach((form) => {
        form.addEventListener("submit", (e) => handleRegisterForm(e, form));
    });

    selectors.forEach((selector) => {
        selector.addEventListener("click", () => changeStep(selector));
    });

    loadLastSession();
});