import moduleLoader from './ExtensionModules/ExtensionModuleLoader';
import { ExtensionModule } from './ExtensionModules/ExtensionModule';

var modules = moduleLoader("notyet");

// TODO: Sortér moduler basert på deres runBefore og runAfter-properties

modules.forEach(mod => {
    console.log('ExtMod: ' + mod.name);

    // TODO: Bestem om tom urlsToRunOn-array betyr alle eller ingen
    // TODO: Sjekk om vi er på en side som matcher urlsToRunOn for å bestemme om vi kjører
    mod.execute();
})

// following is not triggered if not on rbkweb (manifest config), so always true
chrome.runtime.sendMessage({ onRBKweb: true });

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    if (msg.color) {
        console.log('Receive color = ' + msg.color);
        document.body.style.backgroundColor = msg.color;
        sendResponse('Change color to ' + msg.color);
    } else {
        sendResponse('Color message is none.');
    }
});
