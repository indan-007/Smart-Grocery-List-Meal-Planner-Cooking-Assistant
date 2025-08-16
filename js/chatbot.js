// js/chatbot.js - Handles the conversational UI and logic for the AI Chatbot.

const chatbotPanel = document.getElementById('chatbot-panel');
const chatbotToggleBtn = document.getElementById('chatbot-toggle-btn');
const chatbotCloseBtn = document.getElementById('chatbot-close-btn');
const chatbotHistory = document.getElementById('chatbot-history');

function renderMessage(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('mb-4');

    if (sender === 'user') {
        messageElement.classList.add('text-right');
        messageElement.innerHTML = `<p class="bg-primary text-white rounded-lg py-2 px-4 inline-block">${message}</p>`;
    } else {
        messageElement.classList.add('text-left');
        messageElement.innerHTML = `<p class="bg-gray-200 dark:bg-gray-600 rounded-lg py-2 px-4 inline-block">${message}</p>`;
    }

    chatbotHistory.appendChild(messageElement);
    // Scroll to the bottom
    chatbotHistory.scrollTop = chatbotHistory.scrollHeight;
}

const chatbotForm = document.getElementById('chatbot-form');
const chatbotInput = document.getElementById('chatbot-input');

function renderTypingIndicator() {
    const typingElement = document.createElement('div');
    typingElement.id = 'typing-indicator';
    typingElement.classList.add('mb-4', 'text-left');
    typingElement.innerHTML = `<p class="bg-gray-200 dark:bg-gray-600 rounded-lg py-2 px-4 inline-block">Typing...</p>`;
    chatbotHistory.appendChild(typingElement);
    chatbotHistory.scrollTop = chatbotHistory.scrollHeight;
}

function removeTypingIndicator() {
    const typingElement = document.getElementById('typing-indicator');
    if (typingElement) {
        typingElement.remove();
    }
}

async function handleUserMessage(message) {
    if (!message) return;

    renderMessage(message, 'user');
    chatbotInput.value = '';
    chatbotInput.disabled = true;

    // Show typing indicator and get response
    renderTypingIndicator();
    const response = await getOpenAIChatResponse(message);
    removeTypingIndicator();

    renderMessage(response, 'bot');
    chatbotInput.disabled = false;
    chatbotInput.focus();
}

function initChatbot() {
    let isFirstOpen = true;

    chatbotForm.addEventListener('submit', (event) => {
        event.preventDefault();
        handleUserMessage(chatbotInput.value.trim());
    });

    chatbotToggleBtn.addEventListener('click', () => {
        chatbotPanel.classList.toggle('hidden');
        if (isFirstOpen && !chatbotPanel.classList.contains('hidden')) {
            renderMessage("Hello! I'm your smart cooking assistant. Ask me anything about recipes, meal plans, or your grocery list.", 'bot');
            isFirstOpen = false;
        }
    });

    chatbotCloseBtn.addEventListener('click', () => {
        chatbotPanel.classList.add('hidden');
    });
}

async function getOpenAIChatResponse(prompt) {
    const apiKey = document.querySelector('meta[name="openai-key"]').getAttribute('content');

    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
        console.error('OpenAI API key not found or is a placeholder.');
        return "Please configure your OpenAI API key in index.html to use the live chat feature.";
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
            messages: [{ role: 'user', content: prompt }]
        })
    };

    try {
        const response = await fetch(API_URL, requestOptions);
        if (!response.ok) {
            const errorData = await response.json();
            console.error('OpenAI API Error:', errorData);
            throw new Error('The AI assistant is currently unavailable.');
        }
        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error fetching from OpenAI:', error);
        return "Sorry, I couldn't connect to the AI assistant. Please check your network or API key.";
    }
}

window.chatbot = {
    init: initChatbot,
    renderMessage,
    getOpenAIChatResponse
};
