// import Window from "./Window.js";
// import Tab from "./Tab.js";

class TabAssist {
    constructor() {
        this.allWindows = [];
        this.highlighted = []; // array of elements
        this.dragImage;
    }

    get allWindows(){
        return this._allWindows;
    }

    set allWindows(allWindows){
        this._allWindows = allWindows;
    }

    startup() {
        this.generateTabs();
        this.initActionbar();
    }

    generateTabs(callback) {
        this.allWindows = []
        chrome.windows.getAll({ populate: true }, (windowsList) => {
            this.pushTabs(windowsList);
            this.displayTabs();
            this.layoutWindows();
            if (callback) callback();
        });
    }

    pushTabs(windowsList) {
        for (let i = 0; i < windowsList.length; i++) {
            let newTabs = [],
                window = windowsList[i],
                tabs = window.tabs;
            for (let j = 0; j < tabs.length; j++) {
                let tab = tabs[j];
                let newTab = new Tab(
                    tab.windowId,
                    tab.url,
                    tab.id,
                    tab.index,
                    tab.title,
                    tab.active,
                    tab.selected,
                    tab.favIconUrl,
                );
                newTabs.push(newTab);
            }
            let newWindow = new Window(window.id, i, newTabs)
            this.allWindows.push(newWindow);
        }
        // console.log('pushTabs done');
    }

    displayTabs() {
        // console.log('displayTabs')
        let body = document.getElementsByTagName('body')[0],
            masterWindows = document.getElementsByClassName('master-window-container')[0];
        
        // clear window containers
        while (masterWindows.firstChild) {
            masterWindows.removeChild(masterWindows.firstChild);
        }
        
        for(let i = 0; i < this.allWindows.length; i++) {
            let tabs = this.allWindows[i].tabs;
            if(tabs.length > 0) {
                let newWindow = document.createElement('div');
                newWindow.className = 'window-container';
                newWindow.id = this.allWindows[i].id;
    
                // create window heading
                let heading = document.createElement('div'),
                    newTab = document.createElement('button');
    
                // new tab button
                newTab.className = 'new-tab';
                newTab.innerHTML = '+';
                newTab.title = 'New Tab';
                newWindow.appendChild(newTab);
                newTab.addEventListener('click', (ev) => {
                    chrome.tabs.create({windowId: this.allWindows[i].id, active: false}, (tab) => {
                        this.generateTabs();
                    });
                });
    
                heading.className = 'window-heading';
                heading.innerHTML = 'Window ' + (i + 1);
                newWindow.insertBefore(heading, newWindow.firstChild);
                masterWindows.appendChild(newWindow, masterWindows.firstChild);
    
                // create tabs HTML
                for(let j = 0; j < tabs.length; j++) {
                    let tabElement = document.createElement('div'),
                        tabTitle = document.createElement('div'),
                        tabIcon = document.createElement('div');
                    let tab = tabs[j];
                    
                    tabTitle.innerText = tab.title;
                    tabTitle.className = 'tab-title';
                    tabIcon.style.backgroundImage = 'url(' + tab.favIconUrl + ')';
                    tabIcon.className = 'tab-favicon';
                    this.addTabElementProperties(tabElement);
                    tabElement.appendChild(tabIcon);
                    tabElement.appendChild(tabTitle);
                    tabElement.id = tab.id;
                    // tabElement.title = tab.title;
                    newWindow.appendChild(tabElement);
                }
                let emptyElement = document.createElement('div');
                emptyElement.className = 'blank-tab';
                emptyElement.addEventListener('dragover', this.dragoverHandler);
                emptyElement.addEventListener('drop', (ev) => this.tabDropHandler(ev));
                emptyElement.addEventListener('dragleave', this.dragleaveHandler);
                emptyElement.addEventListener('dragenter', this.dragenterHandler);
                emptyElement.style.height = '12px'
                emptyElement.style.cursor = 'default';
                newWindow.appendChild(emptyElement);
            }
        }
    }

    initActionbar() {
        let close = document.getElementById('abClose'),
            newWin = document.getElementById('abNewWin');
        
        close.addEventListener('click', (ev) => {
            this.highlighted = Array.from(document.getElementsByClassName('highlight'));
            let highlightedIds = [];
            this.highlighted.forEach((element) => {
                highlightedIds.push(parseInt(element.id));
            });
            chrome.tabs.remove(highlightedIds, () => {
                this.generateTabs();
            });
        });

        close.addEventListener('drop', (ev) => this.buttonDropHandler(ev));
        close.addEventListener('dragover', (ev) => {
            ev.preventDefault();
            ev.dataTransfer.effectAllowed = 'move'
        });
        close.addEventListener('dragenter', (ev) => {
            ev.target.style.color = 'red';
        });
        close.addEventListener('dragleave', (ev) => {
            ev.target.style.color = 'black';
        });

        newWin.addEventListener('click', (ev) => {
            chrome.windows.create({focused: false}, (ev) => {
                this.generateTabs();
            });
        });
        
    }

