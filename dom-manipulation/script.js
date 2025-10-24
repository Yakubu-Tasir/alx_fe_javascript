// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {

  // --- 1. Initial Data ---
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

  // Dynamic selector for the category filter (will be set in createFilterUI)
  let categoryFilter; 

  // --- 3. Persistence Functions (Web Storage) ---

  /**
   * Saves the current `quotes` array to localStorage.
   */
  function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
  }

  /**
   * Loads quotes from localStorage. If empty, uses default quotes.
   */
  function loadQuotes() {
    const quotesFromStorage = localStorage.getItem('quotes');
    if (quotesFromStorage) {
      quotes = JSON.parse(quotesFromStorage);
    } else {
      quotes = defaultQuotes;
      saveQuotes();
    }
  }

  // --- 4. Display Helper Functions (Refactored) ---
  
  /**
   * Clears the display and renders a single quote object.
   */
  function displayQuote(quote, suffix = '') {
      quoteDisplay.innerHTML = '';
      
      const quoteText = document.createElement('p');
      quoteText.textContent = `"${quote.text}"`;
      
      const quoteCategory = document.createElement('em');
      quoteCategory.textContent = `- ${quote.category} ${suffix}`;
      
      quoteDisplay.appendChild(quoteText);
      quoteDisplay.appendChild(quoteCategory);
  }

  /**
   * Clears the display and renders all quotes in an array as a list.
   */
  function displayFilteredQuotes(quotesToDisplay, filter) {
      quoteDisplay.innerHTML = '';
      
      if (quotesToDisplay.length === 0) {
          quoteDisplay.innerHTML = `<p style="text-align:center; color: #e67e22;">No quotes found for the category: ${filter}.</p>`;
          return;
      }

      // Add a simple header for the filtered view
      const header = document.createElement('h3');
      header.textContent = filter === 'all' ? 'All Quotes' : `Quotes in Category: ${filter}`;
      quoteDisplay.appendChild(header);

      const ul = document.createElement('ul');
      ul.style.listStyleType = 'none'; // Basic styling for clean list
      ul.style.padding = '0';
      ul.style.margin = '0';
      
      quotesToDisplay.forEach(q => {
          const li = document.createElement('li');
          li.style.borderBottom = '1px dashed #eee';
          li.style.padding = '0.5rem 0';
          li.innerHTML = `<strong>"${q.text}"</strong> <br> <em style="color:#777; font-size:0.9em;">(${q.category})</em>`;
          ul.appendChild(li);
      });
      
      quoteDisplay.appendChild(ul);
  }

  // --- 5. Core Application Functions ---

  /**
   * Selects a random quote and displays it (Task 1).
   */
  function showRandomQuote() {
    if (quotes.length === 0) {
      quoteDisplay.innerHTML = '<p>No quotes found. Add some or import a file!</p>';
      return;
    }
    
    // Clear filter state when user explicitly asks for a random quote
    if (categoryFilter) {
      categoryFilter.value = 'all';
      localStorage.removeItem('lastFilter');
    }

    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];

    sessionStorage.setItem('lastViewedQuote', JSON.stringify(randomQuote));
    displayQuote(randomQuote);
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
      
      saveQuotes(); 
      populateCategories(); // NEW: Update categories when a new one is introduced
      
      newQuoteTextInput.value = '';
      newQuoteCategoryInput.value = '';

      console.log("New quote added and saved!");
      
      // Update display to show the new quote
      displayQuote(newQuote);
      sessionStorage.setItem('lastViewedQuote', JSON.stringify(newQuote));

    } else {
      console.warn("Please enter both a quote and a category.");
    }
  }

  /**
   * Extracts unique categories and populates the filter dropdown.
   * Required function name: populateCategories
   */
  function populateCategories() {
      if (!categoryFilter) return;

      // Extract unique categories, convert to a Set to ensure uniqueness, map to array, and sort
      const uniqueCategories = [...new Set(quotes.map(q => q.category.trim()))].sort();
      
      // Store the current selected filter (to restore after re-populating)
      const currentFilter = categoryFilter.value || 'all';

      categoryFilter.innerHTML = '';

      // Add the default 'All Categories' option
      const allOption = document.createElement('option');
      allOption.value = 'all';
      allOption.textContent = 'All Categories';
      categoryFilter.appendChild(allOption);

      // Populate unique category options
      uniqueCategories.forEach(category => {
          if (category) { // Skip empty categories
              const option = document.createElement('option');
              option.value = category;
              option.textContent = category;
              categoryFilter.appendChild(option);
          }
      });
      
      // Restore the previously selected filter if it still exists
      categoryFilter.value = uniqueCategories.includes(currentFilter) || currentFilter === 'all' ? currentFilter : 'all';
  }

  /**
   * Filters quotes based on the selected category and updates the display.
   * Required function name: filterQuotes
   */
  function filterQuotes() {
      if (!categoryFilter) return;

      const selectedCategory = categoryFilter.value;
      
      // 1. Save filter preference to localStorage
      localStorage.setItem('lastFilter', selectedCategory);

      let filteredQuotes;

      if (selectedCategory === 'all') {
          // Show all quotes
          filteredQuotes = quotes;
      } else {
          // Filter quotes by category
          filteredQuotes = quotes.filter(q => q.category.trim() === selectedCategory);
      }
      
      // 2. Display the list of filtered quotes
      displayFilteredQuotes(filteredQuotes, selectedCategory);
  }
  
  /**
   * Creates and appends the "Add New Quote" form to the body (Task 1).
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

    const controls = document.getElementById('controls');
    controls.insertAdjacentElement('afterend', formContainer);
  }

  /**
   * Creates and appends the "Category Filter" dropdown (Task 3).
   */
  function createFilterUI() {
      const filterContainer = document.createElement('div');
      filterContainer.className = 'filter-container';
      filterContainer.style.margin = '1rem 0';
      filterContainer.style.textAlign = 'center';

      const label = document.createElement('label');
      label.textContent = 'Filter by Category: ';
      label.htmlFor = 'categoryFilter';
      label.style.fontWeight = 'bold';
      
      const select = document.createElement('select');
      select.id = 'categoryFilter'; 
      select.style.padding = '0.5rem';
      select.style.borderRadius = '4px';
      select.style.border = '1px solid #ccc';
      select.addEventListener('change', filterQuotes); 
      
      filterContainer.appendChild(label);
      filterContainer.appendChild(select);
      
      // Append right before the newQuoteButton for better flow
      newQuoteButton.insertAdjacentElement('beforebegin', filterContainer);
      
      categoryFilter = select;
  }
  
  /**
   * Exports the current quotes array as a JSON file (Task 2).
   */
  function exportToJsonFile() {
    if (quotes.length === 0) {
      console.warn("No quotes to export.");
      return;
    }
    
    const jsonString = JSON.stringify(quotes, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'quotes.json';
    
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Imports quotes from a user-selected JSON file (Task 2).
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
          quotes.push(...importedQuotes);
          saveQuotes(); 
          populateCategories(); // NEW: Update categories after import
          
          console.log('Quotes imported successfully!');
          
          event.target.value = null; 
          
          filterQuotes(); // Apply current filter or show all
          
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
  
  // Attach handlers
  newQuoteButton.addEventListener('click', showRandomQuote);
  exportButton.addEventListener('click', exportToJsonFile);
  importFileInput.addEventListener('change', importFromJsonFile);

  // Initial Setup
  loadQuotes();
  createFilterUI(); // NEW: Create the filter dropdown
  populateCategories(); // NEW: Fill the filter dropdown
  createAddQuoteForm();

  // Logic to restore last filter OR show last viewed quote
  const lastFilter = localStorage.getItem('lastFilter');

  if (lastFilter && categoryFilter) {
      // 1. Restore last filter preference
      categoryFilter.value = lastFilter;
      filterQuotes(); // Apply the saved filter (shows list view)
      
      // If we are applying a filter, clear session storage since we are showing a list
      sessionStorage.removeItem('lastViewedQuote');
      
  } else {
      // 2. If no filter is saved, use Session Storage logic (shows single view)
      const lastViewedQuoteJSON = sessionStorage.getItem('lastViewedQuote');
      
      if (lastViewedQuoteJSON) {
          try {
              const lastQuote = JSON.parse(lastViewedQuoteJSON);
              const quoteExists = quotes.some(q => q.text === lastQuote.text && q.category === lastQuote.category);
              
              if (quoteExists) {
                  displayQuote(lastQuote, '(from last session)');
              } else {
                  showRandomQuote();
              }
          } catch (e) {
              showRandomQuote();
          }
      } else {
          showRandomQuote();
      }
  }
});
