"use strict";
const fees = {
    monthlyFee: 163.58,
    maintenanceFee: 73.48,
    billGenerationFee: 3.50,
    paymentLinkFee: 6.63,
    creditCardAnnualFee: 331.17 / 12,
    accountStatementFee: 7.15,
    billPaymentFee: 2.50,
    serviceFee: 0.40,
    pixSendPercentage: 0.014,
    pixReceivePercentage: 0.014
};
class CurrencyFormatter {
    static formatCurrency(value) {
        return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    }
}
class FeeCalculator {
    static calculateTotal(amount, rate) {
        return amount * rate;
    }
    static calculateFees(feeData) {
        const monthlyDetails = {
            pixTotal: this.calculateTotal(feeData.pixSentAmount, fees.pixSendPercentage) +
                this.calculateTotal(feeData.pixReceivedAmount, fees.pixReceivePercentage),
            billTotal: this.calculateTotal(feeData.numberOfBills, fees.billGenerationFee),
            linkTotal: this.calculateTotal(feeData.numberOfLinks, fees.paymentLinkFee),
            statementTotal: this.calculateTotal(feeData.numberOfStatements, fees.accountStatementFee),
            paymentTotal: this.calculateTotal(feeData.numberOfPayments, fees.billPaymentFee),
            serviceTotal: this.calculateTotal(feeData.numberOfServices, fees.serviceFee),
            monthlyFee: fees.monthlyFee,
            maintenanceFee: fees.maintenanceFee,
            creditCardMonthlyFee: feeData.hasCreditCard ? fees.creditCardAnnualFee : 0
        };
        const totalMonthly = Object.values(monthlyDetails).reduce((acc, value) => acc + value, 0);
        const totalAnnual = totalMonthly * 12;
        // Logging each value in the monthlyDetails
        console.log("Monthly Fee Breakdown:", monthlyDetails);
        console.log("Total Monthly Fee:", totalMonthly);
        console.log("Total Annual Fee:", totalAnnual);
        return { totalMonthly, totalAnnual };
    }
}
function enforceNumericInput(event) {
    const inputElement = event.target;
    inputElement.value = inputElement.value.replace(/[^0-9]/g, "");
}
function formatCurrencyInput(event) {
    enforceNumericInput(event);
    const inputElement = event.target;
    const num = parseInt(inputElement.value, 10) / 100;
    inputElement.value = num ? CurrencyFormatter.formatCurrency(num) : "";
}
function initializeCurrencyInputs() {
    const ids = ["pixSentAmount", "pixReceivedAmount", "numberOfBills", "numberOfLinks", "numberOfStatements", "numberOfPayments", "numberOfServices"];
    ids.forEach(id => {
        const inputElement = document.getElementById(id);
        inputElement.addEventListener("input", id.startsWith("pix") ? formatCurrencyInput : enforceNumericInput);
    });
}
document.addEventListener("DOMContentLoaded", initializeCurrencyInputs);
function parseCurrencyInput(value) {
    return parseFloat(value.replace(/\D/g, "")) / 100 || 0;
}
window.calculateTotalFees = () => {
    const feeData = {
        pixSentAmount: parseCurrencyInput(document.getElementById("pixSentAmount").value),
        pixReceivedAmount: parseCurrencyInput(document.getElementById("pixReceivedAmount").value),
        numberOfBills: parseInt(document.getElementById("numberOfBills").value, 10) || 0,
        numberOfLinks: parseInt(document.getElementById("numberOfLinks").value, 10) || 0,
        numberOfStatements: parseInt(document.getElementById("numberOfStatements").value, 10) || 0,
        numberOfPayments: parseInt(document.getElementById("numberOfPayments").value, 10) || 0,
        numberOfServices: parseInt(document.getElementById("numberOfServices").value, 10) || 0,
        hasCreditCard: document.getElementById("hasCreditCard").value === "true"
    };
    const errorOutputEl = document.getElementById("errorOutput");
    const totalMonthlyEl = document.getElementById("totalMonthly");
    const totalAnnualEl = document.getElementById("totalAnnual");
    if (Object.values(feeData).every(value => typeof value === "number" ? value === 0 : !value)) {
        errorOutputEl.textContent = "Por favor, insira ao menos um valor para calcular.";
        totalMonthlyEl.textContent = "";
        totalAnnualEl.textContent = "";
    }
    else {
        errorOutputEl.textContent = "";
        const results = FeeCalculator.calculateFees(feeData);
        totalMonthlyEl.textContent = CurrencyFormatter.formatCurrency(results.totalMonthly);
        totalAnnualEl.textContent = CurrencyFormatter.formatCurrency(results.totalAnnual);
    }
};
