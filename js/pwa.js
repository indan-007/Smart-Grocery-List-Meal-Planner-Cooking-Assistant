// js/pwa.js - Manages the service worker.

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker registered with scope:', registration.scope);
                })
                .catch(error => {
                    console.error('Service Worker registration failed:', error);
                });
        });
    } else {
        console.log('Service Worker is not supported by this browser.');
    }
}

window.pwa = {
    registerServiceWorker
};
