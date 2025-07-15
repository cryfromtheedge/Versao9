/**
 * Updates the benefits calculator with the adjusted rates.
 */
function updateBenefitsCalculator() {
    const includeHolidays = document.getElementById('includeVacances').checked;
    const include13thMonth = document.getElementById('include13eme').checked;
    const calculator = document.getElementById('benefitsCalculator');

    const rates = calculateAdjustedRates(includeHolidays, include13thMonth);

    let scenarioHtml = '';

    if (includeHolidays && !include13thMonth) {
        scenarioHtml = `
            <div class="scenario current">
                <h5>Avec Férias Seulement (Recommandé)</h5>
                <p><strong>Cat. A:</strong> CHF ${rates.adjusted.A.toFixed(2)}/h (au lieu de CHF ${rates.original.A})</p>
                <p><strong>Cat. B:</strong> CHF ${rates.adjusted.B.toFixed(2)}/h (au lieu de CHF ${rates.original.B})</p>
                <p><strong>Cat. C:</strong> CHF ${rates.adjusted.C.toFixed(2)}/h (au lieu de CHF ${rates.original.C})</p>
                <p class="success"><i class="fas fa-check-circle"></i> Reste dans le budget LPHand</p>
            </div>
        `;
    } else if (includeHolidays && include13thMonth) {
        scenarioHtml = `
            <div class="scenario adjusted">
                <h5>Avec Férias + 13ème Salaire</h5>
                <p><strong>Cat. A:</strong> CHF ${rates.adjusted.A.toFixed(2)}/h</p>
                <p><strong>Cat. B:</strong> CHF ${rates.adjusted.B.toFixed(2)}/h</p>
                <p><strong>Cat. C:</strong> CHF ${rates.adjusted.C.toFixed(2)}/h</p>
                <p class="warning"><i class="fas fa-exclamation-triangle"></i> Salaire base réduit (${rates.benefitsPercent.toFixed(2)}% de bénéfices)</p>
            </div>
        `;
    } else if (!includeHolidays && include13thMonth) {
        scenarioHtml = `
            <div class="scenario adjusted">
                <h5>Avec 13ème Salaire Seulement</h5>
                <p><strong>Cat. A:</strong> CHF ${rates.adjusted.A.toFixed(2)}/h</p>
                <p><strong>Cat. B:</strong> CHF ${rates.adjusted.B.toFixed(2)}/h</p>
                <p><strong>Cat. C:</strong> CHF ${rates.adjusted.C.toFixed(2)}/h</p>
                <p style="color: #dc3545;"><i class="fas fa-exclamation-triangle"></i> ATTENTION: Férias sont obligatoires par loi!</p>
            </div>
        `;
    } else {
        scenarioHtml = `
            <div class="scenario current">
                <h5>Tarifas LPHand Standard</h5>
                <p><strong>Cat. A:</strong> CHF ${rates.original.A}/h</p>
                <p><strong>Cat. B:</strong> CHF ${rates.original.B}/h</p>
                <p><strong>Cat. C:</strong> CHF ${rates.original.C}/h</p>
                <p style="color: #dc3545;"><i class="fas fa-exclamation-triangle"></i> ATTENTION: Férias sont obligatoires par loi!</p>
            </div>
        `;
    }

    calculator.innerHTML = `
        <h4><i class="fas fa-chart-line"></i> Tarifas Ajustadas Recommandées</h4>
        <div class="scenario-comparison">
            ${scenarioHtml}
        </div>

        <div class="alert alert-info">
            <strong><i class="fas fa-lightbulb"></i> Recommandation:</strong>
            ${includeHolidays ?
        'Utilisez les tarifas ajustadas pour inclure automatiquement les bénéfices sélectionnés dans le budget LPHand disponible.' :
        'Les férias sont obligatoires selon l\'art. 329a CO. Cochez la case pour calculer la tarifa ajustada.'
    }
        </div>
    `;
}

/**
 * Opens the calendar for a specific row in the activities table.
 *
 * @param {HTMLElement} buttonElement The button element that was clicked.
 */
