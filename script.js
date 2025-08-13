const apiKey = "fca_live_KtZceYAUtlxO8i0OuRmo2hgYXhL2Hw5VP1Cgj3Xi";
const currencyListUrl = `https://api.freecurrencyapi.com/v1/currencies?apikey=${apiKey}`;
const latestRatesUrlBase = `https://api.freecurrencyapi.com/v1/latest?apikey=${apiKey}`;

const fromSelect = document.getElementById("fromCurrency");
const toSelect = document.getElementById("toCurrency");
const amountInput = document.getElementById("amount");
const convertBtn = document.getElementById("convertBtn");
const resultP = document.getElementById("result");

// Create a container for conversion history
const historyContainer = document.createElement("div");
historyContainer.id = "history";
document.body.appendChild(historyContainer);

let currencies = {};
let latestRates = {};
let baseCurrency = "USD"; // default base for rates caching
const refreshInterval = 5 * 60 * 1000; // 5 minutes in milliseconds
const conversionHistory = [];

// Fetch currencies list and populate dropdowns
fetch(currencyListUrl)
  .then((response) => response.json())
  .then((data) => {
    currencies = data.data;

    // Populate dropdowns
    for (const code in currencies) {
      const option1 = document.createElement("option");
      option1.value = code;
      option1.textContent = `${code} - ${currencies[code].name}`;
      fromSelect.appendChild(option1);

      const option2 = document.createElement("option");
      option2.value = code;
      option2.textContent = `${code} - ${currencies[code].name}`;
      toSelect.appendChild(option2);
    }

    fromSelect.value = "USD";
    toSelect.value = "EUR";

    // Initially fetch rates for default base currency
    fetchLatestRates(baseCurrency);

    // Setup auto refresh every X minutes
    setInterval(() => {
      fetchLatestRates(baseCurrency);
    }, refreshInterval);
  })
  .catch((err) => {
    console.error("Error fetching currencies list:", err);
    alert("Failed to load currency list. Please try again later.");
  });

// Function to fetch latest rates for a base currency and cache them
function fetchLatestRates(base) {
  fetch(`${latestRatesUrlBase}&base_currency=${base}`)
    .then((response) => response.json())
    .then((data) => {
      latestRates = data.data;
      baseCurrency = base;
      console.log(`Rates updated for base: ${base}`);
    })
    .catch((err) => {
      console.error("Error fetching latest rates:", err);
      alert("Failed to update exchange rates.");
    });
}

// Convert button click event
convertBtn.addEventListener("click", () => {
  const fromCurrency = fromSelect.value;
  const toCurrency = toSelect.value;
  const amount = parseFloat(amountInput.value);

  if (!amount || amount <= 0) {
    alert("Please enter a valid amount");
    return;
  }

  // If base currency changed, fetch rates for the new base
  if (fromCurrency !== baseCurrency) {
    fetchLatestRates(fromCurrency);
    baseCurrency = fromCurrency;
  }

  // Check if we have rates loaded for this base currency
  if (!latestRates || Object.keys(latestRates).length === 0) {
    alert("Exchange rates are not loaded yet. Please try again shortly.");
    return;
  }

  if (!latestRates[toCurrency]) {
    alert("Conversion rate not available for selected currency.");
    return;
  }

  const rate = latestRates[toCurrency];
  const convertedAmount = amount * rate;

  const resultText = `${amount} ${fromCurrency} = ${convertedAmount.toFixed(
    2
  )} ${toCurrency}`;
  resultP.textContent = resultText;

  // Add conversion to history (limit last 5)
  addToHistory(resultText);
});

// Adds conversion to the history list on the page
function addToHistory(text) {
  conversionHistory.unshift(text); // add to front
  if (conversionHistory.length > 5) conversionHistory.pop();

  historyContainer.innerHTML = "<h2>Conversion History</h2>";
  conversionHistory.forEach((entry) => {
    const p = document.createElement("p");
    p.textContent = entry;
    historyContainer.appendChild(p);
  });
}