// js/store.js - Manages IndexedDB and application state.

const DB_NAME = 'smartGroceryDB';
const DB_VERSION = 1;
const GROCERY_STORE_NAME = 'groceries';

let db;

function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(GROCERY_STORE_NAME)) {
                const store = db.createObjectStore(GROCERY_STORE_NAME, { keyPath: 'id', autoIncrement: true });
                store.createIndex('category', 'category', { unique: false });
            }
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            console.log('Database initialized successfully');
            resolve(db);
        };

        request.onerror = (event) => {
            console.error('Database error:', event.target.error);
            reject('Error opening database');
        };
    });
}

function addGroceryItem(item) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject('Database not initialized');
            return;
        }
        const transaction = db.transaction([GROCERY_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(GROCERY_STORE_NAME);
        const request = store.add(item);

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = (event) => {
            reject('Error adding item: ' + event.target.error);
        };
    });
}

function getAllGroceryItems() {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject('Database not initialized');
            return;
        }
        const transaction = db.transaction([GROCERY_STORE_NAME], 'readonly');
        const store = transaction.objectStore(GROCERY_STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = (event) => {
            reject('Error getting all items: ' + event.target.error);
        };
    });
}

function deleteGroceryItem(id) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject('Database not initialized');
            return;
        }
        const transaction = db.transaction([GROCERY_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(GROCERY_STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => {
            resolve();
        };

        request.onerror = (event) => {
            reject('Error deleting item: ' + event.target.error);
        };
    });
}

function updateGroceryItem(id, updateData) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject('Database not initialized');
            return;
        }
        const transaction = db.transaction([GROCERY_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(GROCERY_STORE_NAME);
        const getRequest = store.get(id);

        getRequest.onsuccess = () => {
            const item = getRequest.result;
            if (item) {
                // Merge updates
                Object.assign(item, updateData);
                const putRequest = store.put(item);
                putRequest.onsuccess = () => {
                    resolve(putRequest.result);
                };
                putRequest.onerror = (event) => {
                    reject('Error updating item: ' + event.target.error);
                };
            } else {
                reject('Item not found');
            }
        };

        getRequest.onerror = (event) => {
            reject('Error getting item to update: ' + event.target.error);
        };
    });
}

function seedDatabase() {
    const seedItems = [
        { name: 'Milk', category: 'Dairy', quantity: 1, purchased: false },
        { name: 'Bread', category: 'Bakery', quantity: 1, purchased: false },
        { name: 'Eggs', category: 'Dairy', quantity: 1, purchased: true },
    ];

    return Promise.all(seedItems.map(item => addGroceryItem(item)));
}

// Export functions to be called from other scripts
window.db = {
    initDB,
    addGroceryItem,
    getAllGroceryItems,
    deleteGroceryItem,
    updateGroceryItem,
    seedDatabase
};
