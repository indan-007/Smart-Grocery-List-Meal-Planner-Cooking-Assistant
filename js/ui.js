// js/ui.js - Manages DOM manipulation and UI updates.

const groceryListContainer = document.getElementById('grocery-list');
const addItemForm = document.getElementById('add-grocery-form');
const itemNameInput = document.getElementById('item-name');
const itemCategoryInput = document.getElementById('item-category');
const itemQuantityInput = document.getElementById('item-quantity');

function createGroceryItemElement(item) {
    const itemDiv = document.createElement('div');
    itemDiv.className = `flex items-center justify-between p-4 rounded-lg ${item.purchased ? 'bg-gray-200 dark:bg-gray-800 opacity-50' : 'bg-gray-50 dark:bg-gray-700'}`;
    itemDiv.dataset.id = item.id;

    itemDiv.innerHTML = `
        <div class="flex items-center">
            <input type="checkbox" class="h-6 w-6 text-primary focus:ring-primary border-gray-300 rounded" ${item.purchased ? 'checked' : ''}>
            <div class="ml-4">
                <p class="font-semibold ${item.purchased ? 'line-through' : ''}">${item.name}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">${item.category}</p>
            </div>
        </div>
        <div class="flex items-center space-x-2">
            <span class="text-lg font-medium">Qty: ${item.quantity}</span>
            <button class="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full" data-action="delete">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
        </div>
    `;
    return itemDiv;
}

function renderGroceryList(items) {
    // Clear the existing list
    groceryListContainer.innerHTML = '';

    // If no items, show a message
    if (!items || items.length === 0) {
        groceryListContainer.innerHTML = '<p class="text-center text-gray-500">Your grocery list is empty. Add an item to get started!</p>';
        return;
    }

    // Render each item
    items.forEach(item => {
        const itemElement = createGroceryItemElement(item);
        groceryListContainer.appendChild(itemElement);
    });
}

function clearAddItemForm() {
    addItemForm.reset();
}

function getAddItemFormValue() {
    return {
        name: itemNameInput.value.trim(),
        category: itemCategoryInput.value,
        quantity: parseInt(itemQuantityInput.value, 10) || 1,
        purchased: false
    };
}

function initTheme() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const lightIcon = document.getElementById('theme-icon-light');
    const darkIcon = document.getElementById('theme-icon-dark');

    // Function to set the theme
    const setTheme = (isDark) => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            lightIcon.classList.add('hidden');
            darkIcon.classList.remove('hidden');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            darkIcon.classList.add('hidden');
            lightIcon.classList.remove('hidden');
            localStorage.setItem('theme', 'light');
        }
    };

    // Check for saved theme in localStorage or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        setTheme(true);
    } else {
        setTheme(false);
    }

    // Add click listener
    themeToggleBtn.addEventListener('click', () => {
        const isDark = document.documentElement.classList.contains('dark');
        setTheme(!isDark);
    });
}

const recipeSuggestionsContainer = document.getElementById('recipe-suggestions-container');

function renderRecipeSuggestions(recipes) {
    recipeSuggestionsContainer.innerHTML = '';

    if (!recipes || recipes.length === 0) {
        recipeSuggestionsContainer.innerHTML = '<p class="text-center text-gray-500 col-span-full">No recipe suggestions found for the given ingredients. Try some other ingredients!</p>';
        return;
    }

    recipes.forEach(recipe => {
        const recipeCard = document.createElement('div');
        recipeCard.className = 'bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow';
        recipeCard.innerHTML = `
            <h3 class="text-xl font-bold mb-2">${recipe.title}</h3>
            <p class="text-gray-600 dark:text-gray-300">${recipe.description}</p>
        `;
        recipeSuggestionsContainer.appendChild(recipeCard);
    });
}

window.ui = {
    renderGroceryList,
    clearAddItemForm,
    getAddItemFormValue,
    initTheme,
    renderRecipeSuggestions
};
