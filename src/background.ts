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
        if (!request.logLevel)
        {
            console.log(request.logMessage);
        } else {
            switch (request.logLevel) {
                case "EL_DEBUG":
                    console.log(request.logMessage);
                    break;
                case "EL_WARNING":
                    console.warn(request.logMessage);
                    break;
                case "EL_ERROR":
                    console.error(request.logMessage);
                    break;
            }
        }
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

var module_css = {};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.init_css) {
        Object.keys(module_css).forEach(function(key: string, ix, keys) {
            chrome.tabs.insertCSS(sender.tab.id, { code: module_css[key], cssOrigin: "user" }, () => {
                // console.log('Initialized CSS for ' + key);
            })
        })
        return;
    }
    if (request.css) {
        if (request.from) {
            if (module_css[request.from] && module_css[request.from] == request.css) {
                //console.log('Already injected CSS from ' + request.from);
                return;
            }
            module_css[request.from] = request.css;
        }
        chrome.tabs.insertCSS(sender.tab.id, {
            code: request.css,
            cssOrigin: "user"
        }, () => {
            if (request.from)
                console.log('Inserted dynamic CSS from ' + request.from);
            else
                console.log('Inserted dynamic CSS');
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
