class MessageWriter {
    constructor() {
        this.msg_notSupported = MESSAGES.BROWSER_NOT_SUPPORTED;
        this.msg_written = MESSAGES.DATA_WRITTEN;
        this.msg_key = MESSAGES.STORAGE_KEY;
        this.messages = [];
        this.editingId = null;
        this.autoSaveInterval = null;
        this.lastSavedTime = null;
        
        this.init();
    }

    init() {
        this.checkStorage();
        this.loadMessages();
        this.setupEventListeners();
        this.renderMessages();
        this.startAutoSave();
        this.updateLastSavedDisplay();
    }

    setupEventListeners() {
        const addBtn = document.getElementById('add-note-btn');
        const modal = document.getElementById('add-note-modal');
        const closeBtn = document.querySelector('.close');
        const cancelBtn = document.querySelector('.cancel-btn');
        const form = document.getElementById('add-note-form');

        addBtn.addEventListener('click', () => this.openModal());
        closeBtn.addEventListener('click', () => this.closeModal());
        cancelBtn.addEventListener('click', () => this.closeModal());
        form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    checkStorage() {
        if (typeof (Storage) == "undefined") {
            document.body.innerHTML = `<div style="padding: 20px; text-align: center; color: red;">${this.msg_notSupported}</div>`;
            return;
        }
    }

    loadMessages() {
        const stored = localStorage.getItem(this.msg_key);
        if (stored) {
            try {
                this.messages = JSON.parse(stored);
            } catch (e) {
                console.error('Error parsing messages from localStorage:', e);
                this.messages = [];
            }
        }
    }

    saveMessages() {
        localStorage.setItem(this.msg_key, JSON.stringify(this.messages));
        this.lastSavedTime = new Date();
        this.updateLastSavedDisplay();
    }

    //AI helped with auto save for both reader and writer
    startAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
        
        this.autoSaveInterval = setInterval(() => {
            this.saveMessages();
        }, 2000);
    }

    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }

    updateLastSavedDisplay() {
        const timestampElement = document.getElementById('last-saved-time');
        if (timestampElement) {
            if (this.lastSavedTime) {
                timestampElement.textContent = `${MESSAGES.LAST_SAVED} ${this.lastSavedTime.toLocaleTimeString()}`;
            } else {
                timestampElement.textContent = MESSAGES.NOT_SAVED_YET;
            }
        }
    }

    openModal() {
        document.getElementById('add-note-modal').style.display = 'block';
        document.getElementById('note-title').focus();
    }

    closeModal() {
        document.getElementById('add-note-modal').style.display = 'none';
        document.getElementById('add-note-form').reset();
        this.editingId = null;
        document.querySelector('.modal-header h3').textContent = MESSAGES.ADD_NOTE;
    }

    editMessage(id) {
        const message = this.messages.find(m => m.id === id);
        if (message) {
            this.editingId = id;
            document.getElementById('note-title').value = message.title;
            document.getElementById('note-content').value = message.content;
            document.querySelector('.modal-header h3').textContent = MESSAGES.EDIT_NOTE;
            this.openModal();
        }
    }

    handleSubmit(e) {
        e.preventDefault();
        
        const title = document.getElementById('note-title').value.trim();
        const content = document.getElementById('note-content').value.trim();
        
        if (!title || !content) {
            alert(MESSAGES.FILL_BOTH_FIELDS);
            return;
        }

        if (this.editingId) {
            const message = this.messages.find(m => m.id === this.editingId);
            if (message) {
                message.title = title;
                message.content = content;
                message.updatedAt = new Date().toISOString();
            }
            this.showMessage(MESSAGES.NOTE_UPDATED);
        } else {
            const message = {
                id: Date.now().toString(),
                title: title,
                content: content,
                createdAt: new Date().toISOString()
            };
            this.messages.push(message);
            this.showMessage(MESSAGES.NOTE_ADDED);
        }

        this.saveMessages();
        this.renderMessages();
        this.closeModal();
    }

    removeMessage(id) {
        if (confirm(MESSAGES.CONFIRM_DELETE)) {
            this.messages = this.messages.filter(m => m.id !== id);
            this.saveMessages();
            this.renderMessages();
            this.showMessage(MESSAGES.MESSAGE_REMOVED);
        }
    }

    renderMessages() {
        const messagesList = document.getElementById('messages-list');
        
        if (this.messages.length === 0) {
            messagesList.innerHTML = `<p class="no-messages">${MESSAGES.NO_MESSAGES}</p>`;
            return;
        }

        const sortedMessages = [...this.messages].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        messagesList.innerHTML = sortedMessages.map(message => `
            <div class="message-item" onclick="messageWriter.editMessage('${message.id}')">
                <div class="message-content">
                    <h3>${this.escapeHtml(message.title)}</h3>
                    <p>${this.escapeHtml(message.content)}</p>
                    <small style="color: #999; font-size: 0.8em;">
                        Created: ${new Date(message.createdAt).toLocaleString()}
                        ${message.updatedAt ? ` | Updated: ${new Date(message.updatedAt).toLocaleString()}` : ''}
                    </small>
                </div>
                <div class="message-actions">
                    <button class="remove-btn" onclick="event.stopPropagation(); messageWriter.removeMessage('${message.id}')">Remove</button>
                </div>
            </div>
        `).join('');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showMessage(message) {
        const existingMessage = document.querySelector('.message-toast');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = 'message-toast';
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #28a745;
            color: white;
            padding: 10px 20px;
            border-radius: 4px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(messageDiv);

        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }
}

let messageWriter;
document.addEventListener('DOMContentLoaded', () => {
    messageWriter = new MessageWriter();
});

window.addEventListener('beforeunload', () => {
    if (messageWriter) {
        messageWriter.stopAutoSave();
    }
});

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);