function openRowCalendar(buttonElement) {
    const periodValue = periodInput.value;
    if (!periodValue) {
        alert("Veuillez d'abord sélectionner le 'Mois / Année de référence'.");
        return;
    }
    const row = buttonElement.closest('tr');
    const displayDatesSpan = row.querySelector('.display-dates');
    const hiddenDatesListInput = row.querySelector('.selected-dates-list');

    const currentDates = hiddenDatesListInput.value ? hiddenDatesListInput.value.split(',') : [];

    if (sharedFlatpickrInstance) {
        sharedFlatpickrInstance.destroy();
    }

    const year = parseInt(periodValue.split('-')[0], 10);
    const month = parseInt(periodValue.split('-')[1], 10);
    const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();

    sharedFlatpickrInstance = flatpickr(buttonElement, {
        mode: "multiple",
        dateFormat: "Y-m-d",
        locale: "fr",
        defaultDate: currentDates,
        minDate: `${periodValue}-01`,
        maxDate: `${periodValue}-${String(lastDay).padStart(2, '0')}`,
        monthSelectorType: 'static',
        clickOpens: false,
        onClose: function (selectedDates, dateStr, instance) {
            selectedDates.sort((a, b) => a - b);
            const displayDays = selectedDates.map(date => date.getDate()).join(', ') || "Aucun jour";
            const storedDates = selectedDates.map(date => instance.formatDate(date, "Y-m-d")).join(',');

            displayDatesSpan.textContent = displayDays;
            hiddenDatesListInput.value = storedDates;

            updateRowHours(row);
            checkAllLimits();
        }
    });
    sharedFlatpickrInstance.open();
}

/**
 * Adds a new row to the activities table.
 */
function addActivityRow() {
    if (!activitiesTableBody) {
        console.error("ERREUR: activitiesTableBody n'est pas prêt.");
        return;
    }

    const newRow = activitiesTableBody.insertRow();
    const isPeriodSelected = !!periodInput.value;

    newRow.innerHTML = `
        <td>
            <select class="activite-select">
                <option value="">-- Choisir une activité --</option>
                <optgroup label="Activités Communes">
                    <option value="Actes ordinaires de la vie">Actes ordinaires de la vie</option>
                    <option value="Tenue du ménage">Tenue du ménage</option>
                    <option value="Participation à la vie sociale et loisirs">Participation vie sociale/loisirs</option>
                    <option value="Soins particulièrement astreignants">Soins partic. astreignants</option>
                    <option value="Exercices dextérité/mémoire">Exercices dextérité/mémoire (A)</option>
                    <option value="Domaine de la vie">Domaine de la vie (Cat. C)</option>
                </optgroup>
                <optgroup label="Domaines (Décision)">
                    <option value="Logement">Logement</option>
                    <option value="Travail et formation">Travail et formation</option>
                    <option value="Relations sociales">Relations sociales</option>
                    <option value="Loisirs">Loisirs</option>
                    <option value="Santé et bien-être">Santé et bien-être</option>
                </optgroup>
                <optgroup label="Surveillance">
                    <option value="Domaine Surveillance pendant la journe">Surveillance Jour</option>
                    <option value="Domaine Surveillance pendant la journe/Nuit">Surveillance Jour/Nuit</option>
                </optgroup>
            </select>
        </td>
        <td class="center">
            <button type="button" class="btn-select-dates secondary" onclick="openRowCalendar(this)" ${isPeriodSelected ? '' : 'disabled'}>
                <i class="fas fa-calendar-days fa-fw"></i> Choisir
            </button>
            <span class="display-dates" style="display: block;">Aucun jour</span>
            <input type="hidden" class="selected-dates-list">
        </td>
        <td class="center">
            <select class="categorie-select">
                <option value="A">A (CHF ${hourlyRates['A'].toFixed(2)})</option>
                <option value="B">B (CHF ${hourlyRates['B'].toFixed(2)})</option>
                <option value="C">C (CHF ${hourlyRates['C'].toFixed(2)})</option>
            </select>
        </td>
        <td class="center">
            <input type="text" class="start-time-input" placeholder="HH:MM">
        </td>
        <td class="center">
            <input type="text" class="end-time-input" placeholder="HH:MM">
        </td>
        <td class="right">
            <input type="text" class="heures-calculadas" readonly>
        </td>
    `;

    addRowInputListeners(newRow);
}

/**
 * Updates the calculated hours for a specific row in the activities table.
 *
 * @param {HTMLElement} row The row to update.
 */
function updateRowHours(row) {
    const startTimeInput = row.querySelector('.start-time-input');
    const endTimeInput = row.querySelector('.end-time-input');
    const calculatedHoursInput = row.querySelector('.heures-calculadas');
    const hiddenDatesListInput = row.querySelector('.selected-dates-list');

    if (!startTimeInput || !endTimeInput || !calculatedHoursInput || !hiddenDatesListInput) return;

    validateTimeInput(startTimeInput);
    validateTimeInput(endTimeInput);

    const isStartTimeValid = timeFormatRegex.test(startTimeInput.value);
    const isEndTimeValid = timeFormatRegex.test(endTimeInput.value);

    const hoursPerSession = (isStartTimeValid && isEndTimeValid)
        ? calculateHoursSingleSession(startTimeInput.value, endTimeInput.value)
        : 0;

    const selectedDates = hiddenDatesListInput.value ? hiddenDatesListInput.value.split(',') : [];
    const numberOfDates = selectedDates.length;

    const totalHours = hoursPerSession * numberOfDates;
    calculatedHoursInput.value = totalHours > 0 ? totalHours.toFixed(2) : '';
}

