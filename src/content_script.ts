import moduleLoader from './ExtensionModules/ExtensionModuleLoader';
import { ExtensionModule } from './ExtensionModules/ExtensionModule';
import { PageContext } from './Context/PageContext';
import { PageTypeClassifier } from './Context/PageTypeClassifier';
import { ChromeSyncStorage } from './Configuration/ChromeSyncStorage';
import { IConfigurationStorage } from './Configuration/IConfigurationStorage';
import { RUSKConfig } from './Configuration/RUSKConfig';
import { ModuleError } from './Errors/ModuleError';
import { ModuleConfiguration } from './Configuration/ModuleConfiguration';

var allModules = moduleLoader("notyet");

let storage = new ChromeSyncStorage() as IConfigurationStorage;

storage.GetConfiguration(config => {
    let ruskConfig: RUSKConfig = null;

    if (config == null) {
        // Lag ny config med default ting
        // ruskConfig = new RUSKConfig();
        // ruskConfig.AddModuleDefaultConfigurations(allModules);

        //storage.StoreConfiguration(ruskConfig.ToJSON());
    } else {
        //ruskConfig = RUSKConfig.FromStoredConfiguration(config, allModules);
    }
    let context = new PageContext();
    let filteredModules = filterModules(allModules, context);

    processPage(filteredModules, context);
    // preprocessModules(filteredModules);
    // executeModules(filteredModules, context);
});

// TODO: Sortér moduler basert på deres runBefore og runAfter-properties

async function processPage(modules: Array<ExtensionModule>, context: PageContext) {
    let modname = "";

    try {
        let modulenames = [];
        for (let i = 0; i < modules.length; i++) {
            modulenames.push(modules[i].name);
        }
        chrome.runtime.sendMessage({ getConfigFor: modulenames }, configs => {

            // Init modules
            for (let i = 0; i < modules.length; i++) {
                modname = modules[i].name;
                for (let j = 0; j < configs.length; j++) {
                    if (configs[j].moduleName == modules[i].name) {
                        try {
                            let realConf = ModuleConfiguration.FromStorageObject(configs[j], modules[i]);
                            modules[i].init(realConf);
                        } catch (e) {
                            chrome.runtime.sendMessage(new ModuleError(modname, "init", e.message, e));
                        }
                        break;
                    }
                }
            }
            // Preprocess modules
            for (let i = 0; i < modules.length; i++) {
                modname = modules[i].name;
                try {
                    modules[i].preprocess(context);
                } catch (e) {
                    chrome.runtime.sendMessage(new ModuleError(modules[i].name, "preprocess", e.message, e));
                }
            }
            // Execute modules
            for (let i = 0; i < modules.length; i++) {
                modname = modules[i].name;

                let starttime = performance.now();
                try {
                    modules[i].execute(context);
                } catch (e) {
                    chrome.runtime.sendMessage(new ModuleError(modname, "execute", e.message, e));
                }
                let endtime = performance.now();
                chrome.runtime.sendMessage({
                    module: modname,
                    executiontime: endtime - starttime,
                    url: document.URL
                });
            }
        });
    } catch (e) {
        chrome.runtime.sendMessage(new ModuleError(modname, "processPage", e.message, e));
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
        if (PageTypeClassifier.ShouldRunOnPage(modules[i], context.PageType)) {
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
