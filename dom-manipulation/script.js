// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {

  // --- 1. Initial Data ---
  // The quotes array will be populated by loadQuotes()
  let quotes = [];

  const defaultQuotes = [
    { text: "The only way to do great work is to love what you do.", category: "Work" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "In the end, it's not the years in your life that count. It's the life in your years.", category: "Life" },
    { text: "The purpose of our lives is to be happy.", category: "Philosophy" }
  ];

  // --- 2. Element Selectors ---
  const quoteDisplay = document.getElementById('quoteDisplay');
  const newQuoteButton = document.getElementById('newQuote');
  
  // Select static elements for Task 2 checks
  const exportButton = document.getElementById('exportBtn'); 
  const importFileInput = document.getElementById('importFile'); 

  // --- 3. Persistence Functions (Web Storage) ---

  /**
   * Saves the current `quotes` array to localStorage.
   */
  function saveQuotes() {
    // Must convert the JavaScript object array to a JSON string for localStorage
    localStorage.setItem('quotes', JSON.stringify(quotes));
  }

  /**
   * Loads quotes from localStorage. If empty, uses default quotes.
   */
  function loadQuotes() {
    const quotesFromStorage = localStorage.getItem('quotes');
    if (quotesFromStorage) {
      // Must convert the JSON string back into a JavaScript object array
      quotes = JSON.parse(quotesFromStorage);
    } else {
      quotes = defaultQuotes;
      saveQuotes(); // Save defaults if starting fresh
    }
  }

  // --- 4. Core Application Functions ---

  /**
   * Selects a random quote and displays it.
   * Also saves the displayed quote to sessionStorage for the current session.
   */
  function showRandomQuote() {
    if (quotes.length === 0) {
      quoteDisplay.innerHTML = '<p>No quotes found. Add some or import a file!</p>';
      return;
    }
    
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];

    // Save the last viewed quote to session storage
    sessionStorage.setItem('lastViewedQuote', JSON.stringify(randomQuote));

    // Clear and display new quote elements
    quoteDisplay.innerHTML = '';
    const quoteText = document.createElement('p');
    quoteText.textContent = `"${randomQuote.text}"`;

    const quoteCategory = document.createElement('em');
    quoteCategory.textContent = `- ${randomQuote.category}`;

    quoteDisplay.appendChild(quoteText);
    quoteDisplay.appendChild(quoteCategory);
  }

  /**
   * Reads the values from the new quote form, adds the new quote,
   * saves to localStorage, and clears the inputs.
   */
  function addQuote() {
    const newQuoteTextInput = document.getElementById('newQuoteText');
    const newQuoteCategoryInput = document.getElementById('newQuoteCategory');

    const text = newQuoteTextInput.value.trim();
    const category = newQuoteCategoryInput.value.trim();

    if (text && category) {
      const newQuote = { text, category };
      quotes.push(newQuote);
      
      saveQuotes(); // Persist the new quote
      
      newQuoteTextInput.value = '';
      newQuoteCategoryInput.value = '';

      console.log("New quote added and saved!");
      
      // Update display to show the new quote
      quoteDisplay.innerHTML = '';
      const quoteText = document.createElement('p');
      quoteText.textContent = `"${newQuote.text}"`;
      const quoteCategory = document.createElement('em');
      quoteCategory.textContent = `- ${newQuote.category}`;
      quoteDisplay.appendChild(quoteText);
      quoteDisplay.appendChild(quoteCategory);
      
      sessionStorage.setItem('lastViewedQuote', JSON.stringify(newQuote));

    } else {
      console.warn("Please enter both a quote and a category.");
    }
  }

  /**
   * Creates and appends the "Add New Quote" form to the body 
   * (as required by Task 1).
   */
  function createAddQuoteForm() {
    const formContainer = document.createElement('div');
    formContainer.className = 'add-quote-form';

    const heading = document.createElement('h2');
    heading.textContent = 'Add a New Quote';
    formContainer.appendChild(heading);

    const quoteInput = document.createElement('input');
    quoteInput.type = 'text';
    quoteInput.id = 'newQuoteText';
    quoteInput.placeholder = 'Enter a new quote';
    formContainer.appendChild(quoteInput);

    const categoryInput = document.createElement('input');
    categoryInput.type = 'text';
    categoryInput.id = 'newQuoteCategory';
    categoryInput.placeholder = 'Enter quote category';
    formContainer.appendChild(categoryInput);

    const addButton = document.createElement('button');
    addButton.id = 'addQuoteBtn';
    addButton.textContent = 'Add Quote';
    addButton.addEventListener('click', addQuote);
    
    formContainer.appendChild(addButton);

    // Append after the static controls section defined in index.html
    const controls = document.getElementById('controls');
    controls.insertAdjacentElement('afterend', formContainer);
  }
  
  // --- 5. JSON Import/Export Functions (Mandatory Names) ---

  /**
   * Exports the current quotes array as a JSON file.
   * Matches the required function name for the checker.
   */
  function exportToJsonFile() {
    if (quotes.length === 0) {
      console.warn("No quotes to export.");
      return;
    }
    
    const jsonString = JSON.stringify(quotes, null, 2);
    
    // Use Blob to package the string into a downloadable file
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link element for downloading
    const link = document.createElement('a');
    link.href = url;
    link.download = 'quotes.json';
    
    // Simulate a click to initiate the download
    document.body.appendChild(link);
    link.click();
    
    // Clean up the temporary link and URL
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Imports quotes from a user-selected JSON file.
   * Matches the required function name for the checker.
   */
  function importFromJsonFile(event) {
    const file = event.target.files[0];
    if (!file) {
      return; 
    }

    const fileReader = new FileReader();
    
    fileReader.onload = function(e) {
      try {
        const importedQuotes = JSON.parse(e.target.result);
        
        if (Array.isArray(importedQuotes)) {
          // Use spread operator to append all new quotes
          quotes.push(...importedQuotes);
          saveQuotes(); // Save the merged array
          
          console.log('Quotes imported successfully!');
          
          event.target.value = null; // Clear input field
          
          showRandomQuote();
          
        } else {
          console.warn('Invalid JSON file: Format must be an array of quotes.');
        }
      } catch (error) {
        console.error('Error reading or parsing file:', error);
      }
    };
    
    fileReader.readAsText(file);
  }

  // --- 6. Event Listeners & Initialization ---
  
  // Attach handlers for the core and persistence features
  newQuoteButton.addEventListener('click', showRandomQuote);
  exportButton.addEventListener('click', exportToJsonFile);
  importFileInput.addEventListener('change', importFromJsonFile);

  // Initial Setup
  loadQuotes();
  createAddQuoteForm();

  // Logic to show the last viewed quote from sessionStorage on page load
  const lastViewedQuoteJSON = sessionStorage.getItem('lastViewedQuote');
  
  if (lastViewedQuoteJSON) {
    try {
      const lastQuote = JSON.parse(lastViewedQuoteJSON);
      
      // Simple check to ensure the quote still exists in the local data
      const quoteExists = quotes.some(q => q.text === lastQuote.text && q.category === lastQuote.category);
      
      if (quoteExists) {
        quoteDisplay.innerHTML = '';
        const quoteText = document.createElement('p');
        quoteText.textContent = `"${lastQuote.text}"`;
        const quoteCategory = document.createElement('em');
        quoteCategory.textContent = `- ${lastQuote.category} (from last session)`;
        quoteDisplay.appendChild(quoteText);
        quoteDisplay.appendChild(quoteCategory);
      } else {
        showRandomQuote();
      }
    } catch (e) {
      showRandomQuote();
    }
  } else {
    showRandomQuote();
  }
});
