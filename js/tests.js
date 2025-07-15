QUnit.module('Calculations', function() {
    QUnit.test('calculateAdjustedRates', function(assert) {
        let rates = calculateAdjustedRates(false, false);
        assert.equal(rates.adjusted.A, 65.15, 'Category A rate should be 65.15');
        assert.equal(rates.adjusted.B, 52.95, 'Category B rate should be 52.95');
        assert.equal(rates.adjusted.C, 35.30, 'Category C rate should be 35.30');

        rates = calculateAdjustedRates(true, false);
        assert.close(rates.adjusted.A, 60.14, 0.01, 'Category A rate with holidays should be close to 60.14');
        assert.close(rates.adjusted.B, 48.88, 0.01, 'Category B rate with holidays should be close to 48.88');
        assert.close(rates.adjusted.C, 32.59, 0.01, 'Category C rate with holidays should be close to 32.59');

        rates = calculateAdjustedRates(true, true);
        assert.close(rates.adjusted.A, 55.85, 0.01, 'Category A rate with holidays and 13th month should be close to 55.85');
        assert.close(rates.adjusted.B, 45.39, 0.01, 'Category B rate with holidays and 13th month should be close to 45.39');
        assert.close(rates.adjusted.C, 30.26, 0.01, 'Category C rate with holidays and 13th month should be close to 30.26');
    });

    QUnit.test('getWeekNumber', function(assert) {
        let date = new Date('2024-01-01');
        let week = getWeekNumber(date);
        assert.equal(week.week, 1, 'Week number for 2024-01-01 should be 1');

        date = new Date('2024-12-31');
        week = getWeekNumber(date);
        assert.equal(week.week, 1, 'Week number for 2024-12-31 should be 1');
    });

    QUnit.test('calculateHoursSingleSession', function(assert) {
        let hours = calculateHoursSingleSession('08:00', '12:00');
        assert.equal(hours, 4, 'Hours between 08:00 and 12:00 should be 4');

        hours = calculateHoursSingleSession('13:00', '17:30');
        assert.equal(hours, 4.5, 'Hours between 13:00 and 17:30 should be 4.5');

        hours = calculateHoursSingleSession('22:00', '02:00');
        assert.equal(hours, 4, 'Hours between 22:00 and 02:00 should be 4');
    });
});
