/**
 * Form Builder Bug Report - Chat Application
 * A full-screen AI chatbot for converting user-reported issues into professional bug reports
 */

// DOM Element References
const themeToggle = document.getElementById('themeToggle');
const clearChatBtn = document.getElementById('clearChat');
const messagesArea = document.getElementById('messagesArea');
const welcomeMessage = document.getElementById('welcomeMessage');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const uploadBtn = document.getElementById('uploadBtn');
const fileInput = document.getElementById('fileInput');
const imagePreviewContainer = document.getElementById('imagePreviewContainer');
const previewImage = document.getElementById('previewImage');
const removeImageBtn = document.getElementById('removeImage');
const dropZoneOverlay = document.getElementById('dropZoneOverlay');

// State Management
let currentImage = null; // { base64: string, mimeType: string }
let isLoading = false;
let messageHistory = []; // Array of { role: string, content: array }

// ==================== Theme Management ====================

/**
 * Initialize theme from localStorage or system preference
 */
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (systemPrefersDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
}

/**
 * Toggle between light and dark themes
 */
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// ==================== Textarea Auto-Resize ====================

/**
 * Auto-resize textarea based on content
 */
function autoResizeTextarea() {
    messageInput.style.height = 'auto';
    messageInput.style.height = Math.min(messageInput.scrollHeight, 150) + 'px';
}

// ==================== Image Handling ====================

/**
 * Validate and process selected image file
 * @param {File} file - The selected file
 */
function handleImageFile(file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showErrorMessage('Please select a valid image file.');
        return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
        showErrorMessage('Image size must be less than 10MB.');
        return;
    }

    // Read file and convert to base64
    const reader = new FileReader();
    reader.onload = (e) => {
        const base64Data = e.target.result;
        currentImage = {
            base64: base64Data,
            mimeType: file.type
        };
        showImagePreview(base64Data);
    };
    reader.onerror = () => {
        showErrorMessage('Failed to read image file.');
    };
    reader.readAsDataURL(file);
}

/**
 * Display image preview
 * @param {string} base64Data - Base64 encoded image data
 */
function showImagePreview(base64Data) {
    previewImage.src = base64Data;
    imagePreviewContainer.classList.add('visible');
}

/**
 * Remove selected image
 */
function removeImage() {
    currentImage = null;
    previewImage.src = '';
    fileInput.value = '';
    imagePreviewContainer.classList.remove('visible');
}

// ==================== Drag and Drop ====================

/**
 * Show drop zone overlay
 */
function showDropZone() {
    dropZoneOverlay.classList.add('visible');
}

/**
 * Hide drop zone overlay
 */
function hideDropZone() {
    dropZoneOverlay.classList.remove('visible');
}

/**
 * Handle dropped files
 * @param {DataTransfer} dataTransfer - DataTransfer object from drop event
 */
function handleDrop(dataTransfer) {
    hideDropZone();
    
    const files = dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
            handleImageFile(file);
        }
    }
}

// ==================== Message Rendering ====================

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Convert markdown-like formatting to HTML
 * @param {string} text - Text with markdown
 * @returns {string} HTML formatted text
 */
function formatMessageText(text) {
    // Escape HTML first
    let formatted = escapeHtml(text);
    
    // Convert **bold** to <strong>
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert line breaks
    formatted = formatted.replace(/\n/g, '<br>');
    
    return formatted;
}

/**
 * Create a message element
 * @param {string} role - 'user' or 'assistant'
 * @param {string} text - Message text
 * @param {string|null} imageUrl - Optional image URL
 * @returns {HTMLElement} Message element
 */
function createMessageElement(role, text, imageUrl = null) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;

    // Avatar
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';
    
    if (role === 'user') {
        avatarDiv.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/>
            </svg>
        `;
    } else {
        avatarDiv.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
            </svg>
        `;
    }

    // Content
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    // Image (if present)
    if (imageUrl) {
        const img = document.createElement('img');
        img.className = 'message-image';
        img.src = imageUrl;
        img.alt = 'Attached image';
        img.onclick = () => window.open(imageUrl, '_blank');
        contentDiv.appendChild(img);
    }

    // Text bubble
    if (text) {
        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'message-bubble';
        
        const textDiv = document.createElement('div');
        textDiv.className = 'message-text';
        textDiv.innerHTML = formatMessageText(text);
        
        bubbleDiv.appendChild(textDiv);
        contentDiv.appendChild(bubbleDiv);
    }

    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);

    return messageDiv;
}

/**
 * Create typing indicator element
 * @returns {HTMLElement} Typing indicator element
 */
function createTypingIndicator() {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message assistant';
    messageDiv.id = 'typingIndicator';

    messageDiv.innerHTML = `
        <div class="message-avatar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
            </svg>
        </div>
        <div class="message-content">
            <div class="message-bubble">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    `;

    return messageDiv;
}

/**
 * Show typing indicator
 */
function showTypingIndicator() {
    const indicator = createTypingIndicator();
    messagesArea.appendChild(indicator);
    scrollToBottom();
}

/**
 * Remove typing indicator
 */
function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

/**
 * Show error message
 * @param {string} errorText - Error message to display
 */
function showErrorMessage(errorText) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message assistant error';

    messageDiv.innerHTML = `
        <div class="message-avatar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
            </svg>
        </div>
        <div class="message-content">
            <div class="message-bubble">
                <div class="message-text">${escapeHtml(errorText)}</div>
            </div>
        </div>
    `;

    messagesArea.appendChild(messageDiv);
    scrollToBottom();
}

