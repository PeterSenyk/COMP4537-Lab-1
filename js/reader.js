class NoteReader {
    constructor() {
        this.noteArea = document.getElementById('note-area');
        this.loadMessage();
    }

    loadMessage() {
        if (typeof(Storage) !== "undefined") {
            const key = MESSAGES.STORAGE_KEY;
            const message = MESSAGES.DATA_WRITTEN + key;
            localStorage.setItem(key, message);
            this.noteArea.innerText = message;
        } else {
            this.noteArea.innerText = MESSAGES.BROWSER_NOT_SUPPORTED;
        }
    }
}

window.onload = () => {
    new NoteReader();
};