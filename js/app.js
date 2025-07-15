const app = Vue.createApp({
    data() {
        return {
            employees: employees,
            selectedEmployee: '',
            period: '',
            overtimeHours: 0,
            overtimeRate: 125,
            bonus: 0,
            activities: [],
            results: ''
        }
    },
    methods: {
        addActivityRow() {
            this.activities.push({
                activity: '',
                workedDays: '',
                category: 'A',
                startTime: '',
                endTime: '',
                totalHours: 0
            });
        },
        calculateSalary() {
            this.results = calculateSalary(this.activities, this.overtimeHours, this.overtimeRate, this.bonus);
        },
        printForEmployer() {
            printForEmployer();
        },
        printForEmployee() {
            printForEmployee();
        },
        sendEmail() {
            sendEmail();
        }
    },
    mounted() {
        this.addActivityRow();
    }
});

app.mount('#app');
