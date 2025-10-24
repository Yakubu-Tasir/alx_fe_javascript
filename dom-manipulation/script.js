// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {

  // --- 1. Initial Data ---
  let quotes = [
    { text: "The only way to do great work is to love what you do.", category: "Work" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "In the end, it's not the years in your life that count. It's the life in your years.", category: "Life" },
    { text: "The purpose of our lives is to be happy.", category: "Philosophy" }
  ];

  // --- 2. Element Selectors ---
  const quoteDisplay = document.getElementById('quoteDisplay');
  const newQuoteButton = document.getElementById('newQuote');

  // --- 3. Functions ---

  /**
   * Selects a random quote from the quotes array and displays it in the quoteDisplay element.
   */
  function showRandomQuote() {
    // Get a random index from the quotes array
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];

    // Clear the previous quote
    quoteDisplay.innerHTML = '';

    // Create new elements for the quote
    const quoteText = document.createElement('p');
    quoteText.textContent = `"${randomQuote.text}"`;

    const quoteCategory = document.createElement('em');
    quoteCategory.textContent = `- ${randomQuote.category}`;

    // Append the new elements to the display area
    quoteDisplay.appendChild(quoteText);
    quoteDisplay.appendChild(quoteCategory);
  }

  /**
   * Reads the values from the new quote form, adds the new quote to the array, and clears the inputs.
   */
  function addQuote() {
    // Select the input elements by their dynamically assigned IDs
    const newQuoteTextInput = document.getElementById('newQuoteText');
    const newQuoteCategoryInput = document.getElementById('newQuoteCategory');

    // Get the values and trim whitespace
    const text = newQuoteTextInput.value.trim();
    const category = newQuoteCategoryInput.value.trim();

    // Basic validation
    if (text && category) {
      // Create a new quote object
      const newQuote = { text, category };

      // Add the new quote to the array
      quotes.push(newQuote);

      // Clear the input fields
      newQuoteTextInput.value = '';
      newQuoteCategoryInput.value = '';

      // Optional: Log a success message or show an alert
      console.log("New quote added successfully!");
      
      // Optional: Show the newly added quote (or another random one)
      // showRandomQuote();
    } else {
      // Handle empty input
      alert("Please enter both a quote and a category.");
    }
  }

  /**
   * Creates and appends the "Add New Quote" form to the body.
   */
  function createAddQuoteForm() {
    // Create the container div
    const formContainer = document.createElement('div');
    formContainer.className = 'add-quote-form'; // For styling

    // Create the heading
    const heading = document.createElement('h2');
    heading.textContent = 'Add a New Quote';
    formContainer.appendChild(heading);

    // Create the quote text input
    const quoteInput = document.createElement('input');
    quoteInput.type = 'text';
    quoteInput.id = 'newQuoteText'; // Assign ID for selection
    quoteInput.placeholder = 'Enter a new quote';
    formContainer.appendChild(quoteInput);

    // Create the quote category input
    const categoryInput = document.createElement('input');
    categoryInput.type = 'text';
    categoryInput.id = 'newQuoteCategory'; // Assign ID for selection
    categoryInput.placeholder = 'Enter quote category';
    formContainer.appendChild(categoryInput);

    // Create the "Add Quote" button
    const addButton = document.createElement('button');
    addButton.id = 'addQuoteBtn';
    addButton.textContent = 'Add Quote';
    
    // Add event listener directly to the button
    addButton.addEventListener('click', addQuote);
    
    formContainer.appendChild(addButton);

    // Append the entire form to the body, after the "Show New Quote" button
    newQuoteButton.insertAdjacentElement('afterend', formContainer);
  }

  // --- 4. Event Listeners ---
  newQuoteButton.addEventListener('click', showRandomQuote);

  // --- 5. Initial Setup Calls ---
  
  // Display a random quote when the page first loads
  showRandomQuote();
  
  // Create and display the "Add Quote" form when the page loads
  createAddQuoteForm();
});
