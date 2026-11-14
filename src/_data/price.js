// Room price per night. The site picks the price that applies on the day it is built
// (Dutch time). A scheduled build in .github/workflows/static.yml runs just after
// midnight on 1 January, so a new price appears on the site on its start date.
//
// To change the price: add a line with the new amount and the date it starts.
const prices = [
  { amount: "€118,50", from: "2000-01-01" },
  { amount: "€123,50", from: "2027-01-01" }
];

// PRICE_DATE=YYYY-MM-DD overrides "today", to preview a future price locally.
function today() {
  if (process.env.PRICE_DATE) return process.env.PRICE_DATE;
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Amsterdam" }).format(new Date());
}

module.exports = function () {
  const date = today();
  const current = prices
    .filter((price) => price.from <= date)
    .sort((a, b) => a.from.localeCompare(b.from))
    .pop();
  return { current: current.amount, date };
};
