import { RUSKConfig } from "./RUSKConfig";

/**
 * ConfigurationStorage interface is an abstraction over how to store configuration data for RUSK
 */

export interface IConfigurationStorage {

    /** Gets configuration from storage */
    GetConfiguration(callback: (config: RUSKConfig) => void): void;

    /** Stores configuration to storage */
    StoreConfiguration(config: RUSKConfig): void;
}
