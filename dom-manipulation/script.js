// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {

  // --- 1. Initial Data ---
  // We declare `quotes` here, but it will be populated by loadQuotes()
  let quotes = [];

  // Default quotes to be used if localStorage is empty
  const defaultQuotes = [
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
   * Saves the current `quotes` array to localStorage.
   */
  function saveQuotes() {
    // localStorage can only store strings, so we must stringify our array
    localStorage.setItem('quotes', JSON.stringify(quotes));
  }

  /**
   * Loads quotes from localStorage. If empty, uses default quotes.
   */
  function loadQuotes() {
    const quotesFromStorage = localStorage.getItem('quotes');
    if (quotesFromStorage) {
      // If we found quotes, parse the JSON string back into an array
      quotes = JSON.parse(quotesFromStorage);
    } else {
      // If no quotes are in storage, use the defaults and save them
      quotes = defaultQuotes;
      saveQuotes();
    }
  }

  /**
   * Selects a random quote and displays it.
   * Also saves the displayed quote to sessionStorage.
   */
  function showRandomQuote() {
    if (quotes.length === 0) {
      quoteDisplay.innerHTML = '<p>No quotes found. Add some or import a file!</p>';
      return;
    }
    
    // Get a random index from the quotes array
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];

    // --- Session Storage Demo ---
    // Save the last viewed quote to session storage
    sessionStorage.setItem('lastViewedQuote', JSON.stringify(randomQuote));

    // Clear the previous quote
    quoteDisplay.innerHTML = '';

    // Create and display new elements
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
      
      // Save the updated array to localStorage
      saveQuotes();

      newQuoteTextInput.value = '';
      newQuoteCategoryInput.value = '';

      console.log("New quote added and saved!");
      
      // Show the newly added quote
      quoteDisplay.innerHTML = '';
      const quoteText = document.createElement('p');
      quoteText.textContent = `"${newQuote.text}"`;
      const quoteCategory = document.createElement('em');
      quoteCategory.textContent = `- ${newQuote.category}`;
      quoteDisplay.appendChild(quoteText);
      quoteDisplay.appendChild(quoteCategory);
      
      // Also update session storage with the new quote
      sessionStorage.setItem('lastViewedQuote', JSON.stringify(newQuote));

    } else {
      // Use a non-blocking notification instead of alert
      console.warn("Please enter both a quote and a category.");
      // You could replace this with a temporary message on the screen
    }
  }

  /**
   * Creates and appends the "Add New Quote" form to the body.
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

    newQuoteButton.insertAdjacentElement('afterend', formContainer);
  }

  /**
   * Creates the UI for importing and exporting quotes.
   */
  function createImportExportUI() {
    const container = document.createElement('div');
    container.className = 'import-export-container';
    
    // --- Export Button ---
    const exportButton = document.createElement('button');
    exportButton.textContent = 'Export Quotes (JSON)';
    exportButton.id = 'exportBtn';
    exportButton.addEventListener('click', exportQuotes);
    
    // --- Import Label & Input ---
    const importLabel = document.createElement('label');
    importLabel.textContent = 'Import Quotes (JSON): ';
    importLabel.htmlFor = 'importFile';
    
    const importInput = document.createElement('input');
    importInput.type = 'file';
    importInput.id = 'importFile';
    importInput.accept = '.json'; // Only accept .json files
    importInput.addEventListener('change', importFromJsonFile);
    
    container.appendChild(exportButton);
    container.appendChild(document.createElement('br')); // Simple layout
    container.appendChild(importLabel);
    container.appendChild(importInput);
    
    // Append after the "Add Quote" form
    const formContainer = document.querySelector('.add-quote-form');
    if (formContainer) {
      formContainer.insertAdjacentElement('afterend', container);
    } else {
      document.body.appendChild(container); // Fallback
    }
  }

  /**
   * Exports the current quotes array as a JSON file.
   */
  function exportQuotes() {
    if (quotes.length === 0) {
      console.warn("No quotes to export.");
      return;
    }
    
    // Create JSON string
    const jsonString = JSON.stringify(quotes, null, 2); // null, 2 for pretty formatting
    
    // Create a Blob
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // Create a temporary URL
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link to trigger the download
    const link = document.createElement('a');
    link.href = url;
    link.download = 'quotes.json';
    
    // Simulate a click to download
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Imports quotes from a user-selected JSON file.
   */
  function importFromJsonFile(event) {
    const file = event.target.files[0];
    if (!file) {
      return; // No file selected
    }

    const fileReader = new FileReader();
    
    // This function runs when the file is successfully read
    fileReader.onload = function(e) {
      try {
        // Parse the file content as JSON
        const importedQuotes = JSON.parse(e.target.result);
        
        // Basic validation: Check if it's an array
        if (Array.isArray(importedQuotes)) {
          // Append the imported quotes to the existing array
          quotes.push(...importedQuotes);
          
          // Save the newly merged array to localStorage
          saveQuotes();
          
          // Notify user
          console.log('Quotes imported successfully!');
          
          // Clear the file input for the next import
          event.target.value = null;
          
          // Refresh the display
          showRandomQuote();
          
        } else {
          console.warn('Invalid JSON file: Format must be an array of quotes.');
        }
      } catch (error) {
        console.error('Error reading or parsing file:', error);
      }
    };
    
    // Read the file as text
    fileReader.readAsText(file);
  }

  // --- 4. Event Listeners ---
  newQuoteButton.addEventListener('click', showRandomQuote);

  // --- 5. Initial Setup Calls ---
  
  // 1. Load all quotes from localStorage (or defaults)
  loadQuotes();
  
  // 2. Create the UI elements
  createAddQuoteForm();
  createImportExportUI();

  // 3. Initial Quote Display Logic
  const lastViewedQuoteJSON = sessionStorage.getItem('lastViewedQuote');
  
  // Check if there's a quote in session storage
  if (lastViewedQuoteJSON) {
    try {
      const lastQuote = JSON.parse(lastViewedQuoteJSON);
      
      // Verify this quote still exists in our main list
      const quoteExists = quotes.some(q => q.text === lastQuote.text && q.category === lastQuote.category);
      
      if (quoteExists) {
        // Display the last viewed quote
        quoteDisplay.innerHTML = '';
        const quoteText = document.createElement('p');
        quoteText.textContent = `"${lastQuote.text}"`;
        const quoteCategory = document.createElement('em');
        quoteCategory.textContent = `- ${lastQuote.category} (from last session)`;
        quoteDisplay.appendChild(quoteText);
        quoteDisplay.appendChild(quoteCategory);
      } else {
        // If it no longer exists (e.g., list was cleared), show a random one
        showRandomQuote();
      }
    } catch (e) {
      showRandomQuote(); // If session data is corrupt, show random
    }
  } else {
    // If no session data, show a random quote
    showRandomQuote();
  }
});

