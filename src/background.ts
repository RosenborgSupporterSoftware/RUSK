
function polling() {
    console.log('polling');
    setTimeout(polling, 1000 * 30);
}

polling();

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.onRBKweb) {
        chrome.pageAction.show(sender.tab.id);
        chrome.pageAction.setPopup({
            tabId: sender.tab.id,
            popup: "popup.html"
        });

    }
});

chrome.tabs.onUpdated.addListener(function(tabId, info, tab) {
    if (info.status === "loading") {
        chrome.pageAction.hide(tabId);
        chrome.pageAction.setPopup({
            tabId: tabId, 
            popup: ""
        });
    }
});
