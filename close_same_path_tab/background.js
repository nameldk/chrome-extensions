function processTab(targetTab) {
    let url = targetTab.pendingUrl || targetTab.url;
    if (!url || !url.startsWith("http")) {
        return;
    }
    let urlObj = new URL(url);
    let urlSearch = urlObj.origin + urlObj.pathname + "*";
    let queryOptions = {
        url: urlSearch
    };

    // https://developer.chrome.com/docs/extensions/reference/tabs/
    setTimeout(() => {
        chrome.tabs
            .query(queryOptions)
            .then((tabs) => {
                if (!tabs.length) {
                    return;
                }
                let ids = [];
                tabs.forEach(v => {
                    if (v.id !== targetTab.id && v.id !== targetTab.openerTabId) {
                        ids.push(v.id);
                    }
                });
                if (ids.length) {
                    chrome.tabs.remove(ids);
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }, 100);
}

function setOpen() {
    chrome.storage.local.set({
        opened: 1,
    });
    chrome.tabs.onCreated.addListener(processTab);
}

function setClose() {
    chrome.storage.local.set({
        opened: 0,
    });
    chrome.tabs.onCreated.removeListener(processTab);
}

function setBadgeText(txt) {
    chrome.action.setBadgeText({
        text: txt,
    });
}

function setTitle(txt) {
    chrome.action.setTitle({
        title: txt,
    });
}

function syncStat(reverse, forceOpen) {
    chrome.storage.local.get('opened', (res) => {
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

function init() {
    syncStat(0, 1);
    chrome.action.onClicked.addListener(() => {
        syncStat(1);
    });
}

chrome.runtime.onInstalled.addListener(() => {
    init(1);
});

init();
