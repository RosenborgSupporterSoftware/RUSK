import { IConfigurationStorage } from "./IConfigurationStorage";
import { ModuleConfiguration } from "./ModuleConfiguration";

/**
 * ChromeSyncStorage - IConfigurationStorage implementation that uses Chrome sync storage
 */

export class ChromeSyncStorage implements IConfigurationStorage {
    private getModPrefix(moduleName: string) {
        return "RUSK-ModConf-" + moduleName;
    }

    StoreModuleConfiguration(moduleName: string, config: object): Promise<boolean> {
        return null;
        // debugger;
        // let key = this.getModPrefix(moduleName);

        // return new Promise((resolve, reject) => {
        //     chrome.storage.sync.set({ [key]: config }, () => {
        //         resolve(true);
        //     });
        // });
    }

    GetModuleConfiguration(moduleNames: Array<string>): Promise<object> {
        return null;
        // debugger;
        // let keys = new Array<string>(moduleNames.length);
        // for (let i = 0; i < moduleNames.length; i++) {
        //     keys.push(this.getModPrefix(moduleNames[i]));
        // }

        // return new Promise((resolve, reject) => {
        //     chrome.storage.sync.get(keys, data => {
        //         resolve(data);
        //     });
        // });
    }

    private moduleConfigKey: string = 'RUSKModuleConfiguration';

    GetConfiguration(callback: (config: string) => void): void {
        chrome.storage.sync.get('RUSKModuleConfiguration', storedConfig => {

            callback(storedConfig['RUSKModuleConfiguration']);
        });

        return null;
    }

    StoreConfiguration(config: string): void {
        chrome.storage.sync.set({"RUSKModuleConfiguration": config});
    }
 }