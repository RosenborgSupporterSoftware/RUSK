import { IConfigurationStorage } from "./IConfigurationStorage";
import { RUSKConfig } from "./RUSKConfig";
import { ModuleConfiguration } from "./ModuleConfiguration";

/**
 * ChromeSyncStorage - IConfigurationStorage implementation that uses Chrome sync storage
 */

export class ChromeSyncStorage implements IConfigurationStorage {

    private moduleConfigKey: string = 'RUSKModuleConfiguration';

    GetConfiguration(callback: (config: RUSKConfig) => void): void {
        chrome.storage.sync.get('RUSKModuleConfiguration', storedConfig => {

            callback(storedConfig['RUSKModuleConfiguration']);
        });

        return null;
    }

    StoreConfiguration(config: RUSKConfig): void {
        chrome.storage.sync.set({"RUSKModuleConfiguration": config});
    }

 }