/**
 * Fills the employee information fields when an employee is selected.
 */
function fillEmployeeInformation() {
    const select = document.getElementById('employe');
    const selectedValue = select.value;
    const addressInput = document.getElementById('adresseEmploye');
    const avsInput = document.getElementById('numeroAVS');
    const birthDateInput = document.getElementById('dateNaissance');
    const civilStateInput = document.getElementById('etatCivil');
    const childrenInput = document.getElementById('nombreEnfants');
    const cantonInput = document.getElementById('canton');
    const communeInput = document.getElementById('commune');
    const nationalityInput = document.getElementById('nationalite');
    const employeeSignatureName = document.getElementById('signatureEmployeNom');

    if (selectedValue) {
        const infos = selectedValue.split('|');
        addressInput.value = infos[1] ? infos[1].trim() : '';
        avsInput.value = infos[2] ? infos[2].trim() : '';
        birthDateInput.value = infos[3] ? infos[3].trim() : '';
        civilStateInput.value = infos[4] ? infos[4].trim() : '';
        childrenInput.value = infos[5] ? infos[5].trim() : '';
        cantonInput.value = infos[6] ? infos[6].trim() : '';
        communeInput.value = infos[7] ? infos[7].trim() : '';
        nationalityInput.value = infos[8] ? infos[8].trim() : '';

        // Update the employee's name in the signature.
        const employeeName = select.options[select.selectedIndex].text;
        employeeSignatureName.textContent = employeeName;
    } else {
        addressInput.value = '';
        avsInput.value = '';
        birthDateInput.value = '';
        civilStateInput.value = '';
        childrenInput.value = '';
        cantonInput.value = '';
        communeInput.value = '';
        nationalityInput.value = '';
        employeeSignatureName.textContent = '-';
    }

    periodInput.value = '';
    titleMonthSpan.textContent = '';
    document.getElementById('periodoPagamento').textContent = '-';
    if (activitiesTableBody) activitiesTableBody.innerHTML = '';

    addActivityRow();

    document.querySelectorAll('.btn-select-dates').forEach(btn => {
        btn.disabled = true;
    });

    const openCalendarBtnGlobal = document.getElementById('openCalendarBtnGlobal');
    if(openCalendarBtnGlobal) {
        openCalendarBtnGlobal.disabled = true;
    }

    document.getElementById('resultats').innerHTML = `<h3><i class="fas fa-poll fa-fw"></i> Résultats du Calcul</h3><p>Veuillez sélectionner le mois...</p>`;

    alertArea.innerHTML = '';

    checkAllLimits();
}

/**
 * Checks all the limits and displays alerts if any are exceeded.
 */
