// js/agentMode.js - Handles the automation and preferences for Agent Mode.

function initAgentMode() {
    // DOM Elements
    const agentModeToggleBtn = document.getElementById('agent-mode-toggle');
    const agentPrefsModal = document.getElementById('agent-prefs-modal');
    const agentPrefsCloseBtn = document.getElementById('agent-prefs-close-btn');
    const agentStatusBadge = document.getElementById('agent-status-badge');
    const agentPrefsForm = document.getElementById('agent-prefs-form');
    const budgetInput = document.getElementById('pref-budget');
    const dietInput = document.getElementById('pref-diet');
    const cuisinesInput = document.getElementById('pref-cuisines');

    let agentEnabled = false;

    // Function to show the modal
    function showPrefsModal() {
        agentPrefsModal.classList.remove('hidden');
    }

    // Function to hide the modal
    function hidePrefsModal() {
        agentPrefsModal.classList.add('hidden');
    }

    // Function to update the agent's status and UI
    function setAgentStatus(enabled) {
        agentEnabled = enabled;
        if (enabled) {
            agentStatusBadge.classList.remove('hidden');
            agentModeToggleBtn.textContent = 'Agent Settings';
        } else {
            agentStatusBadge.classList.add('hidden');
            agentModeToggleBtn.textContent = 'Enable Agent Mode';
        }
    }

    // Load existing preferences and set initial state
    window.db.getPreferences().then(prefs => {
        if (prefs && prefs.budget) { // Check if prefs are actually set
            budgetInput.value = prefs.budget;
            dietInput.value = prefs.diet;
            cuisinesInput.value = prefs.cuisines;
            setAgentStatus(true);
        }
    });

    // Event listeners
    agentModeToggleBtn.addEventListener('click', showPrefsModal);
    agentPrefsCloseBtn.addEventListener('click', hidePrefsModal);

    agentPrefsForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const preferences = {
            budget: parseFloat(budgetInput.value),
            diet: dietInput.value,
            cuisines: cuisinesInput.value.trim()
        };

        window.db.savePreferences(preferences).then(() => {
            alert('Preferences saved!');
            setAgentStatus(true);
            hidePrefsModal();
            // TODO: Trigger agent's autonomous planning logic
        }).catch(error => {
            console.error('Failed to save preferences:', error);
            alert('Could not save preferences. Please try again.');
        });
    });
}

window.agent = {
    init: initAgentMode
};
