import moduleLoader from './ExtensionModules/ExtensionModuleLoader';
import { ExtensionModule } from './ExtensionModules/ExtensionModule';
import { PageContext } from './Context/PageContext';
import { PageTypeClassifier } from './Context/PageTypeClassifier';
import { ChromeSyncStorage } from './Configuration/ChromeSyncStorage';
import { IConfigurationStorage } from './Configuration/IConfigurationStorage';
import { RUSKConfig } from './Configuration/RUSKConfig';
import { ModuleError } from './Errors/ModuleError';

var allModules = moduleLoader("notyet");

let storage = new ChromeSyncStorage() as IConfigurationStorage;

storage.GetConfiguration(config => {
    if (config == null) {
        // Lag ny config med default ting
        let ruskConfig = new RUSKConfig();
        ruskConfig.AddModuleConfigurations(allModules);

        storage.StoreConfiguration(ruskConfig);
        config = ruskConfig;
    } else {
        config = RUSKConfig.FromStoredConfiguration(config);
    }
    let context = new PageContext();
    let filteredModules = filterModules(allModules, context);

    initModules(filteredModules, config);
    preprocessModules(filteredModules);
    executeModules(filteredModules, context);
});

// TODO: Sortér moduler basert på deres runBefore og runAfter-properties

/**
 * Run the init step on the given modules
 * @param modules - The modules to initialize
 * @param config - The RUSKConfig to use for initializing the modules
 */
function initModules(modules: Array<ExtensionModule>, config: RUSKConfig) {

    let modname = "";
    try {
        modules.forEach(mod => {
            modname = mod.name;
            mod.init(config.GetModuleConfiguration(modname));
        });
    } catch (e) {
        chrome.runtime.sendMessage(new ModuleError(modname, "init", e.message, e));
    }
}

/**
 * Run the preprocess step on the given modules
 * @param modules - The modules to run preprocess() on
 */
function preprocessModules(modules: Array<ExtensionModule>) {

    let modname = "";
    try {
        modules.forEach(mod => {
            modname = mod.name;
            mod.preprocess();
        });
    } catch (e) {
        chrome.runtime.sendMessage(new ModuleError(modname, "preprocess", e.message, e));
    }
}

/**
 * Run the execute step on the given modules
 * @param modules - The modules to run execute() on
 * @param context - The PageContext to run the modules with
 */
function executeModules(modules: Array<ExtensionModule>, context: PageContext) {

    var modname = "";
    try {

        modules.forEach(mod => {
            console.log('ExtMod: ' + mod.name);

            modname = mod.name;
            let starttime = performance.now();
            try {
                mod.execute(context);
            } catch (e) {
                //chrome.runtime.sendMessage({ module: modname, message: e.message, exception: e });
                chrome.runtime.sendMessage(new ModuleError(modname, "execute", e.message, e));
            }
            let endtime = performance.now();
            chrome.runtime.sendMessage({
                module: modname,
                executiontime: endtime - starttime,
                url: document.URL
            });
        });
    } catch (e) {
        chrome.runtime.sendMessage({ module: modname, message: e.message, exception: e });
    }
}

/**
 * Filters a list of modules, returning only those that should run in the current PageContext
 * @param modules - The list of modules to filter
 * @param context - The PageContext object to use as the basis for the filtering
 */
function filterModules(modules: Array<ExtensionModule>, context: PageContext): Array<ExtensionModule> {
    let filteredModules = new Array<ExtensionModule>();
    for (let i = 0; i < modules.length; i++) {
        if (PageTypeClassifier.ShouldRunOnPage(modules[i], context.pageType)) {
            filteredModules.push(modules[i]);
        }
    }
    return filteredModules;
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
