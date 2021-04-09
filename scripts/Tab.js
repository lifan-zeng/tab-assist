class Tab {
    constructor(windowId, url, id, index, title, active, selected, favIconUrl) {
        this.windowId = windowId;
        this.url = url;
        this.id = id;
        this.index = index;
        this.title = title;
        this.active = active;
        this.selected = selected; //may have to change to highlighted
        this.favIconUrl = favIconUrl;
    }
}