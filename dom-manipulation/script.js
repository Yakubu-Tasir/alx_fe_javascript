// Initialize the quotes array
let quotes = [
  { text: "The best way to predict the future is to create it.", category: "Motivation" },
  { text: "In the middle of every difficulty lies opportunity.", category: "Inspiration" },
  { text: "Do what you can, with what you have, where you are.", category: "Wisdom" }
];

// Select DOM elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteButton = document.getElementById("newQuote");
const newQuoteText = document.getElementById("newQuoteText");
const newQuoteCategory = document.getElementById("newQuoteCategory");

// Function to display a random quote
function showRandomQuote() {
  if (quotes.length === 0) {
    quoteDisplay.innerHTML = "<p>No quotes available. Please add one!</p>";
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];

  // Update DOM dynamically
  quoteDisplay.innerHTML = `
    <p>"${randomQuote.text}"</p>
    <strong>Category:</strong> ${randomQuote.category}
  `;
}

// Function to add a new quote dynamically
function addQuote() {
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim();

  if (text === "" || category === "") {
    alert("Please enter both quote text and category!");
    return;
  }

  // Add the new quote to the quotes array
  quotes.push({ text, category });

  // Clear input fields
  newQuoteText.value = "";
  newQuoteCategory.value = "";

  // Immediately update the DOM to show the new quote
  quoteDisplay.innerHTML = `
    <p>"${text}"</p>
    <strong>Category:</strong> ${category}
  `;

  console.log("Quote added:", quotes); // optional debug log
}

// Event listener for "Show New Quote" button
newQuoteButton.addEventListener("click", showRandomQuote);

// Optional: Display a random quote when the page loads
document.addEventListener("DOMContentLoaded", showRandomQuote);
