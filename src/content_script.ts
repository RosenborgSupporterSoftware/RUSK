import moduleLoader from './ExtensionModules/ExtensionModuleLoader';
import { ExtensionModule } from './ExtensionModules/ExtensionModule';
import { PageContext } from './Context/PageContext';
import { PageTypeClassifier } from './Context/PageTypeClassifier';
import { ChromeSyncStorage } from './Configuration/ChromeSyncStorage';
import { IConfigurationStorage } from './Configuration/IConfigurationStorage';
import { ModuleError } from './Errors/ModuleError';
import { ModuleConfiguration } from './Configuration/ModuleConfiguration';
import { HotkeyManager } from './Utility/HotkeyManager';
import { RUSKUI } from './UI/RUSKUI';
import { HotkeyAction } from './Utility/HotkeyAction';
import { CssBuilder } from './UI/CssBuilder';

var state = {
    configured: false,
    pageReady: false
};

document.addEventListener('readystatechange', function(ev) {
    if ((document.readyState === 'interactive' || document.readyState === 'complete') && !state.pageReady) {
         state.pageReady = true;
         stateChanged(state);
     }
}, true);

let storage = new ChromeSyncStorage() as IConfigurationStorage;
let context = new PageContext();
let modules = filterModules(moduleLoader("notyet"), context);

HotkeyManager.Instance.SetPageType(context.PageType);
HotkeyManager.Instance.SetModules(modules);

chrome.runtime.sendMessage({ init_css: modules.map(module => module.name) });

storage.GetConfiguration(config => {
    if (config == null) {
        // Lag ny config med default ting
        // ruskConfig = new RUSKConfig();
        // ruskConfig.AddModuleDefaultConfigurations(allModules);
        //storage.StoreConfiguration(ruskConfig.ToJSON());
    } else {
        //ruskConfig = RUSKConfig.FromStoredConfiguration(config, allModules);
    }
    initPage(modules, context);
});

function stateChanged(state: any): void {
    if (!state.configured || !state.pageReady) return;
    processPage(modules, context);
}

function initPage(modules: Array<ExtensionModule>, context: PageContext): void {
    // Init modules
    let modulenames = modules.map(module => module.name);
    let uimods = new Array<RUSKUI>();
    chrome.runtime.sendMessage({ getConfigFor: modulenames }, configs => {
        for (let i = 0; i < modules.length; i++) {
            for (let j = 0; j < configs.length; j++) {
                if (configs[j].moduleName == modules[i].name) {
                    try {
                        let realConf = ModuleConfiguration.FromStorageObject(configs[j], modules[i]);
                        if (realConf.moduleEnabled) {

                            let ui = modules[i].init(realConf);
                            if (ui != null) {
                                uimods.push(ui);
                            }
                        }
                    } catch (e) {
                        chrome.runtime.sendMessage(new ModuleError(modules[i].name, "init", e.message, e));
                    }
                    break;
                }
            }
        }
        state.configured = true;
        stateChanged(state);
        installUIMods(uimods);
    });
}

function processPage(modules: Array<ExtensionModule>, context: PageContext): void {
    // TODO: Sortér moduler basert på deres runBefore og runAfter-properties
    let modname = "";
    // let modulenames = modules.map(module => module.name);
    try {
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
            //chrome.runtime.sendMessage({
            //    module: modname,
            //    executiontime: endtime - starttime,
            //    url: document.URL
            //});
        }
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
                chrome.runtime.sendMessage(new ModuleError(modname, "execute", e.message, e));
            }
            let endtime = performance.now();
            //chrome.runtime.sendMessage({
            //    module: modname,
            //    executiontime: endtime - starttime,
            //    url: document.URL
            //});
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
        if (PageTypeClassifier.ShouldRunOnPage(modules[i].pageTypesToRunOn, context.PageType)) {
            filteredModules.push(modules[i]);
        }
    }
    return filteredModules;
}

function installUIMods(uimods: Array<RUSKUI>): void {
    let allHotkeys = new Array<HotkeyAction>();
    uimods.forEach(mod => {
        mod.Hotkeys.forEach(hk => allHotkeys.push(hk));
    });
    HotkeyManager.Instance.AddHotkeys(allHotkeys);

    new CssBuilder().BuildCSS(uimods, css => {
        chrome.runtime.sendMessage({ css: css, from: 'CssBuilder' });
    });
}

// following is not triggered if not on rbkweb (manifest config), so always true
// used to control the grey vs sharp switch on the toolbar icon
chrome.runtime.sendMessage({ onRBKweb: true });