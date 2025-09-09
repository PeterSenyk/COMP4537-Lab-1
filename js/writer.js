class NoteWriter {
    constructor() {
        this.msg_notSupported = MESSAGES.BROWSER_NOT_SUPPORTED;
        this.msg_written = MESSAGES.DATA_WRITTEN;
        this.msg_key = MESSAGES.STORAGE_KEY;
    }

    checkStorage() {
        if (typeof (Storage) == "undefined") {
            document.write(this.msg_notSupported);
            window.stop();
        }
    }

    writeData() {
        localStorage.setItem(this.msg_key, "2021");
        document.write(this.msg_written + this.msg_key);
    }
}