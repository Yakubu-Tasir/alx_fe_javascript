// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', initializeApp);

// --- Global Constants ---
// Mock API endpoint for simulating server data retrieval (Task 4)
const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts?_limit=10'; 
const SYNC_INTERVAL = 60000; // Sync every 60 seconds (Task 4)

// --- Global Data & Selectors ---
let quotes = [];
let syncStatus; // Element to show sync status (Task 4)

const defaultQuotes = [
  // Added IDs and synced status for T4
  { id: 'd1', text: "The only way to do great work is to love what you do.", category: "Work", synced: true },
  { id: 'd2', text: "Life is what happens when you're busy making other plans.", category: "Life", synced: true },
  { id: 'd3', text: "In the end, it's not the years in your life that count. It's the life in your years.", category: "Life", synced: true },
  { id: 'd4', text: "The purpose of our lives is to be happy.", category: "Philosophy", synced: true }
];

const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteButton = document.getElementById('newQuote');
const exportButton = document.getElementById('exportBtn'); 
const importFileInput = document.getElementById('importFile'); 
let categoryFilter; 

// --- 1. Utility & Persistence Functions (T2) ---

/**
 * Generates a simple, unique ID (simulating UUID for client-side)
 */
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Saves the current `quotes` array to localStorage.
 */
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

/**
 * Loads quotes from localStorage. If empty, uses default quotes and ensures they have IDs.
 */
function loadQuotes() {
  const quotesFromStorage = localStorage.getItem('quotes');
  if (quotesFromStorage) {
    quotes = JSON.parse(quotesFromStorage);
    
    // Ensure all loaded quotes have an ID and a synced status for conflict resolution
    quotes = quotes.map(q => ({
        ...q,
        id: q.id || generateUniqueId(),
        synced: q.synced !== undefined ? q.synced : true // Assume existing are synced
    }));
  } else {
    quotes = defaultQuotes;
    saveQuotes();
  }
}

// --- 2. Server Sync and Conflict Resolution (Task 4) ---

/**
 * Simulates fetching quotes from a remote server (JSONPlaceholder).
 */
