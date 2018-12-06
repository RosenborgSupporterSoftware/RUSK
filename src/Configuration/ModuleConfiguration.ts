import { ConfigSetting, settingValueTypes } from "./ConfigurationSetting";
import { RUSKConfig } from "./RUSKConfig";

/**
 * ModuleConfiguration contains configuration for a single ExtensionModule
 */

export class ModuleConfiguration {

    private parentConfig: RUSKConfig;

    /** Gets a value specifying what ExtensionModule this ModuleConfiguration object is for */
    public readonly moduleName: string;

    /** Gets the display name of the ExtensionModule, seen in the settings UI */
    public readonly displayName: string;

    /** Gets a description of the module, displayed at the top of its' settings page */
    public readonly moduleDescription: string;

    /** Gets or sets a value indicating if the ExtensionModule is enabled */
    public moduleEnabled: boolean;

    public settings: Array<ConfigSetting>;

    /**
     * Creates a ModuleConfiguration instance with settings for an ExtensionModule
     * @param name - The name of the ExtensionModule this ModuleConfiguration belongs to
     * @param displayName - The display name of the ExtensionModule, seen in the settings UI
     * @param desc - A user-visible description of the ExtensionModule
     * @param enabled - A value indicating if the module is enabled
     * @param settings - An array of settings belonging to the ExtensionModule
     */
    public constructor(name: string, displayName: string, desc: string, enabled: boolean, settings: Array<ConfigSetting>) {
        this.moduleName = name;
        this.displayName = displayName;
        this.moduleDescription = desc;
        this.moduleEnabled = enabled;
        this.settings = settings;
    }

    /** Sets the given RUSKConfig object as the parent/owner of this ModuleConfiguration */
    public setOwner(parentConfig: RUSKConfig): void {
        this.parentConfig = parentConfig;
    }

    /**
     * Change a setting in a ModuleConfiguration
     * @param setting - The name of the setting that is going to be changed
     * @param newValue - The new value of the setting that is going to be changed
     */
    public ChangeSetting(setting: string, newValue: settingValueTypes): void {
        let settingObject = this.getConfigSetting(setting);
        if (settingObject == null) {
            chrome.runtime.sendMessage({
                logMessage: 'ModuleConfiguration for '
                    + this.moduleName + ' attempted changing unknown setting '
                    + setting
            });
            return;
        }

        if (!this.checkValueType(settingObject, newValue)) {
            chrome.runtime.sendMessage({
                logMessage: 'ModuleConfiguration for '
                    + this.moduleName + ' tried setting '
                    + setting + ' to a value of the wrong type.'
            });
            return;
        }

        settingObject.value = newValue;
        if (this.parentConfig) {
            this.parentConfig.NotifySettingChange(this.moduleName, setting);
        }
    }

    private checkValueType(setting: ConfigSetting, newValue: settingValueTypes): boolean {
        return typeof setting.value === typeof newValue;
    }

    private getConfigSetting(setting: string): ConfigSetting {
        for (let i = 0; i < this.settings.length; i++) {
            if (this.settings[i].setting == setting) {
                return this.settings[i];
            }
        }

        return null;
    }
}
