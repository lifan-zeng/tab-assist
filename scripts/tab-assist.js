export default function startup() {
    generateTabs();
    initActionbar();
}

function generateTabs(callback) {
    chrome.windows.getAll({ populate: true }, (windowsList) => {
        displayTabs();
        layoutWindows();
        if (callback) callback();
    });
}

function displayTabs() {
    // console.log('displayTabs')
    let masterWindows = document.getElementsByClassName('master-window-container')[0];

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
                    newTab = document.createElement('input');

                // new tab button
                newTab.className = 'new-tab';
                newTab.type = 'image';
                newTab.src = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjBweCIgeT0iMHB4Igp3aWR0aD0iMjAiIGhlaWdodD0iMjAiCnZpZXdCb3g9IjAgMCAxNzIgMTcyIgpzdHlsZT0iIGZpbGw6IzAwMDAwMDsiPjxnIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0ibm9uemVybyIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIHN0cm9rZS1saW5lY2FwPSJidXR0IiBzdHJva2UtbGluZWpvaW49Im1pdGVyIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS1kYXNoYXJyYXk9IiIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjAiIGZvbnQtZmFtaWx5PSJub25lIiBmb250LXdlaWdodD0ibm9uZSIgZm9udC1zaXplPSJub25lIiB0ZXh0LWFuY2hvcj0ibm9uZSIgc3R5bGU9Im1peC1ibGVuZC1tb2RlOiBub3JtYWwiPjxwYXRoIGQ9Ik0wLDE3MnYtMTcyaDE3MnYxNzJ6IiBmaWxsPSJub25lIj48L3BhdGg+PGcgZmlsbD0iIzAwMDAwMCI+PHBhdGggZD0iTTg2LDE0LjMzMzMzYy0zOS41MTY3NiwwIC03MS42NjY2NywzMi4xNDk5MyAtNzEuNjY2NjcsNzEuNjY2NjdjMCwzOS41MTY3MyAzMi4xNDk5LDcxLjY2NjY3IDcxLjY2NjY3LDcxLjY2NjY3YzM5LjUxNjc2LDAgNzEuNjY2NjcsLTMyLjE0OTkzIDcxLjY2NjY3LC03MS42NjY2N2MwLC0zOS41MTY3MyAtMzIuMTQ5OSwtNzEuNjY2NjcgLTcxLjY2NjY3LC03MS42NjY2N3pNODYsMjUuMDgzMzNjMzMuNzA3MDQsMCA2MC45MTY2NywyNy4yMDk2NSA2MC45MTY2Nyw2MC45MTY2N2MwLDMzLjcwNzAyIC0yNy4yMDk2Myw2MC45MTY2NyAtNjAuOTE2NjcsNjAuOTE2NjdjLTMzLjcwNzA0LDAgLTYwLjkxNjY3LC0yNy4yMDk2NSAtNjAuOTE2NjcsLTYwLjkxNjY3YzAsLTMzLjcwNzAyIDI3LjIwOTYzLC02MC45MTY2NyA2MC45MTY2NywtNjAuOTE2Njd6TTg1LjkxNjAxLDUwLjA4OTY4Yy0yLjk2NTc4LDAuMDQ2MzMgLTUuMzMzNTYsMi40ODYxNCAtNS4yOTEwMSw1LjQ1MTk4djI1LjA4MzMzaC0yNS4wODMzM2MtMS45Mzg0MiwtMC4wMjc0MSAtMy43NDE0NCwwLjk5MTAyIC00LjcxODY1LDIuNjY1MzJjLTAuOTc3MjEsMS42NzQzIC0wLjk3NzIxLDMuNzQ1MDcgMCw1LjQxOTM3YzAuOTc3MjEsMS42NzQzIDIuNzgwMjMsMi42OTI3MyA0LjcxODY1LDIuNjY1MzJoMjUuMDgzMzN2MjUuMDgzMzNjLTAuMDI3NDEsMS45Mzg0MiAwLjk5MTAyLDMuNzQxNDQgMi42NjUzMiw0LjcxODY1YzEuNjc0MywwLjk3NzIxIDMuNzQ1MDcsMC45NzcyMSA1LjQxOTM3LDBjMS42NzQzLC0wLjk3NzIxIDIuNjkyNzMsLTIuNzgwMjMgMi42NjUzMiwtNC43MTg2NXYtMjUuMDgzMzNoMjUuMDgzMzNjMS45Mzg0MiwwLjAyNzQxIDMuNzQxNDQsLTAuOTkxMDIgNC43MTg2NSwtMi42NjUzMmMwLjk3NzIxLC0xLjY3NDMgMC45NzcyMSwtMy43NDUwNyAwLC01LjQxOTM3Yy0wLjk3NzIxLC0xLjY3NDMgLTIuNzgwMjMsLTIuNjkyNzMgLTQuNzE4NjUsLTIuNjY1MzJoLTI1LjA4MzMzdi0yNS4wODMzM2MwLjAyMDg1LC0xLjQ1MzQ3IC0wLjU0NzgyLC0yLjg1MzQyIC0xLjU3NjM1LC0zLjg4MDYyYy0xLjAyODUyLC0xLjAyNzIgLTIuNDI5MiwtMS41OTQwOCAtMy44ODI2NCwtMS41NzEzNnoiPjwvcGF0aD48L2c+PC9nPjwvc3ZnPg==`;
                newTab.width = '20'
                newTab.height = '20'
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
        newWin = document.getElementById('abNewWin'),
        actionbar = document.getElementsByClassName('actionbar');

    let isScrollBottom = document.scrollHeight - document.clientHeight <= document.scrollTop + 1;
    console.log(isScrollBottom)
    if (isScrollBottom) {
        actionbar.classList.add('actionbar-no-shadow');
    } else {
        actionbar.className = ('actionbar-no-shadow');
    }

    close.addEventListener('click', (ev) => {
        let highlighted = Array.from(document.getElementsByClassName('highlight'));
        let highlightedIds = [];
        highlighted.forEach((element) => {
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