async function fetchServerQuotes() {
    try {
        syncStatus.textContent = 'Syncing...';
        syncStatus.style.color = '#3498db';

        const response = await fetch(SERVER_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const serverPosts = await response.json();
        
        // Map the mock server data (posts) to our quote structure
        const serverQuotes = serverPosts.map(post => ({
            id: 'server-' + post.id, // Use a prefix to prevent ID collision with local defaults
            text: post.title, // Use title as the quote text
            category: 'Server-' + post.userId, // Use userId as a simple category
            synced: true // Data coming from server is always synced
        }));

        return serverQuotes;
    } catch (error) {
        console.error('Error fetching server data:', error);
        syncStatus.textContent = 'Sync Failed!';
        syncStatus.style.color = '#e74c3c';
        return [];
    }
}

/**
 * Main synchronization function. Fetches server data and merges it with local data.
 * Server data takes precedence (Conflict Resolution).
 */
async function syncQuotes() {
    console.log('Starting data sync...');
    const serverQuotes = await fetchServerQuotes();
    
    // Create a map of existing local quotes for quick lookup and merge
    const localQuotesMap = new Map(quotes.map(q => [q.id, q]));
    let mergedQuotes = [];

    // 1. Merge Server data (Server Precedence: OVERWRITE local data if ID matches)
    serverQuotes.forEach(sQuote => {
        const existingLocalQuote = localQuotesMap.get(sQuote.id);
        
        if (existingLocalQuote) {
            // Server data takes precedence. Overwrite and remove from map.
            mergedQuotes.push(sQuote); 
            localQuotesMap.delete(sQuote.id); 
        } else {
            // New quote from server
            mergedQuotes.push(sQuote);
        }
    });

    // 2. Add remaining local quotes
    let localChangesDetected = false;
    for (const [id, lQuote] of localQuotesMap) {
        if (!lQuote.synced) {
            // Simulate successful server post by marking as synced
            lQuote.synced = true; 
            localChangesDetected = true;
        }
        mergedQuotes.push(lQuote);
    }
    
    quotes = mergedQuotes;
    saveQuotes();
    populateCategories(); // Update the filter dropdown
    
    // Update display based on current filter or show a notification
    const currentFilter = localStorage.getItem('lastFilter');
    if (currentFilter && categoryFilter && categoryFilter.value !== 'all') {
        // If a filter was active, re-apply it to show updated list
        categoryFilter.value = currentFilter;
        filterQuotes(); 
    } else {
        // Show success message or random quote
        if (localChangesDetected || serverQuotes.length > 0) {
            const statusMsg = localChangesDetected ? 'Data Synced. Local additions processed.' : `Sync Successful. ${serverQuotes.length} server quotes merged.`;
            quoteDisplay.innerHTML = `<p style="text-align:center; color: #42b983;">${statusMsg}</p>`;
        } else {
            showRandomQuote();
        }
    }
    
    setTimeout(() => {
        syncStatus.textContent = 'Last Sync: ' + new Date().toLocaleTimeString();
        syncStatus.style.color = '#333';
    }, 2000);

    console.log('Sync complete. Total quotes:', quotes.length);
}

// --- 3. Display Helper Functions (T1, T3) ---
  
/**
 * Clears the display and renders a single quote object.
 */
function displayQuote(quote, suffix = '') {
    quoteDisplay.innerHTML = '';
    
    const quoteText = document.createElement('p');
    quoteText.textContent = `"${quote.text}"`;
    
    const quoteCategory = document.createElement('em');
    // Display if the quote is unsynced
    const syncStatusText = quote.synced ? '' : ' (Unsynced)';
    quoteCategory.textContent = `- ${quote.category} ${suffix}${syncStatusText}`;
    
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

    const header = document.createElement('h3');
    header.textContent = filter === 'all' ? 'All Quotes' : `Quotes in Category: ${filter}`;
    quoteDisplay.appendChild(header);

    const ul = document.createElement('ul');
    ul.style.listStyleType = 'none'; 
    ul.style.padding = '0';
    ul.style.margin = '0';
    
    quotesToDisplay.forEach(q => {
        // Highlight unsynced quotes (Task 4 UI)
        const syncBadge = q.synced ? '' : '<span style="color:red; font-size: 0.8em;"> (Unsynced)</span>';
        
        const li = document.createElement('li');
        li.style.borderBottom = '1px dashed #eee';
        li.style.padding = '0.5rem 0';
        li.innerHTML = `<strong>"${q.text}"</strong>${syncBadge} <br> <em style="color:#777; font-size:0.9em;">(${q.category})</em>`;
        ul.appendChild(li);
    });
    
    quoteDisplay.appendChild(ul);
}

// --- 4. Core Application Functions (T1, T3) ---

/**
 * Selects a random quote and displays it.
 */
function showRandomQuote() {
  if (quotes.length === 0) {
    quoteDisplay.innerHTML = '<p>No quotes found. Add some or import a file!</p>';
    return;
  }
  
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
 * saves to localStorage, and clears the inputs. (Updated for T4)
 */
function addQuote() {
  const newQuoteTextInput = document.getElementById('newQuoteText');
  const newQuoteCategoryInput = document.getElementById('newQuoteCategory');

  const text = newQuoteTextInput.value.trim();
  const category = newQuoteCategoryInput.value.trim();

  if (text && category) {
    // New quote is created locally, marked as unsynced (T4 change)
    const newQuote = { 
        id: generateUniqueId(),
        text, 
        category, 
        synced: false 
    };
    quotes.push(newQuote);
    
    saveQuotes(); 
    populateCategories(); 
    
    newQuoteTextInput.value = '';
    newQuoteCategoryInput.value = '';

    console.log("New quote added locally (unsynced).");
    
    // Update display to show the new quote
    displayQuote(newQuote, '(Unsynced)');
    sessionStorage.setItem('lastViewedQuote', JSON.stringify(newQuote));

  } else {
    console.warn("Please enter both a quote and a category.");
  }
}

/**
 * Extracts unique categories and populates the filter dropdown. (T3)
 * Required function name: populateCategories
 */
function populateCategories() {
    if (!categoryFilter) return;

    const uniqueCategories = [...new Set(quotes.map(q => q.category.trim()))].sort();
    const currentFilter = categoryFilter.value || 'all';

    categoryFilter.innerHTML = '';

    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = 'All Categories';
    categoryFilter.appendChild(allOption);

    uniqueCategories.forEach(category => {
        if (category) {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        }
    });
    
    categoryFilter.value = uniqueCategories.includes(currentFilter) || currentFilter === 'all' ? currentFilter : 'all';
}

/**
 * Filters quotes based on the selected category and updates the display. (T3)
 * Required function name: filterQuotes
 */
function filterQuotes() {
    if (!categoryFilter) return;

    const selectedCategory = categoryFilter.value;
    
    // 1. Save filter preference to localStorage
    localStorage.setItem('lastFilter', selectedCategory);

    let filteredQuotes;

    if (selectedCategory === 'all') {
        filteredQuotes = quotes;
    } else {
        filteredQuotes = quotes.filter(q => q.category.trim() === selectedCategory);
    }
    
    // 2. Display the list of filtered quotes
    displayFilteredQuotes(filteredQuotes, selectedCategory);
}

// --- 5. UI Creation Functions (T1, T3, T4) ---

/**
 * Creates and appends the "Add New Quote" form to the body. (T1)
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
 * Creates and appends the "Category Filter" dropdown. (T3)
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
    
    newQuoteButton.insertAdjacentElement('beforebegin', filterContainer);
    
    categoryFilter = select;
}

/**
 * Creates and appends the Sync Status notification element (Task 4).
 */
function createSyncStatusUI() {
    syncStatus = document.createElement('p');
    syncStatus.id = 'syncStatus';
    syncStatus.style.textAlign = 'center';
    syncStatus.style.fontSize = '0.9em';
    syncStatus.style.padding = '0.5rem';
    syncStatus.style.backgroundColor = '#ecf0f1';
    syncStatus.style.borderRadius = '4px';
    syncStatus.textContent = 'Initializing...';
    
    const controls = document.getElementById('controls');
    controls.insertAdjacentElement('afterend', syncStatus); // Place above add quote form
}

/**
 * Exports the current quotes array as a JSON file. (T2)
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
 * Imports quotes from a user-selected JSON file. (T2)
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
        // Ensure imported quotes have proper internal structure (ID, synced: false)
        const newQuotes = importedQuotes.map(q => ({
            ...q, 
            id: q.id || generateUniqueId(), 
            synced: false // Mark imported quotes as needing a server sync
        }));
        
        quotes.push(...newQuotes);
        saveQuotes(); 
        populateCategories(); 
        
        console.log('Quotes imported successfully! Needs sync.');
        
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

// --- 6. Initialization Function ---

function initializeApp() {
    // Attach handlers for Task 2 features
    newQuoteButton.addEventListener('click', showRandomQuote);
    exportButton.addEventListener('click', exportToJsonFile);
    importFileInput.addEventListener('change', importFromJsonFile);

    // Initial Setup (T1, T3)
    loadQuotes();
    createSyncStatusUI(); // T4 UI element
    createFilterUI();
    populateCategories(); 
    createAddQuoteForm();

    // T3: Logic to restore last filter OR show last viewed quote
    const lastFilter = localStorage.getItem('lastFilter');

    if (lastFilter && categoryFilter) {
        categoryFilter.value = lastFilter;
        filterQuotes();
        sessionStorage.removeItem('lastViewedQuote');
    } else {
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

    // T4: Initial sync and periodic sync setup
    syncQuotes(); // Run initial sync on load
    setInterval(syncQuotes, SYNC_INTERVAL); // Schedule periodic sync
}
