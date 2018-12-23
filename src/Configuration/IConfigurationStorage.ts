/**
 * ConfigurationStorage interface is an abstraction over how to store configuration data for RUSK
 */

export interface IConfigurationStorage {

    /** Gets configuration from storage */
    GetConfiguration(callback: (config: string) => void): void;

    /** Stores configuration to storage */
    StoreConfiguration(config: string): void;

    GetModuleConfiguration(moduleName: Array<string>): Promise<object>;

    StoreModuleConfiguration(moduleName: string, config: object): Promise<boolean>;
}
