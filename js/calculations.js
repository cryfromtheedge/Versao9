/**
 * Calculates the adjusted hourly rates based on the selected benefits.
 *
 * @param {boolean} includeHolidays  Whether to include the holiday allowance in the calculation.
 * @param {boolean} include13thMonth Whether to include the 13th month salary in the calculation.
 * @returns {object} An object containing the original and adjusted rates, and the benefits percentage.
 */
function calculateAdjustedRates(includeHolidays, include13thMonth) {
    const rates = {
        'A': 65.15,
        'B': 52.95,
        'C': 35.30
    };

    let benefitsPercent = 0;
    if (includeHolidays) benefitsPercent += 0.0833; // 8.33%
    if (include13thMonth) benefitsPercent += 0.0833; // 8.33%

    const adjustedRates = {};
    for (const [category, rate] of Object.entries(rates)) {
        adjustedRates[category] = rate / (1 + benefitsPercent);
    }

    return {
        original: rates,
        adjusted: adjustedRates,
        benefitsPercent: benefitsPercent * 100
    };
}

/**
 * Gets the week number for a given date.
 *
 * @param {Date} d The date.
 * @returns {object} An object containing the week number and the year.
 */
function getWeekNumber(d) {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
    var yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    var weekNo = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
    return { week: weekNo, year: date.getUTCFullYear() };
}

/**
 * Calculates the number of hours between two times.
 *
 * @param {string} startTime The start time in HH:MM format.
 * @param {string} endTime   The end time in HH:MM format.
 * @returns {number} The number of hours between the two times.
 */
function calculateHoursSingleSession(startTime, endTime) {
    if (!timeFormatRegex.test(startTime) || !timeFormatRegex.test(endTime)) return 0;
    try {
        const start = startTime.split(':');
        const end = endTime.split(':');
        const startMinutes = parseInt(start[0], 10) * 60 + parseInt(start[1], 10);
        const endMinutes = parseInt(end[0], 10) * 60 + parseInt(end[1], 10);
        let diffMinutes = endMinutes - startMinutes;
        if (diffMinutes < 0) diffMinutes += 24 * 60;
        return diffMinutes / 60;
    } catch (e) {
        console.error("Erreur calcul heures:", e);
        return 0;
    }
}

/**
 * Calculates the salary and displays the results.
 */
