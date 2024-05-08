// Interface defining the structure for banking fee related data
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

// Constant object holding various fee rates and costs
const fees = {
  monthlyFee: 72,
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

// Utility class for currency formatting

class CurrencyFormatter {
  static formatCurrency(value: number): string {
    // Formats a numeric value into a currency string (Brazilian Real)
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }
}

// Class dedicated to fee calculations
class FeeCalculator {
  static calculateTotal(amount: number, rate: number): number {
    // Multiplies amount by rate to get total fee
    return amount * rate;
  }

  static calculateFees(feeData: IBankFees): { totalMonthly: number, totalAnnual: number } {
    // Calculate individual fees based on feeData and constants from fees object
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

    // Sum all monthly fees to get total monthly and calculate annual by multiplying by 12
    const totalMonthly = Object.values(monthlyDetails).reduce((acc, value) => acc + value, 0);
    const totalAnnual = totalMonthly * 12;

    // Output logs for debugging (REMOVE IT)
    console.log("Monthly Fee Breakdown:", monthlyDetails);
    console.log("Total Monthly Fee:", totalMonthly);
    console.log("Total Annual Fee:", totalAnnual);

    return { totalMonthly, totalAnnual };
  }
}

// Event handler for enforcing numeric input only
function enforceNumericInput(event: Event): void {
  const inputElement = event.target as HTMLInputElement;
  inputElement.value = inputElement.value.replace(/[^0-9]/g, "");
}

// Event handler to format inputs as currency
function formatCurrencyInput(event: Event): void {
  enforceNumericInput(event);
  const inputElement = event.target as HTMLInputElement;
  const num = parseInt(inputElement.value, 10) / 100;
  inputElement.value = num ? CurrencyFormatter.formatCurrency(num) : "";
}

// Initializes event listeners on specified input fields
function initializeCurrencyInputs(): void {
  const ids = ["pixSentAmount", "pixReceivedAmount", "numberOfBills", "numberOfLinks", "numberOfStatements", "numberOfPayments", "numberOfServices"];
  ids.forEach(id => {
    const inputElement = document.getElementById(id) as HTMLInputElement;
    inputElement.addEventListener("input", id.startsWith("pix") ? formatCurrencyInput : enforceNumericInput);
  });
}

// Attach event listener to ensure initialization is done after the DOM is fully loaded
document.addEventListener("DOMContentLoaded", initializeCurrencyInputs);

function parseCurrencyInput(value: string): number {
  return parseFloat(value.replace(/\D/g, "")) / 100 || 0;
}

// Global function to calculate and display total fees
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

  // Elements for displaying results and errors
  const errorOutputEl = document.getElementById("errorOutput") as HTMLElement;
  const totalMonthlyEl = document.getElementById("totalMonthly") as HTMLElement;
  const totalAnnualEl = document.getElementById("totalAnnual") as HTMLElement;

  // Check if all values are default and display error if true
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