    layoutWindows() {
        if(this.allWindows.length > 1) {
            let masterWindows = document.getElementsByClassName('master-window-container')[0];
            masterWindows.style.width = "612px"
            // document.body.style.width = "800px";
            // let winElements = Array.from(document.getElementsByClassName('window-container'));
            requirejs( [
                'scripts/masonry.pkgd.js',
              ], function( Masonry ) { 
                new Masonry( '.master-window-container', {
                columnWidth: 304,
                itemSelector: '.window-container',
                gutter: 4
              });
            });
        }
    }

    addTabElementProperties(tab) {
        tab.className = 'tab';
        tab.draggable = 'true';
        tab.addEventListener('click', () => {
            tab.classList.toggle('highlight', tab.className == 'tab');
            this.createDragImg();
        });

        tab.addEventListener('dblclick', (ev) => {
            chrome.tabs.update(parseInt(tab.id), {active: true}, (ev) => {
                chrome.windows.update(parseInt(tab.parentNode.id), {focused: true}, (ev) => {});
            });
        });
        tab.addEventListener('dragstart', (ev) => this.dragstartHandler(ev));
        tab.addEventListener('dragover', this.dragoverHandler);
        tab.addEventListener('drop', (ev) => this.tabDropHandler(ev));
        tab.addEventListener('dragleave', this.dragleaveHandler);
        tab.addEventListener('dragenter', this.dragenterHandler);
    }

    // creates drag image of highlighted tabs
    createDragImg() {
        this.highlighted = Array.from(document.getElementsByClassName('highlight'));
        this.dragImage = document.createElement('div');
        this.dragImage.className = 'drag-image';
        this.highlighted.forEach((element) => {
            let tempTab = element.cloneNode(true);
            tempTab.classList.remove('highlight');
            this.dragImage.appendChild(tempTab);
        });
        Array.from(document.getElementsByClassName('drag-image')).forEach(e => e.remove());
        document.body.append(this.dragImage);
    }

    dragstartHandler(ev) {
        let data = '';
        if(ev.target.className !== 'tab highlight') {
            data = JSON.stringify([parseInt(ev.target.id)]);
        } else { 
            let tmpData = [];
            this.highlighted.forEach((element) => {
                tmpData.push(parseInt(element.id));
            });
            data = JSON.stringify(tmpData);

            console.log(this.dragImage);
            ev.dataTransfer.setDragImage(this.dragImage, -10, -10);
        }
        ev.dataTransfer.setData('text/plain', data);
        ev.dataTransfer.effectAllowed = 'move';
    } 

    dragoverHandler(ev) {
        ev.preventDefault();
        // console.log('dragover');
        ev.dataTransfer.dropEffect = 'move';
    }

    dragenterHandler(ev) {
        // console.log('dragenter');
        this.classList.add('hovered');
    }

    dragleaveHandler(ev){
        // console.log('dragleave');
        this.classList.remove('hovered');
    }

    tabDropHandler(ev) {
        ev.preventDefault();
        let data = JSON.parse(ev.dataTransfer.getData('text/plain')), //list of ids
            calcIndex = 0,
            targetId = ev.target.id,
            isLastDiv = false;
        // console.log('dropzone');

        // determine if drop location is the last (empty) div 
        if(targetId === '') {
            targetId = parseInt(ev.target.previousSibling.id);
            isLastDiv = true;
        } else {
            targetId = parseInt(targetId);
        }

        chrome.tabs.get(targetId, (dropTab) => {            
            if(isLastDiv) {
                calcIndex = -1;
                chrome.tabs.move(data, {index: calcIndex, windowId:dropTab.windowId}, (tabMove) => {
                    // console.log('tab moved - last div');
                    this.generateTabs();
                });
            } else {
                calcIndex = dropTab.index;
                for(let j = 0; j<data.length; j++) {
                    chrome.tabs.get(data[j], (hlTab) => {
                        if(hlTab.windowId === dropTab.windowId && hlTab.index < dropTab.index) {
                            calcIndex--;
                        } 
                        chrome.tabs.move(data[j], {index: calcIndex, windowId: dropTab.windowId}, (tabMove) => {
                            // console.log('tab moved');
                        });
                        calcIndex++;
                        if(j === data.length-1) {
                            this.generateTabs();
                        }
                    });  
                }
            } 
        });
        ev.dataTransfer.clearData();
    }

    buttonDropHandler(ev) {
        ev.preventDefault();
        let data = JSON.parse(ev.dataTransfer.getData('text/plain'));
        console.log(data);
        chrome.tabs.remove(data, () => {
            this.generateTabs();
            ev.target.style.color = 'black';
        });
        ev.dataTrasnfer.clearData();
    }
}

