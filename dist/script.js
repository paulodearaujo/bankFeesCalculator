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
    pixSendPercentage: 0.014, // 1.4% para Pix enviado
    pixReceivePercentage: 0.014 // 1.4% para Pix recebido
};
class CurrencyFormatter {
    static formatCurrency(value) {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
}
class FeeCalculator {
    static calculateFees(feeData) {
        if (Object.values(feeData).every(value => value === 0 && typeof value === 'number')) {
            return null; // Não realizar cálculo se todos os valores numéricos forem zero
        }
        const monthlyDetails = {
            pixTotal: feeData.pixSentAmount * fees.pixSendPercentage + feeData.pixReceivedAmount * fees.pixReceivePercentage,
            billTotal: feeData.numberOfBills * fees.billGenerationFee,
            linkTotal: feeData.numberOfLinks * fees.paymentLinkFee,
            statementTotal: feeData.numberOfStatements * fees.accountStatementFee,
            paymentTotal: feeData.numberOfPayments * fees.billPaymentFee,
            serviceTotal: feeData.numberOfServices * fees.serviceFee,
            monthlyFee: fees.monthlyFee,
            maintenanceFee: fees.maintenanceFee,
            creditCardMonthlyFee: feeData.hasCreditCard ? fees.creditCardAnnualFee : 0
        };
        const totalMonthly = Object.values(monthlyDetails).reduce((sum, value) => sum + value, 0);
        const annualDetails = Object.fromEntries(Object.entries(monthlyDetails).map(([key, val]) => [key, val * 12]));
        const totalAnnual = totalMonthly * 12;
        return { details: monthlyDetails, annualDetails, totalMonthly, totalAnnual };
    }
    static formatDetails(details, formatter) {
        return Object.entries(details).map(([key, value]) => `${key.replace(/([A-Z])/g, ' $1').trim()}: ${formatter(value)}<br/>`).join('');
    }
}
function parseInput(id) {
    const inputElement = document.getElementById(id);
    const number = parseFloat(inputElement.value);
    return !isNaN(number) && number >= 0 ? number : 0;
}
function displayResults(results) {
    const totalMonthlyEl = document.getElementById('totalMonthly');
    const totalAnnualEl = document.getElementById('totalAnnual');
    const monthlyDetailsEl = document.getElementById('monthlyDetails');
    const annualDetailsEl = document.getElementById('annualDetails');
    if (!results) {
        totalMonthlyEl.textContent = "Insira valores válidos para calcular";
        monthlyDetailsEl.textContent = "";
        annualDetailsEl.textContent = "";
        totalAnnualEl.textContent = "";
        return;
    }
    totalMonthlyEl.textContent = CurrencyFormatter.formatCurrency(results.totalMonthly);
    totalAnnualEl.textContent = CurrencyFormatter.formatCurrency(results.totalAnnual);
    monthlyDetailsEl.innerHTML = FeeCalculator.formatDetails(results.details, CurrencyFormatter.formatCurrency);
    annualDetailsEl.innerHTML = FeeCalculator.formatDetails(results.annualDetails, CurrencyFormatter.formatCurrency);
}
window.calculateTotalFees = () => {
    const feeData = {
        pixSentAmount: parseInput('pixSentAmount'),
        pixReceivedAmount: parseInput('pixReceivedAmount'),
        numberOfBills: parseInput('numberOfBills'),
        numberOfLinks: parseInput('numberOfLinks'),
        numberOfStatements: parseInput('numberOfStatements'),
        numberOfPayments: parseInput('numberOfPayments'),
        numberOfServices: parseInput('numberOfServices'),
        hasCreditCard: document.getElementById('hasCreditCard').value === 'true'
    };
    const results = FeeCalculator.calculateFees(feeData);
    displayResults(results);
};