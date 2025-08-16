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
            alert('Preferences saved! The AI Agent will now generate a meal plan based on your preferences.');
            setAgentStatus(true);
            hidePrefsModal();
            runAgentPlanning(); // Trigger agent's autonomous planning logic
        }).catch(error => {
            console.error('Failed to save preferences:', error);
            alert('Could not save preferences. Please try again.');
        });
    });
}

async function runAgentPlanning() {
    console.log("Agent planning process initiated...");

    try {
        // 1. Gather data
        const [preferences, groceryList] = await Promise.all([
            window.db.getPreferences(),
            window.db.getAllGroceryItems()
        ]);

        if (!preferences || !preferences.budget) {
            console.log("Agent cannot run without user preferences. Aborting.");
            alert("Please set your preferences before running the agent.");
            return;
        }

        console.log("Data gathered for agent:", { preferences, groceryList });

        // 2. Construct prompt
        const prompt = `
            You are a smart meal planning assistant. Based on the user's preferences and current grocery list, create a 7-day meal plan (Breakfast, Lunch, Dinner) and a corresponding shopping list for any items that need to be purchased.

            User Preferences:
            - Weekly Budget: $${preferences.budget}
            - Diet: ${preferences.diet}
            - Favorite Cuisines: ${preferences.cuisines}

            Current Grocery List:
            ${groceryList.map(item => `- ${item.name} (Quantity: ${item.quantity})`).join('\n')}

            Please return your response as a single, minified JSON object with no extra formatting. The JSON object should have two keys: "meal_plan" and "shopping_list".
            - "meal_plan" should be an array of 7 objects, where each object has "day", "breakfast", "lunch", and "dinner" keys.
            - "shopping_list" should be an array of strings.
        `;

        // 3. Call AI
        const aiResponse = await getAgentMealPlan(prompt);

        // 4. Process response
        try {
            const plan = JSON.parse(aiResponse);
            console.log("AI-Generated Plan:", plan);
            alert("The AI Agent has successfully generated a new meal plan! Check the console for details.");
            // TODO: Save plan to IndexedDB and render in the UI.
        } catch (parseError) {
            console.error("Failed to parse AI response:", parseError);
            alert("The AI returned a plan, but it was not in the correct format. Please try again.");
        }

    } catch (error) {
        console.error("Error during agent planning:", error);
        alert("An error occurred while the agent was planning. Please check the console.");
    }
}

async function getAgentMealPlan(prompt) {
    const apiKey = document.querySelector('meta[name="openai-key"]').getAttribute('content');

    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
        console.error('OpenAI API key not found or is a placeholder.');
        // Return a mock response for development if no key is found
        return JSON.stringify({
            meal_plan: [
                { day: "Monday", breakfast: "Oats", lunch: "Salad", dinner: "Mock Chicken and Rice" }
            ],
            shopping_list: ["Mock Chicken", "Salad Greens"]
        });
    }

    const API_URL = 'https://api.openai.com/v1/chat/completions';

    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: "json_object" } // Request JSON output
        })
    };

    try {
        const response = await fetch(API_URL, requestOptions);
        if (!response.ok) {
            const errorData = await response.json();
            console.error('OpenAI API Error:', errorData);
            throw new Error('The AI agent failed to generate a plan.');
        }
        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error fetching from OpenAI:', error);
        throw error;
    }
}

window.agent = {
    init: initAgentMode
};
