/**
 * Initializes the benefits calculator.
 */
function initializeBenefitsCalculator() {
    const holidaysCheckbox = document.getElementById('includeVacances');
    const thirteenthMonthCheckbox = document.getElementById('include13eme');

    if (holidaysCheckbox && thirteenthMonthCheckbox) {
        holidaysCheckbox.addEventListener('change', updateBenefitsCalculator);
        thirteenthMonthCheckbox.addEventListener('change', updateBenefitsCalculator);

        // Update the calculator on initialization.
        updateBenefitsCalculator();
    }
}

/**
 * Handles the change event for the period input.
 */
periodInput.addEventListener('change', () => {
    const periodValue = periodInput.value;
    const disabled = !periodValue;
    document.querySelectorAll('.btn-select-dates').forEach(btn => btn.disabled = disabled);
    const openCalendarBtnGlobal = document.getElementById('openCalendarBtnGlobal');
    if(openCalendarBtnGlobal) openCalendarBtnGlobal.disabled = disabled;

    if (periodValue) {
        try {
            const [year, month] = periodValue.split('-');
            const titleDate = new Date(Date.UTC(year, month - 1, 1));
            const monthName = monthsInFrench[titleDate.getUTCMonth()];
            const yearName = titleDate.getUTCFullYear();
            titleMonthSpan.textContent = ` - ${monthName} ${yearName}`;

            // Update the payment period.
            const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
            const paymentPeriod = `01/${month}/${year} - ${String(lastDay).padStart(2, '0')}/${month}/${year}`;
            document.getElementById('periodoPagamento').textContent = paymentPeriod;
        } catch(e) {
            titleMonthSpan.textContent = '';
            document.getElementById('periodoPagamento').textContent = '-';
            console.error("Erreur formatage date titre:", e);
        }
    } else {
        titleMonthSpan.textContent = '';
        document.getElementById('periodoPagamento').textContent = '-';
    }
    activitiesTableBody.innerHTML = '';
    document.getElementById('resultats').innerHTML = `<h3><i class="fas fa-poll fa-fw"></i> Résultats du Calcul</h3><p>Mois/Année modifié...</p>`;
    addActivityRow();
    checkAllLimits();
});

const openCalendarBtnGlobal = document.getElementById('openCalendarBtnGlobal');
if (openCalendarBtnGlobal) {
    openCalendarBtnGlobal.addEventListener('click', () => {
        alert("Utilisez 'Choisir Jours' sur chaque ligne.");
    });
}

/**
 * Handles the blur event for the time inputs.
 *
 * @param {Event} event The blur event.
 */
function handleTimeInputBlur(event) {
    const input = event.target;
    const currentValue = input.value.trim();
    const row = input.closest('tr');

    if (fourDigitsRegex.test(currentValue)) {
        const hh = currentValue.substring(0, 2);
        const mm = currentValue.substring(2, 4);

        const hour = parseInt(hh, 10);
        const minute = parseInt(mm, 10);

        if (hour >= 0 && hour < 24 && minute >= 0 && minute < 60) {
            input.value = `${hh}:${mm}`;
        }
    }

    updateRowHours(row);
    checkAllLimits();
}

/**
 * Handles the change event for the activity select.
 *
 * @param {Event} event The change event.
 */
function handleActivityChange(event) {
    const activitySelect = event.target;
    const selectedActivity = activitySelect.value;
    const row = activitySelect.closest('tr');
    const categorySelect = row.querySelector('.categorie-select');

    if (categorySelect && activityCategoryMap.hasOwnProperty(selectedActivity)) {
        const defaultCategory = activityCategoryMap[selectedActivity];
        if (defaultCategory) {
            categorySelect.value = defaultCategory;
        }
    }

    checkAllLimits();
}

/**
 * Adds input listeners to a row in the activities table.
 *
 * @param {HTMLElement} row The row to add the listeners to.
 */
function addRowInputListeners(row) {
    const startTimeInput = row.querySelector('.start-time-input');
    const endTimeInput = row.querySelector('.end-time-input');
    const activitySelect = row.querySelector('.activite-select');
    const categorySelect = row.querySelector('.categorie-select');

    const updateHourHandler = (event) => {
        const currentRow = event.target.closest('tr');
        if (currentRow) {
            validateTimeInput(event.target);
            updateRowHours(currentRow);
        }
    };

    const blurHandler = (event) => {
        handleTimeInputBlur(event);
    };

    const changeHandler = () => {
        checkAllLimits();
    };

    if (startTimeInput) {
        startTimeInput.addEventListener('input', updateHourHandler);
        startTimeInput.addEventListener('blur', blurHandler);
    }

    if (endTimeInput) {
        endTimeInput.addEventListener('input', updateHourHandler);
        endTimeInput.addEventListener('blur', blurHandler);
    }

    if (activitySelect) {
        activitySelect.addEventListener('change', handleActivityChange);
    }

    if (categorySelect) {
        categorySelect.addEventListener('change', changeHandler);
    }
}

/**
 * Initializes the application when the DOM is loaded.
 */
document.addEventListener('DOMContentLoaded', () => {
    activitiesTableBody = document.getElementById('tableTravaux').getElementsByTagName('tbody')[0];

    flatpickr("#periode", {
        plugins: [
            new monthSelectPlugin({
                shorthand: true,
                dateFormat: "Y-m",
                altFormat: "F Y",
            })
        ],
        locale: "fr",
        onChange: function(selectedDates, dateStr, instance) {
            const event = new Event('change', { bubbles: true });
            periodInput.dispatchEvent(event);
        }
    });

    if (activitiesTableBody) {
        addActivityRow();

        document.querySelectorAll('.btn-select-dates').forEach(btn => {
            btn.disabled = true;
        });

        const openCalendarBtnGlobal = document.getElementById('openCalendarBtnGlobal');
        if(openCalendarBtnGlobal) {
            openCalendarBtnGlobal.disabled = true;
        }
    } else {
        console.error("Erro: Não foi possível encontrar o tbody da tabela.");
    }
});
