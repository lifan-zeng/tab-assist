export default function startup() {
    generateTabs();
    initActionbar();
}

function generateTabs(callback) {
    // this.allWindows = []
    chrome.windows.getAll({ populate: true }, (windowsList) => {
        // this.pushTabs(windowsList);
        displayTabs();
        layoutWindows();
        if (callback) callback();
    });
}

function displayTabs() {
    // console.log('displayTabs')
    let body = document.getElementsByTagName('body')[0],
        masterWindows = document.getElementsByClassName('master-window-container')[0];

    // clear window containers
    while (masterWindows.firstChild) {
        masterWindows.removeChild(masterWindows.firstChild);
    }
    chrome.windows.getAll({ populate: true }, (windowList) => {
        for (let i = 0; i < windowList.length; i++) {
            let tabs = windowList[i].tabs;
            if (tabs.length > 0) {
                let newWindow = document.createElement('div');
                newWindow.className = 'window-container';
                newWindow.id = windowList[i].id;

                // create window heading
                let heading = document.createElement('div'),
                    newTab = document.createElement('button');

                // new tab button
                newTab.className = 'new-tab';
                newTab.innerHTML = '+';
                newTab.title = 'New Tab';
                newWindow.appendChild(newTab);
                newTab.addEventListener('click', (ev) => {
                    chrome.tabs.create({ windowId: windowList[i].id, active: false }, (tab) => {
                        generateTabs();
                    });
                });

                heading.className = 'window-heading';
                heading.innerHTML = 'Window ' + (i + 1);
                newWindow.insertBefore(heading, newWindow.firstChild);
                masterWindows.appendChild(newWindow, masterWindows.firstChild);

                // create tabs HTML
                for (let j = 0; j < tabs.length; j++) {
                    let tabElement = document.createElement('div'),
                        tabTitle = document.createElement('div'),
                        tabIcon = document.createElement('div');
                    let tab = tabs[j];

                    tabTitle.innerText = tab.title;
                    tabTitle.className = 'tab-title';
                    tabIcon.style.backgroundImage = 'url(' + tab.favIconUrl + ')';
                    tabIcon.className = 'tab-favicon';
                    addTabElementProperties(tabElement);
                    tabElement.appendChild(tabIcon);
                    tabElement.appendChild(tabTitle);
                    tabElement.id = tab.id;
                    // tabElement.title = tab.title;
                    newWindow.appendChild(tabElement);
                }
                let emptyElement = document.createElement('div');
                emptyElement.className = 'blank-tab';
                emptyElement.addEventListener('dragover', dragoverHandler);
                emptyElement.addEventListener('drop', (ev) => tabDropHandler(ev));
                emptyElement.addEventListener('dragleave', dragleaveHandler);
                emptyElement.addEventListener('dragenter', dragenterHandler);
                emptyElement.style.height = '12px'
                emptyElement.style.cursor = 'default';
                newWindow.appendChild(emptyElement);
            }
        }
    });
}

function initActionbar() {
    let close = document.getElementById('abClose'),
        newWin = document.getElementById('abNewWin');

    close.addEventListener('click', (ev) => {
        this.highlighted = Array.from(document.getElementsByClassName('highlight'));
        let highlightedIds = [];
        this.highlighted.forEach((element) => {
            highlightedIds.push(parseInt(element.id));
        });
        chrome.tabs.remove(highlightedIds, () => {
            generateTabs();
        });
    });

    close.addEventListener('drop', (ev) => buttonDropHandler(ev));
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
        chrome.windows.create({ focused: false }, (ev) => {
            generateTabs();
        });
    });

}

function layoutWindows() {
    chrome.windows.getAll((windowList) => {
        if (windowList.length > 1) {
            let masterWindows = document.getElementsByClassName('master-window-container')[0];
            masterWindows.style.width = "612px"
            // document.body.style.width = "800px";
            // let winElements = Array.from(document.getElementsByClassName('window-container'));
            requirejs([
                'scripts/masonry.pkgd.js',
            ], function (Masonry) {
                new Masonry('.master-window-container', {
                    columnWidth: 304,
                    itemSelector: '.window-container',
                    gutter: 4
                });
            });
        }
    });
}

