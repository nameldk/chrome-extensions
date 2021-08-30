let isBindEvent = false;
let isOpen = false;
let isDebug = false;

let log = isDebug ? console.log : () => {
};

function processTab(targetTab) {
    if (!isOpen) {
        log('not open');
        return;
    }
    let url = targetTab.pendingUrl || targetTab.url;
    log('targetTab:', targetTab);
    if (!url || !url.startsWith("http")) {
        return true;
    }
    let urlObj = new URL(url);
    let urlSearch = urlObj.origin + urlObj.pathname + "*";
    let queryOptions = {
        url: urlSearch
    };

    // https://developer.chrome.com/docs/extensions/reference/tabs/
    chrome.tabs
        .query(queryOptions, function (tabs) {
            log('tabs:', tabs);
            if (!tabs.length) {
                return true;
            }
            let updated = false;
            let removeId = 0;
            tabs.forEach(v => {
                if (v.id !== targetTab.id && v.id !== targetTab.openerTabId) {
                    if (!updated) {
                        updated = true;
                        log('update:', v);
                        let updateKv = {
                            active: true
                        };
                        if (v.url !== url) {
                            updateKv.url = url;
                        }
                        chrome.tabs.update(v.id, updateKv);
                        removeId = targetTab.id;
                    } else {
                        removeId = v.id;
                    }
                    log('remove:', removeId);
                    chrome.tabs.remove(removeId);
                }
            });
        });
    return true;
}

function bindEvent() {
    if (!isBindEvent) {
        chrome.tabs.onCreated.addListener(processTab);
        isBindEvent = true;
        log('bind Event');
    }
}

function setOpen() {
    chrome.storage.local.set({
        opened: 1,
    });
    isOpen = true;
    log('set open');
    bindEvent();
}

function setClose() {
    chrome.storage.local.set({
        opened: 0,
    });
    isOpen = false;
    log('set close');
}

function setBadgeText(txt) {
    chrome.browserAction.setBadgeText({
        text: txt,
    });
}

function setTitle(txt) {
    chrome.browserAction.setTitle({
        title: txt,
    });
}

function syncStat(reverse, forceOpen) {
    chrome.storage.local.get('opened', (res) => {
        log('get-opened', res);
        let open = reverse ? !res.opened : res.opened;
        if (forceOpen) {
            open = 1;
        }
        if (open) {
            setOpen();
            setBadgeText('');
            setTitle('On');
        } else {
            setClose();
            setBadgeText('Off');
            setTitle('Off');
        }
    });
}

function onInstalled(e) {
    log('onInstalled', e);
    syncStat(0, 1);
}

function onStartup(e) {
    log('onStartup', e);
    syncStat();
}

function onClicked(e) {
    log('onClicked', e);
    syncStat(1);
}

function onSuspend() {
    setTitle("...");
    setBadgeText("...");
}

chrome.runtime.onInstalled.addListener(onInstalled);

chrome.runtime.onStartup.addListener(onStartup);

chrome.browserAction.onClicked.addListener(onClicked);

chrome.runtime.onSuspend.addListener(onSuspend);