/**
 * Scroll messages area to bottom
 */
function scrollToBottom() {
    messagesArea.scrollTop = messagesArea.scrollHeight;
}

/**
 * Remove welcome message
 */
function removeWelcomeMessage() {
    if (welcomeMessage) {
        welcomeMessage.remove();
    }
}

// ==================== API Communication ====================

/**
 * Send message to the API
 * @param {string} text - Message text
 * @param {object|null} image - Image object { base64, mimeType }
 */
async function sendMessage(text, image) {
    if (isLoading) return;

    // Remove welcome message on first message
    removeWelcomeMessage();

    // Build content array for the message
    const content = [];
    
    if (text) {
        content.push({
            type: 'text',
            text: text
        });
    }

    if (image) {
        content.push({
            type: 'image_url',
            image_url: {
                url: image.base64
            }
        });
    }

    // Create and display user message
    const userMessage = createMessageElement('user', text, image ? image.base64 : null);
    messagesArea.appendChild(userMessage);
    scrollToBottom();

    // Add to message history
    messageHistory.push({
        role: 'user',
        content: content
    });

    // Clear input and image
    messageInput.value = '';
    autoResizeTextarea();
    removeImage();

    // Set loading state
    isLoading = true;
    sendBtn.disabled = true;
    showTypingIndicator();

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: messageHistory
            })
        });

        removeTypingIndicator();

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Request failed with status ${response.status}`);
        }

        const data = await response.json();
        
        // Extract assistant message
        const assistantContent = data.choices?.[0]?.message?.content || 'No response received.';
        
        // Add to message history
        messageHistory.push({
            role: 'assistant',
            content: [{ type: 'text', text: assistantContent }]
        });

        // Display assistant message
        const assistantMessage = createMessageElement('assistant', assistantContent);
        messagesArea.appendChild(assistantMessage);
        scrollToBottom();

    } catch (error) {
        removeTypingIndicator();
        console.error('API Error:', error);
        showErrorMessage(`Failed to send message: ${error.message}`);
    } finally {
        isLoading = false;
        sendBtn.disabled = false;
        messageInput.focus();
    }
}

// ==================== Clear Chat ====================

/**
 * Clear all chat messages and reset state
 */
function clearChat() {
    // Clear message history
    messageHistory = [];

    // Clear messages area
    messagesArea.innerHTML = '';

    // Re-add welcome message
    const welcomeHtml = `
        <div class="welcome-message" id="welcomeMessage">
            <div class="welcome-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
                </svg>
            </div>
            <h2 class="welcome-title">Welcome to Bug Report Assistant</h2>
            <p class="welcome-description">
                Describe any issue you've encountered in the Form Builder platform, and I'll convert it into a professional, developer-ready bug report.
            </p>
            <div class="feature-chips">
                <span class="chip">📝 Text Input</span>
                <span class="chip">🖼️ Image Upload</span>
                <span class="chip">🐛 Bug Reports</span>
                <span class="chip">📋 DevOps Ready</span>
            </div>
        </div>
    `;
    messagesArea.innerHTML = welcomeHtml;

    // Clear any attached image
    removeImage();

    // Clear input
    messageInput.value = '';
    autoResizeTextarea();
}

// ==================== Form Submission Handler ====================

/**
 * Handle form submission
 */
function handleSubmit() {
    const text = messageInput.value.trim();
    
    if (!text && !currentImage) {
        return;
    }

    sendMessage(text, currentImage);
}

// ==================== Event Listeners ====================

// Theme toggle
themeToggle.addEventListener('click', toggleTheme);

// Clear chat
clearChatBtn.addEventListener('click', clearChat);

// Textarea auto-resize and submit
messageInput.addEventListener('input', autoResizeTextarea);
messageInput.addEventListener('keydown', (e) => {
    // Enter to send, Shift+Enter for new line
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
    }
});

// Send button
sendBtn.addEventListener('click', handleSubmit);

// Image upload button
uploadBtn.addEventListener('click', () => fileInput.click());

// File input change
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleImageFile(e.target.files[0]);
    }
});

// Remove image button
removeImageBtn.addEventListener('click', removeImage);

// Drag and drop events
let dragCounter = 0;

document.addEventListener('dragenter', (e) => {
    e.preventDefault();
    dragCounter++;
    if (e.dataTransfer.types.includes('Files')) {
        showDropZone();
    }
});

document.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dragCounter--;
    if (dragCounter === 0) {
        hideDropZone();
    }
});

document.addEventListener('dragover', (e) => {
    e.preventDefault();
});

document.addEventListener('drop', (e) => {
    e.preventDefault();
    dragCounter = 0;
    handleDrop(e.dataTransfer);
});

// Prevent default drag behavior on drop zone
dropZoneOverlay.addEventListener('dragenter', (e) => e.preventDefault());
dropZoneOverlay.addEventListener('dragover', (e) => e.preventDefault());
dropZoneOverlay.addEventListener('drop', (e) => {
    e.preventDefault();
    dragCounter = 0;
    handleDrop(e.dataTransfer);
});

// ==================== Initialization ====================

// Initialize theme on load
initializeTheme();

// Focus input on load
messageInput.focus();

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    }
});