function addTabElementProperties(tab) {
    tab.className = 'tab';
    tab.draggable = 'true';
    tab.addEventListener('click', () => {
        tab.classList.toggle('highlight', tab.className == 'tab');
        createDragImg();
    });

    tab.addEventListener('dblclick', (ev) => {
        chrome.tabs.update(parseInt(tab.id), { active: true }, (ev) => {
            chrome.windows.update(parseInt(tab.parentNode.id), { focused: true }, (ev) => { });
        });
    });
    tab.addEventListener('dragstart', (ev) => dragstartHandler(ev));
    tab.addEventListener('dragover', dragoverHandler);
    tab.addEventListener('drop', (ev) => tabDropHandler(ev));
    tab.addEventListener('dragleave', dragleaveHandler);
    tab.addEventListener('dragenter', dragenterHandler);
}

// creates drag image of highlighted tabs
function createDragImg() {
    let highlighted = Array.from(document.getElementsByClassName('highlight'));
    let dragImage = document.createElement('div');
    dragImage.className = 'drag-image';
    highlighted.forEach((element) => {
        let tempTab = element.cloneNode(true);
        tempTab.classList.remove('highlight');
        dragImage.appendChild(tempTab);
    });
    Array.from(document.getElementsByClassName('drag-image')).forEach(e => e.remove());
    document.body.append(dragImage);
}

function dragstartHandler(ev) {
    let data = '';
    if (ev.target.className !== 'tab highlight') {
        data = JSON.stringify([parseInt(ev.target.id)]);
    } else {
        let tmpData = [];
        Array.from(document.getElementsByClassName('highlight')).forEach((element) => {
            tmpData.push(parseInt(element.id));
        });
        data = JSON.stringify(tmpData);

        // console.log(this.dragImage);
        ev.dataTransfer.setDragImage(document.getElementsByClassName('drag-image')[0], -10, -10);
    }
    ev.dataTransfer.setData('text/plain', data);
    ev.dataTransfer.effectAllowed = 'move';
}

function dragoverHandler(ev) {
    ev.preventDefault();
    // console.log('dragover');
    ev.dataTransfer.dropEffect = 'move';
}

function dragenterHandler(ev) {
    // console.log('dragenter');
    this.classList.add('hovered');
}

function dragleaveHandler(ev) {
    // console.log('dragleave');
    this.classList.remove('hovered');
}

function tabDropHandler(ev) {
    ev.preventDefault();
    let data = JSON.parse(ev.dataTransfer.getData('text/plain')), //list of ids
        calcIndex = 0,
        targetId = ev.target.id,
        isLastDiv = false;
    // console.log('dropzone');

    // determine if drop location is the last (empty) div 
    if (targetId === '') {
        targetId = parseInt(ev.target.previousSibling.id);
        isLastDiv = true;
    } else {
        targetId = parseInt(targetId);
    }

    chrome.tabs.get(targetId, (dropTab) => {
        if (isLastDiv) {
            calcIndex = -1;
            chrome.tabs.move(data, { index: calcIndex, windowId: dropTab.windowId }, (tabMove) => {
                // console.log('tab moved - last div');
                generateTabs();
            });
        } else {
            calcIndex = dropTab.index;
            for (let j = 0; j < data.length; j++) {
                chrome.tabs.get(data[j], (hlTab) => {
                    if (hlTab.windowId === dropTab.windowId && hlTab.index < dropTab.index) {
                        calcIndex--;
                    }
                    chrome.tabs.move(data[j], { index: calcIndex, windowId: dropTab.windowId }, (tabMove) => {
                        // console.log('tab moved');
                    });
                    calcIndex++;
                    if (j === data.length - 1) {
                        generateTabs();
                    }
                });
            }
        }
    });
    ev.dataTransfer.clearData();
}

function buttonDropHandler(ev) {
    ev.preventDefault();
    let data = JSON.parse(ev.dataTransfer.getData('text/plain'));
    console.log(data);
    chrome.tabs.remove(data, () => {
        generateTabs();
        ev.target.style.color = 'black';
    });
    ev.dataTrasnfer.clearData();
}

