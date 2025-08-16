// Main JavaScript file for the application

document.addEventListener('DOMContentLoaded', () => {
    // Initialize UI components
    window.ui.initTheme();
    if (window.chatbot) {
        window.chatbot.init();
    }

    const addItemForm = document.getElementById('add-grocery-form');

    // Function to refresh the grocery list from the DB
    function refreshGroceryList() {
        return window.db.getAllGroceryItems()
            .then(window.ui.renderGroceryList)
            .catch(error => {
                console.error('Failed to refresh grocery list:', error);
                alert('Could not load the grocery list.');
            });
    }

    // Function to initialize the app: check for seed data, then render
    functioninitializeApp() {
        window.db.getAllGroceryItems().then(items => {
            if (items.length === 0) {
                console.log('No items found, seeding database...');
                window.db.seedDatabase().then(() => {
                    refreshGroceryList();
                });
            } else {
                window.ui.renderGroceryList(items);
            }
        });
    }

    // Register the service worker
    if (window.pwa) {
        window.pwa.registerServiceWorker();
    }

    // Initialize the database and then the application
    if (window.db) {
        window.db.initDB().then(() => {
            console.log('Database is ready.');
            initializeApp();
        }).catch(error => {
            console.error('Failed to initialize database:', error);
        });
    } else {
        console.error('DB object not found. Make sure store.js is loaded correctly.');
    }

    const groceryListContainer = document.getElementById('grocery-list');
    const getRecipesBtn = document.getElementById('get-recipes-btn');
    const ingredientsInput = document.getElementById('ingredients-input');

    // Handle the form submission for adding a new item
    addItemForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const newItem = window.ui.getAddItemFormValue();

        // Basic validation
        if (!newItem.name) {
            alert('Item name cannot be empty!');
            return;
        }

        window.db.addGroceryItem(newItem).then(() => {
            console.log('Item added successfully');
            refreshGroceryList(); // Re-render the entire list
            window.ui.clearAddItemForm();
        }).catch(error => {
            console.error('Failed to add item:', error);
            alert('There was an error adding the item. Please try again.');
        });
    });

    // Handle clicks on the grocery list for actions like delete or purchase
    groceryListContainer.addEventListener('click', (event) => {
        const target = event.target;
        const itemElement = target.closest('[data-id]');

        if (!itemElement) return;

        const itemId = parseInt(itemElement.dataset.id, 10);
        // Handle checkbox change for "purchased" status
        if (target.matches('input[type="checkbox"]')) {
            const isPurchased = target.checked;
            window.db.updateGroceryItem(itemId, { purchased: isPurchased }).then(() => {
                console.log('Item purchase status updated');
                // We can do a full refresh, or just update the UI element for a smoother experience.
                // For now, full refresh is fine and ensures consistency.
                refreshGroceryList();
            }).catch(error => {
                console.error('Failed to update item status:', error);
                alert('Could not update the item status.');
                // Revert the checkbox on error
                target.checked = !isPurchased;
            });
            return; // Stop further processing
        }

        // Handle delete button click
        const actionTarget = target.closest('[data-action]');
        if (actionTarget && actionTarget.dataset.action === 'delete') {
            if (confirm('Are you sure you want to delete this item?')) {
                window.db.deleteGroceryItem(itemId).then(() => {
                    console.log('Item deleted successfully');
                    refreshGroceryList();
                }).catch(error => {
                    console.error('Failed to delete item:', error);
                    alert('Could not delete the item.');
                });
            }
        }
    });

    // Handle click for getting AI recipe suggestions
    getRecipesBtn.addEventListener('click', () => {
        const ingredients = ingredientsInput.value;
        if (!ingredients.trim()) {
            alert('Please enter some ingredients.');
            return;
        }

        // Show loading state
        getRecipesBtn.disabled = true;
        getRecipesBtn.textContent = 'Searching for recipes...';
        window.ui.renderRecipeSuggestions(null); // Clear previous results and show loading/empty message

        window.ai.getAIRecipeSuggestions(ingredients)
            .then(recipes => {
                window.ui.renderRecipeSuggestions(recipes);
            })
            .catch(error => {
                console.error('Failed to get recipe suggestions:', error);
                alert('Could not fetch recipe suggestions.');
                window.ui.renderRecipeSuggestions([]); // Render empty state on error
            })
            .finally(() => {
                // Restore button state
                getRecipesBtn.disabled = false;
                getRecipesBtn.textContent = 'Get Recipes';
            });
    });
});
