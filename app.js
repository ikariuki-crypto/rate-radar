const CURRENCIES = ["KES", "RWF", "UGX", "TZS", "USD", "EUR", "GBP"];
const API = "https://open.er-api.com/v6/latest/";

const form = document.getElementById("convert-form");
const amountInput = document.getElementById("amount");
const fromSelect = document.getElementById("from");
const toSelect = document.getElementById("to");
const swapBtn = document.getElementById("swap");
const resultEl = document.getElementById("result");
const errorEl = document.getElementById("error");

function fillSelects() {
  CURRENCIES.forEach((code) => {
    fromSelect.add(new Option(code, code));
    toSelect.add(new Option(code, code));
  });
  fromSelect.value = "USD";
  toSelect.value = "KES";
}
// Fetches rates for the base currency from the API
async function getRate(from, to) {
  const response = await fetch(API + from, {cache: "no-store"});
  if (!response.ok) throw new Error("Rate service returned " + response.status);
  const data = await response.json();
  if (data.result !== "success") throw new Error("Rate service error");
  return data.rates[to];
}

async function convert(event) {
  event.preventDefault();
  errorEl.textContent = "";
  resultEl.textContent = "Fetching rate…";

  const amount = parseFloat(amountInput.value);
  const from = fromSelect.value;
  const to = toSelect.value;

  try {
    const rate = await getRate(from, to);
    const converted = amount * rate;
    resultEl.textContent = `${amount} ${from} = ${converted.toFixed(2)} ${to}`;
    addToHistory({ time: Date.now(), amount, from, to, result: converted });
  } catch (err) {
    resultEl.textContent = "";
    errorEl.textContent = "Couldn't fetch rates right now. Check your connection and try again.";
    console.error(err);
  }
}

function swap() {
  [fromSelect.value, toSelect.value] = [toSelect.value, fromSelect.value];
}

const historyBody = document.getElementById("history-body");
const searchInput = document.getElementById("search");
let history = [];
let sortKey = "time";
let sortAsc = false;

function renderHistory() {
  const query = searchInput.value.trim().toUpperCase();
  const rows = history
    .filter((h) => !query || h.from.includes(query) || h.to.includes(query))
    .sort((a, b) => {
      const diff = a[sortKey] > b[sortKey] ? 1 : a[sortKey] < b[sortKey] ? -1 : 0;
      return sortAsc ? diff : -diff;
    });

  historyBody.innerHTML = rows
    .map(
      (h) => `<tr>
        <td>${new Date(h.time).toLocaleTimeString()}</td>
        <td>${h.amount}</td>
        <td>${h.from} → ${h.to}</td>
        <td>${h.result.toFixed(2)}</td>
      </tr>`
    )
    .join("");
}

function addToHistory(entry) {
  history.unshift(entry);
  history = history.slice(0, 20);
  renderHistory();
}

document.querySelectorAll("th[data-sort]").forEach((th) => {
  th.addEventListener("click", () => {
    const key = th.dataset.sort;
    sortAsc = sortKey === key ? !sortAsc : true;
    sortKey = key;
    renderHistory();
  });
});

searchInput.addEventListener("input", renderHistory);

fillSelects();
form.addEventListener("submit", convert);
swapBtn.addEventListener("click", swap);
