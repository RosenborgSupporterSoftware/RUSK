import { ModuleConfiguration } from "./ModuleConfiguration";
import { ConfigSetting, ConfigurationSetting } from "./ConfigurationSetting";
import { ExtensionModule } from "../ExtensionModules/ExtensionModule";
import { ConfigUpdatedMessage } from "../Messages/ConfigUpdatedMessage";

/**
 * RUSKConfig represents a complete configuration for the RUSK Chrome extension.
 * This includes configuration for all extension modules.
 */

export class RUSKConfig {

    private isDirty: boolean;
    private moduleSettings: Array<ModuleConfiguration> = new Array<ModuleConfiguration>();
    private sharedSettings: Array<ConfigSetting> = new Array<ConfigSetting>();

    /**
     * Gets a value indicating if the config is dirty
     */
    public get IsDirty(): boolean {
        return this.isDirty;
    }

    /**
     * Create a real RUSKConfig object from a stored RUSKConfig
     * @param config - The stored POJO configuration object
     */
    public static FromStoredConfiguration(cfg: string): RUSKConfig {
        let ruskConfig = new RUSKConfig();

        let config = JSON.parse(cfg);
        let moduleSettings = new Array<ModuleConfiguration>();
        for(let i=0; i<config.moduleSettings.length; i++) {
            moduleSettings.push(ModuleConfiguration.FromStorageObject(config.moduleSettings[i]));
            moduleSettings[moduleSettings.length - 1].setOwner(ruskConfig);
        }
        let sharedSettings = new Array<ConfigSetting>();
        for(let i=0; i<config.sharedSettings.length; i++) {
            sharedSettings.push(ConfigurationSetting.FromStorageObject(config.sharedSettings[i]));
        }

        ruskConfig.moduleSettings = moduleSettings;
        ruskConfig.sharedSettings = sharedSettings;

        return ruskConfig;
    }

    /**
     * Report a change in settings to the RUSKConfig object.
     * @param moduleName - The name of the module reporting the change
     * @param setting - The name of the setting that has been changed
     */
    public NotifySettingChange(moduleName: string, setting: string): void {

        this.isDirty = true;

        let configSetting = this.getSetting(moduleName, setting);
        if (configSetting == null) {
            return; // TODO: Vi må vurdere om dette er en feilsituasjon som skal varsles om.
        }

        // Shared? Propagate & notify
        if (configSetting.isShared) {
            // Delt setting. Vi må oppdatere sharedSettings og andre configer.
            let sharedSetting = this.findSharedSetting(setting);
            if (sharedSetting == null) {
                // Opprett ny sharedSetting
                sharedSetting = configSetting.Clone();
                this.sharedSettings.push(sharedSetting);
            } else {
                // TODO: Burde vi hatt en type-sjekk her?
                sharedSetting.value = configSetting.value;
            }
            for (let i = 0; i < this.moduleSettings.length; i++) {
                if (this.moduleSettings[i].moduleName == moduleName)
                    continue;
                let curSetting = this.findConfigSetting(this.moduleSettings[i], setting);
                if (curSetting) {
                    // TODO: Potensiell type-sjekk her også for early warning om vi har rotet til noe.
                    curSetting.value = configSetting.value;
                    // TODO: Notify extmod på noe vis om at den har fått en endring?
                }
            }
        }

        // This is currently how we store configuration. Feels bad, man.
        chrome.runtime.sendMessage({
            configUpdatedMessage: this.ToJSON()
        });
    }

    /**
     * Returns a POJO object ready to put in storage
     */
    public ToJSON(): string {
        let moduleSettings = [], sharedSettings = [];

        for(let i=0; i<this.moduleSettings.length; i++) {
            let mod = this.moduleSettings[i];
            moduleSettings.push(mod.ToStorageObject());
        }
        for(let i=0; i<this.sharedSettings.length; i++) {
            let setting = this.sharedSettings[i];
            sharedSettings.push(setting.ToStorageObject());
        }

        return JSON.stringify({
            timestamp: new Date(),
            moduleSettings,
            sharedSettings
        });
    }

    /**
     * Adds the default configuration for an ExtensionModule to the RUSKConfig object
     * @param module - The module to add default configuration for
     */
    public AddModuleDefaultConfiguration(module: ExtensionModule): void {
        this.moduleSettings.push(module.configSpec());
        this.isDirty = true;
    }

    /**
     * Adds a ModuleConfiguration to a RUSKConfig object
     * @param config - The ModuleConfiguration to add to the RUSKConfig
     */
    public AddModuleConfiguration(config: ModuleConfiguration): void {
        this.moduleSettings.push(config);
        config.setOwner(this);
        this.isDirty = true;
    }

    /**
     * Adds default configurations for a collection of ExtensionModule objects to the RUSKConfig object
     * @param modules - The modules to add default configuration for
     */
    public AddModuleDefaultConfigurations(modules: Array<ExtensionModule>) {
        for (let i = 0; i < modules.length; i++) {
            this.AddModuleDefaultConfiguration(modules[i]);
        }
    }

    /**
     * Gets the configuration for the named ExtensionModule, or null if no configuration is found.
     * @param module - The name of the module to get the configuration for
     */
    public GetModuleConfiguration(module: string): ModuleConfiguration {
        return this.findModuleConfig(module);
    }

    private getSetting(module: string, setting: string): ConfigSetting {

        let mod = this.findModuleConfig(module);
        if (mod == null) {
            return null;
        }
        let configSetting = this.findConfigSetting(mod, setting);
        return configSetting;
    }

    private findModuleConfig(module: string): ModuleConfiguration {
        let mod: ModuleConfiguration = null;

        for (let i = 0; i < this.moduleSettings.length; i++) {
            if (this.moduleSettings[i].moduleName == module) {
                mod = this.moduleSettings[i];
            }
        }
        return mod;
    }

    private findConfigSetting(module: ModuleConfiguration, setting: string): ConfigSetting {
        let confSetting: ConfigSetting = null;

        for (let i = 0; i < module.settings.length; i++) {
            if (module.settings[i].setting == setting) {
                confSetting = module.settings[i];
            }
        }
        return confSetting;
    }

    private findSharedSetting(setting: string): ConfigSetting {
        let confSetting: ConfigSetting = null;

        for (let i = 0; i < this.sharedSettings.length; i++) {
            if (this.sharedSettings[i].setting == setting) {
                confSetting = this.sharedSettings[i];
            }
        }
        return confSetting;
    }
}
