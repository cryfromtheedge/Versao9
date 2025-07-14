/* Month Select Plugin for Flatpickr */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.monthSelectPlugin = factory());
}(this, (function () { 'use strict';

    function monthSelectPlugin(pluginConfig) {
        var defaultConfig = {
            shorthand: false,
            dateFormat: "F Y",
            altFormat: "F Y",
            theme: "light"
        };
        
        var config = Object.assign({}, defaultConfig, pluginConfig);
        
        return function(fp) {
            var monthContainer;
            var selectedDate;
            
            function createMonthPicker() {
                monthContainer = document.createElement("div");
                monthContainer.className = "flatpickr-monthSelect-months";
                
                var months = fp.l10n.months.longhand;
                
                months.forEach(function(month, index) {
                    var monthElement = document.createElement("div");
                    monthElement.className = "flatpickr-monthSelect-month";
                    monthElement.textContent = config.shorthand ? fp.l10n.months.shorthand[index] : month;
                    monthElement.addEventListener("click", function() {
                        selectMonth(index);
                    });
                    monthContainer.appendChild(monthElement);
                });
                
                return monthContainer;
            }
            
            function selectMonth(monthIndex) {
                var year = fp.currentYear;
                var newDate = new Date(year, monthIndex, 1);
                
                selectedDate = newDate;
                fp.setDate(newDate, true);
                fp.close();
                
                updateSelectedMonth(monthIndex);
            }
            
            function updateSelectedMonth(monthIndex) {
                var months = monthContainer.querySelectorAll('.flatpickr-monthSelect-month');
                months.forEach(function(month, index) {
                    month.classList.toggle('selected', index === monthIndex);
                });
            }
            
            return {
                onReady: function() {
                    fp.calendarContainer.innerHTML = '';
                    fp.calendarContainer.appendChild(createMonthPicker());
                    
                    // Set initial date if provided
                    if (fp.selectedDates.length > 0) {
                        updateSelectedMonth(fp.selectedDates[0].getMonth());
                    }
                },
                
                onChange: function(selectedDates) {
                    if (selectedDates.length > 0) {
                        var date = selectedDates[0];
                        var formattedDate = fp.formatDate(date, config.dateFormat);
                        fp.input.value = formattedDate;
                        
                        // Update the display format
                        if (config.altFormat && fp.altInput) {
                            fp.altInput.value = fp.formatDate(date, config.altFormat);
                        }
                    }
                }
            };
        };
    }

    return monthSelectPlugin;
})));

