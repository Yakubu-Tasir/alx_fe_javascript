// Default quotes
let quotes = [
  { text: "The best way to predict the future is to create it.", category: "Motivation" },
  { text: "In the middle of every difficulty lies opportunity.", category: "Inspiration" },
  { text: "Do what you can, with what you have, where you are.", category: "Wisdom" }
];

// Select DOM elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuoteBtn");
const newQuoteText = document.getElementById("newQuoteText");
const newQuoteCategory = document.getElementById("newQuoteCategory");

// Function to show a random quote
function showRandomQuote() {
  if (quotes.length === 0) {
    quoteDisplay.innerHTML = "No quotes available. Please add one!";
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const { text, category } = quotes[randomIndex];

  quoteDisplay.innerHTML = `
    <p>"${text}"</p>
    <strong>Category:</strong> ${category}
  `;
}

// Function to add a new quote dynamically
function addQuote() {
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim();

  if (!text || !category) {
    alert("Please enter both quote text and category.");
    return;
  }

  // Add new quote object to array
  quotes.push({ text, category });

  // Clear inputs
  newQuoteText.value = "";
  newQuoteCategory.value = "";

  alert("Quote added successfully!");
}

// Event listeners
newQuoteBtn.addEventListener("click", showRandomQuote);
addQuoteBtn.addEventListener("click", addQuote);

// Display an initial random quote on load
document.addEventListener("DOMContentLoaded", showRandomQuote);
