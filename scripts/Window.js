class Window {
    constructor(id, number, tabs) {
        this.id = id;
        this.number = number;
        this.tabs = tabs
    }

    get tabs() {
        return this._tabs;
    }

    set tabs(tabs) {
        this._tabs = tabs;
    }
};