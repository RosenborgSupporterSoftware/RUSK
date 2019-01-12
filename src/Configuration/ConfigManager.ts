import { ModuleConfiguration } from "./ModuleConfiguration";
import loadModules from "../ExtensionModules/ExtensionModuleLoader";
import { ExtensionModule } from "../ExtensionModules/ExtensionModule";

/**
 * A class that manages configuration
 */

export class ConfigManager {

    private static _instance: ConfigManager = null;
    private _moduleConfPrefix = 'RUSK-ModConf-';

    private _moduleConfigs: Map<string, ModuleConfiguration>;
    private _allModules: Array<ExtensionModule> = loadModules("Nada");

    /**
     * Gets the current instance of the ConfigManager object
     */
    public static get Instance(): ConfigManager {
        if (this._instance == null) {
            this._instance = new ConfigManager();
        }
        return this._instance;
    }

    private constructor() {
        // Here to avoid people making their own.
        this.init();
    }

    private init() {
        chrome.storage.sync.get(null, data => { // This gets ALL keys stored in sync storage
            this._moduleConfigs = new Map<string, ModuleConfiguration>();
            for (let i = 0; i < Object.keys(data).length; i++) {
                let key = Object.keys(data)[i];
                if (key.startsWith(this._moduleConfPrefix)) {
                    // Dette er en ModuleConfiguration pojo
                    let modname = key.substr(this._moduleConfPrefix.length);
                    let mod = this.getModule(modname);
                    if (mod == null) continue;  // The config is for a module we do not have. FIXME: Delete
                    let modConf = ModuleConfiguration.FromStorageObject(data[key], mod);
                    this._moduleConfigs.set(key, modConf);
                    if (modConf.IsDirty) {
                        this.SetConfigForModule(mod, modConf);
                    }
                } else {
                    // Annen data. Håndter.
                    console.log('Unhandled config object: ' + key);
                }
            }
        });
    }

    public GetConfigForModule(module: string | ExtensionModule): ModuleConfiguration {
        let modname = (typeof module == "string") ?
            module :
            module.name;
        let storageKey = this._moduleConfPrefix + modname;
        let conf = this._moduleConfigs.get(storageKey);
        if (conf != null) return conf;

        // If we don't have a stored config for module, use the default one.
        let mod = this.getModule(modname);
        if (mod != null) {
            console.log('Getting default configuration for module ' + modname);
            let config = this.SetConfigForModule(mod, null);
            return config;
        }
        console.log('ConfigManager was asked for config for module ' + modname + ' and we failed miserably.');
        return null;
    }

    public SetConfigForModule(module: string | ExtensionModule, config: ModuleConfiguration): ModuleConfiguration {
        let modname = (typeof module == "string") ?
            module :
            module.name;
        let extmod = (typeof module == "string") ?
            this.getModule(module) :
            module;
        let storageKey = this._moduleConfPrefix + modname;

        if (config == null) {
            config = extmod.configSpec();
        } else {
            config = ModuleConfiguration.FromStorageObject(config, extmod);
        }
        this._moduleConfigs.set(storageKey, config);

        chrome.storage.sync.set({ [storageKey]: config.ToStorageObject() }, () => {
            config.SetDirtyState(false);
            console.log('Configuration for ' + modname + ' stored in sync storage under key ' + storageKey);
        });

        return config;
    }

    /**
     * For developer use only. :)
     */
    public GetAllConfigAsJSON(): string {
        let allConfig = {};
        let keys = Array.from(this._moduleConfigs.keys());
        for (let i = 0; i < this._moduleConfigs.size; i++) {
            let key = keys[i];
            allConfig[key] = this._moduleConfigs.get(key);
        }
        let json = JSON.stringify(allConfig);

        return json;
    }

    private getModule(moduleName: string): ExtensionModule {
        for (let i = 0; i < this._allModules.length; i++) {
            if (this._allModules[i].name == moduleName) return this._allModules[i];
        }
        return null;
    }
}