function checkAllLimits() {
    const selectedEmployeeOption = employeeSelect.options[employeeSelect.selectedIndex];
    const currentEmployeeName = selectedEmployeeOption.value ? selectedEmployeeOption.text : null;
    const periodValue = periodInput.value;

    alertArea.innerHTML = '';

    if (!currentEmployeeName || !periodValue) {
        return;
    }

    const monthlyTotals = {
        total: 0,
        A: 0,
        B: 0,
        C: 0
    };

    const weeklyTotals = {};
    const weeklyCategoryTotals = {
        'A': {},
        'B': {},
        'C': {}
    };

    if (!activitiesTableBody) return;

    activitiesTableBody.querySelectorAll('tr').forEach(row => {
        const calculatedHoursInput = row.querySelector('.heures-calculadas');
        const categorySelect = row.querySelector('.categorie-select');
        const hiddenDatesListInput = row.querySelector('.selected-dates-list');
        const startTimeInput = row.querySelector('.start-time-input');
        const endTimeInput = row.querySelector('.end-time-input');

        if (calculatedHoursInput && categorySelect && hiddenDatesListInput &&
            startTimeInput && endTimeInput &&
            !startTimeInput.classList.contains('input-error') &&
            !endTimeInput.classList.contains('input-error')) {

            const rowHours = parseFloat(calculatedHoursInput.value) || 0;
            const category = categorySelect.value;
            const selectedDatesStr = hiddenDatesListInput.value;
            const hoursPerSession = calculateHoursSingleSession(startTimeInput.value, endTimeInput.value);

            if (rowHours > 0 && selectedDatesStr && hoursPerSession > 0) {
                monthlyTotals.total += rowHours;

                if (monthlyTotals.hasOwnProperty(category)) {
                    monthlyTotals[category] += rowHours;
                }

                const dates = selectedDatesStr.split(',');
                dates.forEach(dateStr => {
                    if (dateStr) {
                        try {
                            const dateParts = dateStr.split('-');
                            const dateObj = new Date(Date.UTC(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2])));

                            if (isNaN(dateObj.getTime())) throw new Error("Date invalide");

                            const weekInfo = getWeekNumber(dateObj);
                            const weekKey = `${weekInfo.year}-W${String(weekInfo.week).padStart(2, '0')}`;

                            if (!weeklyTotals[weekKey]) weeklyTotals[weekKey] = 0;
                            weeklyTotals[weekKey] += hoursPerSession;

                            if (!weeklyCategoryTotals[category][weekKey]) weeklyCategoryTotals[category][weekKey] = 0;
                            weeklyCategoryTotals[category][weekKey] += hoursPerSession;

                        } catch (e) {
                            console.error("Err date weekly limit parse:", dateStr, e);
                        }
                    }
                });
            }
        }
    });

    let alertHTML = '<ul>';
    let hasAlerts = false;

    Object.keys(weeklyTotals).sort().forEach(weekKey => {
        const hours = weeklyTotals[weekKey];
        const weekNum = weekKey.split('W')[1];

        if (hours > individualWeeklyLimit) {
            hasAlerts = true;
            alertHTML += `<li><div class="alert alert-danger">DÉPASSÉ: Semaine ${weekNum}: ${hours.toFixed(2)}h / ${individualWeeklyLimit}h max!</div></li>`;
        } else if (hours > weeklyWarningLimit) {
            hasAlerts = true;
            alertHTML += `<li><div class="alert alert-warning">ATTENTION: Semaine ${weekNum}: ${hours.toFixed(2)}h / ${individualWeeklyLimit}h max.</div></li>`;
        }
    });

    ['A', 'B', 'C'].forEach(cat => {
        Object.keys(weeklyCategoryTotals[cat]).sort().forEach(weekKey => {
            const hours = weeklyCategoryTotals[cat][weekKey];
            const weekNum = weekKey.split('W')[1];
            const catLimit = weeklyCategoryLimits[cat];

            if (hours > catLimit) {
                hasAlerts = true;
                alertHTML += `<li><div class="alert alert-warning">FINANCEMENT: Catégorie ${cat}, Semaine ${weekNum}: ${hours.toFixed(2)}h dépasse la limite de ${catLimit}h</div></li>`;
            }
        });
    });

    if (monthlyTotals.total > overallMonthlyLimit) {
        hasAlerts = true;
        alertHTML += `<li><div class="alert alert-danger">DÉPASSÉ: Total mensuel: ${monthlyTotals.total.toFixed(2)}h dépasse la limite globale de ${overallMonthlyLimit}h!</div></li>`;
    } else if (monthlyTotals.total > 0) {
        hasAlerts = true;
        alertHTML += `<li><div class="alert alert-info">Total mensuel: ${monthlyTotals.total.toFixed(2)}h / ${overallMonthlyLimit}h max.</div></li>`;
    }

    if (monthlyTotals.total > 0) {
        hasAlerts = true;
        alertHTML += '<li><div class="alert alert-info" style="margin-top: 5px;"><strong>Totaux / Catégorie (vs Limites Financement Mensuel):</strong><ul>';

        let catDetail = '';
        ['A', 'B', 'C'].forEach(cat => {
            const catLimit = monthlyCategoryLimits[cat];
            const totalCat = monthlyTotals[cat];
            const status = totalCat > catLimit ? ' <strong style="color:#dc3545;">(DÉPASSÉ)</strong>' : '';

            catDetail += `<li style="font-size:0.9em;">Cat ${cat}: ${totalCat.toFixed(2)}h / ${catLimit}h${status}</li>`;
        });

        alertHTML += catDetail + '</ul></div></li>';
    }

    if (hasAlerts) {
        alertHTML += '</ul>';
        alertArea.innerHTML = alertHTML;
    } else if(currentEmployeeName && periodValue) {
        alertArea.innerHTML = `<div class="alert alert-info">Aucun avertissement de limite pour le moment.</div>`;
    }
}
