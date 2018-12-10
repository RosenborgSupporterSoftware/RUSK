import { ConfigUpdatedMessage } from "./Messages/ConfigUpdatedMessage";
import { ChromeSyncStorage } from "./Configuration/ChromeSyncStorage";
import { IConfigurationStorage } from "./Configuration/IConfigurationStorage";
import { ConfigManager } from "./Configuration/ConfigManager";

let configStorage = new ChromeSyncStorage() as IConfigurationStorage;

let configManager = ConfigManager.Instance;

//function polling() {
//    console.log('polling');
//    setTimeout(polling, 1000 * 30);
//}
//
//polling();

// debug logging
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.logMessage) {
        console.log(request.logMessage);
        return;
    }
});

// exception debugging/logging
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.exception) {
        console.log("from " + request.module + " (tab[" + sender.tab.id + "@" + sender.tab.index + "]): " +
                    request.message);
        (console.error || console.log).call(console, request.exception.stack || request.exception);
        return;
    }
});

// Config management
chrome.runtime.onMessage.addListener(async (req, sender, reply) => {
    if (req.getConfigFor) {
        if (typeof req.getConfigFor == "string") {
            let cfg = ConfigManager.Instance.GetConfigForModule(req.getConfigFor);
            reply([cfg]);
        }
        if (Array.isArray(req.getConfigFor)) {
            // Do array things
            let cfgs = [];
            for (let i = 0; i < req.getConfigFor.length; i++) {
                cfgs.push(ConfigManager.Instance.GetConfigForModule(req.getConfigFor[i]));
            }
            reply(cfgs);
        }
    }
    if (req.storeConfigFor) {
        ConfigManager.Instance.SetConfigForModule(req.storeConfigFor, req.config);
    }
});

// CSS insertion

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.css) {
        chrome.tabs.insertCSS(sender.tab.id, {
            code: request.css,
            cssOrigin: "user"
        }, () => {
            console.log('Inserted CSS');
        }); // Y U NO?!
    }
});

// rbkweb toolbar icon toggling
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.onRBKweb) {
        chrome.pageAction.show(sender.tab.id);
        chrome.pageAction.setPopup({
            tabId: sender.tab.id,
            popup: "popup.html"
        });
        return;
    }
});

// rbkweb toolbar icon toggling
chrome.tabs.onUpdated.addListener(function(tabId, info, tab) {
    if (info.status === "loading") {
        chrome.pageAction.hide(tabId);
        chrome.pageAction.setPopup({
            tabId: tabId,
            popup: ""
        });
    }
});

// performance data for ExtensionModules

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.module && request.executiontime && request.url) {
        let performanceHistory = JSON.parse(localStorage.getItem('RBKweb-Survival-Kit-PerformanceHistory')) || [];

        performanceHistory.push(request);
        localStorage.setItem('RBKweb-Survival-Kit-PerformanceHistory', JSON.stringify(performanceHistory));
    }
});

// Configuration update

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (!message.configUpdatedMessage)
        return;
    let msg = message.configUpdatedMessage as string;
    if (msg == null) return;

    configStorage.StoreConfiguration(msg);
    chrome.runtime.sendMessage({ logMessage: 'Stored configuration to sync storage' });
});
