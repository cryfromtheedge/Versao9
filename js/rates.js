// An object that maps the activity category to the hourly rate.
const hourlyRates = {'A': 65.15, 'B': 52.95, 'C': 35.30};

// An object that maps the activity to the activity category.
const activityCategoryMap = {
    "Actes ordinaires de la vie": "B",
    "Tenue du ménage": "B",
    "Participation à la vie sociale et loisirs": "A",
    "Soins particulièrement astreignants": "B",
    "Domaine de la vie": "C",
    "Domaine Surveillance pendant la journe": "B",
    "Domaine Surveillance pendant la journe/Nuit": "C",
    "Logement": "B",
    "Travail et formation": "A",
    "Relations sociales": "A",
    "Loisirs": "A",
    "Santé et bien-être": "B",
    "Exercices dextérité/mémoire": "A"
};

// The individual weekly limit for the number of hours worked.
const individualWeeklyLimit = 50;

// The weekly warning limit for the number of hours worked.
const weeklyWarningLimit = 45;

// The overall monthly limit for the number of hours worked.
const overallMonthlyLimit = 250;

// An object that maps the activity category to the weekly limit for the number of hours worked.
const weeklyCategoryLimits = {
    'A': 7,
    'B': 29,
    'C': 76
};

// An object that maps the activity category to the monthly limit for the number of hours worked.
const monthlyCategoryLimits = {
    'A': 32,
    'B': 102,
    'C': 218
};
