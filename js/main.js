// --- Global Variables and Constants ---

// The shared instance of the Flatpickr calendar.
let sharedFlatpickrInstance = null;

// The input element for the reference period.
const periodInput = document.getElementById('periode');

// The table body for the work activities.
let activitiesTableBody = null;

// The span element for the month and year in the title.
const titleMonthSpan = document.getElementById('mois-annee-titre');

// The area for displaying alerts.
const alertArea = document.getElementById('alert-area');

// The select element for the employees.
const employeeSelect = document.getElementById('employe');

// A regular expression for validating the time format (HH:MM).
const timeFormatRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

// A regular expression for validating a four-digit number.
const fourDigitsRegex = /^\d{4}$/;

/**
 * Validates a time input and adds or removes the 'input-error' class accordingly.
 *
 * @param {HTMLInputElement} input The time input to validate.
 * @returns {boolean} True if the input is valid, false otherwise.
 */
function validateTimeInput(input) {
    if (!input) return false;
    const isValid = timeFormatRegex.test(input.value);
    input.classList.toggle('input-error', input.value !== "" && !isValid);
    return isValid || input.value === "";
}

// An array of the months in French.
const monthsInFrench = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];


// --- Functions ---

/**
 * Populates the employee select element with the employees from the `employees` array.
 */
function populateEmployeeSelect() {
    const select = document.getElementById('employe');
    employees.forEach(employee => {
        const option = document.createElement('option');
        option.value = `${employee.name}|${employee.address}|${employee.avs}|${employee.birthDate}|${employee.civilState}|${employee.children}|${employee.canton}|${employee.commune}|${employee.nationality}|${employee.permit}`;
        option.textContent = employee.name;
        select.appendChild(option);
    });
}


// --- Initialization ---

/**
 * Initializes the application when the DOM is loaded.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Set the issue date to the current date.
    const today = new Date();
    const formattedDate = today.toLocaleDateString('fr-CH');
    document.getElementById('dateEmission').textContent = formattedDate;

    // Generate the payslip number automatically.
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const payslipNumber = `${year}-${month}${day}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    document.getElementById('numeroFicha').textContent = payslipNumber;

    // Initialize the benefits calculator and populate the employee select element.
    initializeBenefitsCalculator();
    populateEmployeeSelect();
    setLanguage('fr');
});


// --- Printing Functions ---

/**
 * Prints the payslip for the employer.
 */
function printForEmployer() {
    // Show the alerts for the employer.
    const alertArea = document.getElementById('alert-area');
    if (alertArea) {
        alertArea.style.display = 'block';
    }
    window.print();
}

/**
 * Prints the payslip for the employee.
 */
function printForEmployee() {
    // Hide the alerts for the employee.
    const alertArea = document.getElementById('alert-area');
    if (alertArea) {
        alertArea.style.display = 'none';
    }
    window.print();
    // Restore the display of the alerts after printing.
    setTimeout(() => {
        if (alertArea) {
            alertArea.style.display = 'block';
        }
    }, 1000);
}
