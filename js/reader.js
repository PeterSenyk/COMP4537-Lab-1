class NoteReader {
    constructor() {
        this.msg_notSupported = MESSAGES.BROWSER_NOT_SUPPORTED;
        this.msg_key = MESSAGES.STORAGE_KEY;
        this.notes = [];
        this.autoRefreshInterval = null;
        this.lastRetrievedTime = null;
        
        this.init();
    }

    init() {
        this.checkStorage();
        this.loadNotes();
        this.renderNotes();
        this.startAutoRefresh();
        this.updateLastRetrievedDisplay();
    }

    checkStorage() {
        if (typeof (Storage) == "undefined") {
            document.body.innerHTML = `<div style="padding: 20px; text-align: center; color: red;">${this.msg_notSupported}</div>`;
            return;
        }
    }

    loadNotes() {
        const stored = localStorage.getItem(this.msg_key);
        if (stored) {
            try {
                this.notes = JSON.parse(stored);
                this.lastRetrievedTime = new Date();
                this.updateLastRetrievedDisplay();
            } catch (e) {
                console.error('Error parsing notes from localStorage:', e);
                this.notes = [];
            }
        }
    }

    startAutoRefresh() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
        }
        
        this.autoRefreshInterval = setInterval(() => {
            this.loadNotes();
            this.renderNotes();
        }, 2000);
    }

    stopAutoRefresh() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
            this.autoRefreshInterval = null;
        }
    }

    updateLastRetrievedDisplay() {
        const timestampElement = document.getElementById('last-retrieved-time');
        if (timestampElement) {
            if (this.lastRetrievedTime) {
                timestampElement.textContent = `${MESSAGES.LAST_RETRIEVED} ${this.lastRetrievedTime.toLocaleTimeString()}`;
            } else {
                timestampElement.textContent = MESSAGES.NOT_SAVED_YET;
            }
        }
    }

    renderNotes() {
        const notesList = document.getElementById('notes-list');
        
        if (this.notes.length === 0) {
            notesList.innerHTML = `<p class="no-notes">${MESSAGES.NO_NOTES}</p>`;
            return;
        }

        const sortedNotes = [...this.notes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        notesList.innerHTML = sortedNotes.map(note => `
            <div class="note-item-readonly">
                <div class="note-content">
                    <h3>${this.escapeHtml(note.title)}</h3>
                    <p>${this.escapeHtml(note.content)}</p>
                    <div class="note-meta">
                        <small class="note-date">
                            Created: ${new Date(note.createdAt).toLocaleString()}
                        </small>
                        ${note.updatedAt ? `
                            <small class="note-date">
                                | Updated: ${new Date(note.updatedAt).toLocaleString()}
                            </small>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

let noteReader;
document.addEventListener('DOMContentLoaded', () => {
    noteReader = new NoteReader();
});

window.addEventListener('beforeunload', () => {
    if (noteReader) {
        noteReader.stopAutoRefresh();
    }
});