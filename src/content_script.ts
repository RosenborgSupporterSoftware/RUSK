import moduleLoader from './ExtensionModules/ExtensionModuleLoader';
import { ExtensionModule } from './ExtensionModules/ExtensionModule';
import { PageContext } from './Context/PageContext';

var modules = moduleLoader("notyet");

// TODO: Sortér moduler basert på deres runBefore og runAfter-properties

var modname = "";
try {
    var context = new PageContext();

    modules.forEach(mod => {
        console.log('ExtMod: ' + mod.name);

        // TODO: Bestem om tom urlsToRunOn-array betyr alle eller ingen
        // TODO: Sjekk om vi er på en side som matcher urlsToRunOn for å bestemme om vi kjører
        modname = mod.name;
        try {
            mod.execute(context);
        } catch (e) {
            chrome.runtime.sendMessage({ module: modname, message: e.message, exception: e });
        }
    });
} catch (e) {
    chrome.runtime.sendMessage({ module: modname, message: e.message, exception: e });
}

// following is not triggered if not on rbkweb (manifest config), so always true
chrome.runtime.sendMessage({ onRBKweb: true });

// I'm sure we're approaching the point where we no longer need the below
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.color) {
        chrome.runtime.sendMessage({ logMessage: 'Receive color = ' + msg.color });
        document.body.style.backgroundColor = msg.color;
        sendResponse('Change color to ' + msg.color);
    } else {
        sendResponse('Color message is none.');
    }
});