function calculateSalary() {
    let grossSalary = 0;
    let totalCalculatedHours = 0;
    let totalOvertimeHours = 0;
    const resultsDiv = document.getElementById('resultats');

    // Get the values of the overtime hours, the overtime rate, and the bonus.
    const overtimeHours = parseFloat(document.getElementById('heuresExtras').value) || 0;
    const overtimeRate = parseFloat(document.getElementById('tauxHeuresExtras').value) || 125;
    const bonus = parseFloat(document.getElementById('bonus').value) || 0;

    let calculationDetailsHtml = `
        <h3><i class="fas fa-list-ul fa-fw"></i> Détail des Prestations</h3>
        <table>
            <thead>
                <tr>
                    <th>Activité</th>
                    <th class="center">Jours Travaillés</th>
                    <th class="center">Cat.</th>
                    <th class="center">Début</th>
                    <th class="center">Fin</th>
                    <th class="right">Heures (Total Ligne)</th>
                    <th class="right">Tarif/h</th>
                    <th class="right">Total Ligne (CHF)</th>
                </tr>
            </thead>
            <tbody>
    `;

    let hasValidEntries = false;
    let hasInvalidTimes = false;

    if (!activitiesTableBody) return;

    document.querySelectorAll('#tableTravaux tbody tr').forEach(row => {
        updateRowHours(row);

        const activitySelect = row.querySelector('.activite-select');
        const displayDatesSpan = row.querySelector('.display-dates');
        const categorySelect = row.querySelector('.categorie-select');
        const startTimeInput = row.querySelector('.start-time-input');
        const endTimeInput = row.querySelector('.end-time-input');
        const calculatedHoursInput = row.querySelector('.heures-calculadas');

        if (!activitySelect || !displayDatesSpan || !categorySelect ||
            !startTimeInput || !endTimeInput || !calculatedHoursInput) return;

        if (startTimeInput.classList.contains('input-error') ||
            endTimeInput.classList.contains('input-error')) {
            hasInvalidTimes = true;
        }

        const activity = activitySelect.value;
        const workedDaysDisplay = displayDatesSpan.textContent === 'Aucun jour' ? '-' : displayDatesSpan.textContent;
        const category = categorySelect.value;
        const startTime = startTimeInput.value;
        const endTime = endTimeInput.value;
        const rowHours = parseFloat(calculatedHoursInput.value) || 0;

        if (activity && rowHours > 0 && hourlyRates[category] &&
            !startTimeInput.classList.contains('input-error') &&
            !endTimeInput.classList.contains('input-error')) {

            hasValidEntries = true;
            const hourlyRate = hourlyRates[category];
            const rowTotal = rowHours * hourlyRate;

            grossSalary += rowTotal;
            totalCalculatedHours += rowHours;

            calculationDetailsHtml += `
                <tr>
                    <td>${activity}</td>
                    <td class="center">${workedDaysDisplay}</td>
                    <td class="center">${category}</td>
                    <td class="center">${startTime || '-'}</td>
                    <td class="center">${endTime || '-'}</td>
                    <td class="right">${rowHours.toFixed(2)}</td>
                    <td class="right">${hourlyRate.toFixed(2)}</td>
                    <td class="right">${rowTotal.toFixed(2)}</td>
                </tr>
            `;
        }
    });

    calculationDetailsHtml += `</tbody></table>`;

    if (hasInvalidTimes) {
        resultsDiv.innerHTML = `
            <h3><i class="fas fa-poll fa-fw"></i> Résultats du Calcul</h3>
            <p style="color: red;">Veuillez corriger les heures invalides (marquées en rouge).</p>
            ${calculationDetailsHtml}
        `;
        return;
    }

    if (!hasValidEntries && overtimeHours === 0 && bonus === 0) {
        resultsDiv.innerHTML = `
            <h3><i class="fas fa-poll fa-fw"></i> Résultats du Calcul</h3>
            <p style="color: red;">Veuillez renseigner au moins une ligne valide ou des heures extras/bonus.</p>
        `;
        return;
    }

    // Calculate the overtime pay.
    let overtimePay = 0;
    if (overtimeHours > 0) {
        // Use the average rate or the rate for category B as the basis for the overtime pay.
        const averageOvertimeRate = hourlyRates['B']; // Or calculate the average of the rates used.
        overtimePay = overtimeHours * averageOvertimeRate * (overtimeRate / 100);
        totalOvertimeHours = overtimeHours;
    }

    // Calculate the total gross salary, including overtime and bonus.
    const totalGrossSalary = grossSalary + overtimePay + bonus;

    const avsRate = 0.053; // 5.3%
    const acRate = 0.011;  // 1.1%
    const lppRate = 0.075; // 7.5%
    const accidentRate = 0.01; // 1%

    const avsDeduction = totalGrossSalary * avsRate;
    const acDeduction = totalGrossSalary * acRate;
    const lppDeduction = totalGrossSalary * lppRate;
    const accidentDeduction = totalGrossSalary * accidentRate;

    const totalDeductions = avsDeduction + acDeduction + lppDeduction + accidentDeduction;
    const netSalary = totalGrossSalary - totalDeductions;

    // Check if the benefits are enabled.
    const includeHolidays = document.getElementById('includeVacances')?.checked || false;
    const include13thMonth = document.getElementById('include13eme')?.checked || false;

    // Calculate the values of the benefits.
    let holidaysValue = 0;
    let thirteenthMonthValue = 0;
    let adjustedGrossSalary = totalGrossSalary;

    if (includeHolidays || include13thMonth) {
        let benefitsPercent = 0;
        if (includeHolidays) benefitsPercent += 0.0833; // 8.33%
        if (include13thMonth) benefitsPercent += 0.0833; // 8.33%

        // Calculate the adjusted base salary.
        adjustedGrossSalary = totalGrossSalary / (1 + benefitsPercent);

        if (includeHolidays) {
            holidaysValue = adjustedGrossSalary * 0.0833;
        }
        if (include13thMonth) {
            thirteenthMonthValue = adjustedGrossSalary * 0.0833;
        }
    }

    resultsDiv.innerHTML = `
        ${calculationDetailsHtml}
        <p class="lpp-comment" style="font-size:0.8em; color: #6c757d; text-align: right;">
            <i>* LPP et Assurance Accidents basés sur des taux fixes simplifiés.</i>
        </p>
        <h3><i class="fas fa-file-invoice-dollar fa-fw"></i> Résumé du Salaire du Mois</h3>
        <table>
            <tbody>
                <tr>
                    <td class="total-label"><i class="fas fa-clock fa-fw"></i> Total Heures Travaillées (Activités)</td>
                    <td class="total-value">${totalCalculatedHours.toFixed(2)} h</td>
                </tr>
                ${totalOvertimeHours > 0 ? `
                <tr>
                    <td class="total-label"><i class="fas fa-clock fa-fw"></i> Heures Extras (${overtimeRate}%)</td>
                    <td class="total-value">${totalOvertimeHours.toFixed(2)} h</td>
                </tr>` : ''}
                <tr>
                    <td class="total-label"><i class="fas fa-coins fa-fw"></i> Salaire ${(includeHolidays || include13thMonth) ? 'Base' : 'Brut'} (Activités)</td>
                    <td class="total-value">CHF ${(includeHolidays || include13thMonth) ? adjustedGrossSalary.toFixed(2) : grossSalary.toFixed(2)}</td>
                </tr>
                ${overtimePay > 0 ? `
                <tr>
                    <td class="total-label"><i class="fas fa-plus fa-fw"></i> Heures Extras</td>
                    <td class="total-value">CHF ${overtimePay.toFixed(2)}</td>
                </tr>` : ''}
                ${bonus > 0 ? `
                <tr>
                    <td class="total-label"><i class="fas fa-award fa-fw"></i> Bonus/Primes</td>
                    <td class="total-value">CHF ${bonus.toFixed(2)}</td>
                </tr>` : ''}
                ${includeHolidays ? `
                <tr class="benefits-header">
                    <td class="total-label"><i class="fas fa-umbrella-beach fa-fw"></i> Indemnité de vacances (8,33%)</td>
                    <td class="total-value">CHF ${holidaysValue.toFixed(2)}</td>
                </tr>` : ''}
                ${include13thMonth ? `
                <tr class="benefits-header">
                    <td class="total-label"><i class="fas fa-gift fa-fw"></i> 13ème salaire (8,33%)</td>
                    <td class="total-value">CHF ${thirteenthMonthValue.toFixed(2)}</td>
                </tr>` : ''}
                <tr>
                    <td class="total-label"><i class="fas fa-calculator fa-fw"></i> <strong>Salaire Brut Total</strong></td>
                    <td class="total-value"><strong>CHF ${totalGrossSalary.toFixed(2)}</strong></td>
                </tr>
                <tr class="deductions-header">
                    <td colspan="2" style="background-color: #e9ecef; font-weight: bold; padding-top: 15px;">
                        <i class="fas fa-circle-minus fa-fw"></i> Déductions Sociales
                    </td>
                </tr>
                <tr>
                    <td>AVS/AI/APG <span class="deduction-percentage">(${(avsRate * 100).toFixed(1)}%)</span></td>
                    <td class="total-value">CHF ${avsDeduction.toFixed(2)}</td>
                </tr>
                <tr>
                    <td>AC (Assurance-chômage) <span class="deduction-percentage">(${(acRate * 100).toFixed(1)}%)</span></td>
                    <td class="total-value">CHF ${acDeduction.toFixed(2)}</td>
                </tr>
                <tr>
                    <td>LPP (Prévoyance prof.)* <span class="deduction-percentage">(${(lppRate * 100).toFixed(1)}%)</span></td>
                    <td class="total-value">CHF ${lppDeduction.toFixed(2)}</td>
                </tr>
                <tr>
                    <td>Assurance Accidents (non prof.)* <span class="deduction-percentage">(${(accidentRate * 100).toFixed(1)}%)</span></td>
                    <td class="total-value">CHF ${accidentDeduction.toFixed(2)}</td>
                </tr>
                <tr>
                    <td class="total-label"><i class="fas fa-calculator fa-fw"></i> Total des Déductions</td>
                    <td class="total-value">CHF ${totalDeductions.toFixed(2)}</td>
                </tr>
                <tr class="net-salary">
                    <td class="total-label"><i class="fas fa-hand-holding-usd fa-fw"></i> Salaire Net</td>
                    <td class="total-value">CHF ${netSalary.toFixed(2)}</td>
                </tr>
            </tbody>
        </table>
    `;

    checkAllLimits();
}
