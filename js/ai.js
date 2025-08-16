// js/ai.js - Manages the AI Recipe Suggestion placeholder.

function getAIRecipeSuggestions(ingredients) {
    console.log('Getting AI recipe suggestions for:', ingredients);

    return new Promise((resolve, reject) => {
        // Simulate a network delay
        setTimeout(() => {
            // In a real app, this would be an API call to OpenAI, Spoonacular, etc.
            // For now, we return hardcoded data based on simple keyword matching.

            const mockRecipes = [
                {
                    id: 1,
                    title: 'Chicken and Rice Skillet',
                    description: 'A simple one-pan meal that is ready in 30 minutes.',
                    requiredIngredients: ['chicken', 'rice', 'onion'],
                },
                {
                    id: 2,
                    title: 'Tomato and Onion Omelette',
                    description: 'A quick and healthy breakfast option.',
                    requiredIngredients: ['eggs', 'tomatoes', 'onion'],
                },
                {
                    id: 3,
                    title: 'Simple Chicken Salad',
                    description: 'A classic chicken salad recipe, perfect for sandwiches.',
                    requiredIngredients: ['chicken', 'mayonnaise', 'celery'],
                },
                {
                    id: 4,
                    title: 'Garlic Bread',
                    description: 'Easy and delicious homemade garlic bread.',
                    requiredIngredients: ['bread', 'garlic', 'butter'],
                }
            ];

            const userIngredients = ingredients.toLowerCase().split(/[\s,]+/);
            const suggestions = mockRecipes.filter(recipe =>
                recipe.requiredIngredients.some(req => userIngredients.includes(req))
            );

            if (suggestions.length > 0) {
                resolve(suggestions);
            } else {
                // Resolve with a default message or an empty array if no matches
                resolve([]);
            }

        }, 1000); // 1-second delay
    });
}

// Export the function
window.ai = {
    getAIRecipeSuggestions
};
