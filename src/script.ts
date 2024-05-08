interface IBankFees {
  pixSentAmount: number;
  pixReceivedAmount: number;
  numberOfBills: number;
  numberOfLinks: number;
  numberOfStatements: number;
  numberOfPayments: number;
  numberOfServices: number;
  hasCreditCard: boolean;
}

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
  static formatCurrency(value: number): string {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }
}

class FeeCalculator {
  static calculateTotal(amount: number, rate: number): number {
    return amount * rate;
  }

  static calculateFees(feeData: IBankFees): { totalMonthly: number, totalAnnual: number } {
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

function enforceNumericInput(event: Event): void {
  const inputElement = event.target as HTMLInputElement;
  inputElement.value = inputElement.value.replace(/[^0-9]/g, "");
}

function formatCurrencyInput(event: Event): void {
  enforceNumericInput(event);
  const inputElement = event.target as HTMLInputElement;
  const num = parseInt(inputElement.value, 10) / 100;
  inputElement.value = num ? CurrencyFormatter.formatCurrency(num) : "";
}

function initializeCurrencyInputs(): void {
  const ids = ["pixSentAmount", "pixReceivedAmount", "numberOfBills", "numberOfLinks", "numberOfStatements", "numberOfPayments", "numberOfServices"];
  ids.forEach(id => {
    const inputElement = document.getElementById(id) as HTMLInputElement;
    inputElement.addEventListener("input", id.startsWith("pix") ? formatCurrencyInput : enforceNumericInput);
  });
}

document.addEventListener("DOMContentLoaded", initializeCurrencyInputs);

function parseCurrencyInput(value: string): number {
  return parseFloat(value.replace(/\D/g, "")) / 100 || 0;
}

(window as any).calculateTotalFees = () => {
  const feeData: IBankFees = {
    pixSentAmount: parseCurrencyInput((document.getElementById("pixSentAmount") as HTMLInputElement).value),
    pixReceivedAmount: parseCurrencyInput((document.getElementById("pixReceivedAmount") as HTMLInputElement).value),
    numberOfBills: parseInt((document.getElementById("numberOfBills") as HTMLInputElement).value, 10) || 0,
    numberOfLinks: parseInt((document.getElementById("numberOfLinks") as HTMLInputElement).value, 10) || 0,
    numberOfStatements: parseInt((document.getElementById("numberOfStatements") as HTMLInputElement).value, 10) || 0,
    numberOfPayments: parseInt((document.getElementById("numberOfPayments") as HTMLInputElement).value, 10) || 0,
    numberOfServices: parseInt((document.getElementById("numberOfServices") as HTMLInputElement).value, 10) || 0,
    hasCreditCard: (document.getElementById("hasCreditCard") as HTMLSelectElement).value === "true"
  };

  const errorOutputEl = document.getElementById("errorOutput") as HTMLElement;
  const totalMonthlyEl = document.getElementById("totalMonthly") as HTMLElement;
  const totalAnnualEl = document.getElementById("totalAnnual") as HTMLElement;

  if (Object.values(feeData).every(value => typeof value === "number" ? value === 0 : !value)) {
    errorOutputEl.textContent = "Por favor, insira ao menos um valor para calcular.";
    totalMonthlyEl.textContent = "R$0,00";
    totalAnnualEl.textContent = "R$0,00";
  } else {
    errorOutputEl.textContent = "";
    const results = FeeCalculator.calculateFees(feeData);
    totalMonthlyEl.textContent = CurrencyFormatter.formatCurrency(results.totalMonthly);
    totalAnnualEl.textContent = CurrencyFormatter.formatCurrency(results.totalAnnual);
  }

};