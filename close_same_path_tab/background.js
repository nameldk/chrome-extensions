function processTab(tab) {
    let url = tab.pendingUrl;
    if (!url.startsWith('http')) {
        return;
    }
    let urlObj = new URL(url);
    let urlSearch = urlObj.origin + urlObj.pathname + '*';
    let queryOptions = {
        url: urlSearch,
        active: false,
    };

    setTimeout(() => {
        chrome.tabs
            .query(queryOptions)
            .then((tabs) => {
                // console.log('query', tabs)
                if (!tabs.length) {
                    return;
                }
                let ids = tabs.map((v) => {
                    return v.id;
                });
                chrome.tabs.remove(ids);
            })
            .catch((error) => {
                console.error(error);
            });
    }, 100);
}

function setOpen() {
    chrome.storage.local.set({
        opend: 1,
    });
    chrome.tabs.onCreated.addListener(processTab);
}

function setClose() {
    chrome.storage.local.set({
        opend: 0,
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

function syncStat(reverse, forseOpen) {
    chrome.storage.local.get('opend', (res) => {
        // console.log(res);
        let open = reverse ? !res.opend : res.opend;
        if (forseOpen) {
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
