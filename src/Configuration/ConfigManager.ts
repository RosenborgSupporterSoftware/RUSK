import { IConfigurationStorage } from "./IConfigurationStorage";
import { ChromeSyncStorage } from "./ChromeSyncStorage";
import { ModuleConfiguration } from "./ModuleConfiguration";
import loadModules from "../ExtensionModules/ExtensionModuleLoader";
import { ExtensionModule } from "../ExtensionModules/ExtensionModule";

/**
 * A class that manages configuration
 */

export class ConfigManager {

    private static _instance: ConfigManager = null;
    private _moduleConfPrefix = 'RUSK-ModConf-';

    private _storage: IConfigurationStorage = new ChromeSyncStorage();
    //private _moduleConfigs: Array<[string, ModuleConfiguration]>; // Tuple of moduleName: Config
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
            //this._moduleConfigs = new Array<[string, ModuleConfiguration]>();
            this._moduleConfigs = new Map<string, ModuleConfiguration>();
            for (let i = 0; i < Object.keys(data).length; i++) {
                let key = Object.keys(data)[i];
                if (key.startsWith(this._moduleConfPrefix)) {
                    // Dette er en ModuleConfiguration pojo
                    let modname = key.substr(this._moduleConfPrefix.length);
                    let mod = this.getModule(modname);
                    if (mod == null) continue;  // The config is for a module we do not have.
                    // this._moduleConfigs.push([key, ModuleConfiguration.FromStorageObject(data[key], mod)]);
                    this._moduleConfigs.set(key, ModuleConfiguration.FromStorageObject(data[key], mod));
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
        // for (let i = 0; i < this._moduleConfigs.size; i++) {
        //     if (this._moduleConfigs.keys[i] == storageKey)
        //         return this._moduleConfigs[i][1];
        // }
        let mod = this.getModule(modname);
        if (mod != null) {
            console.log('Getting default configuration for module ' + modname);
            let config = mod.configSpec();
            this.SetConfigForModule(mod, config);
            return config;
        }
        console.log('ConfigManager was asked for config for module ' + modname + ' and we failed miserably.');
        return null;
    }

    public SetConfigForModule(module: string | ExtensionModule, config: ModuleConfiguration) {
        let modname = (typeof module == "string") ?
            module :
            module.name;
        let storageKey = this._moduleConfPrefix + modname;
        let modConf = ModuleConfiguration.FromStorageObject(config, this.getModule(modname));
        this._moduleConfigs.set(storageKey, modConf);

        chrome.storage.sync.set({ [storageKey]: modConf.ToStorageObject() }, () => {
            console.log('Configuration for ' + modname + ' stored in sync storage under key ' + storageKey);
        });
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