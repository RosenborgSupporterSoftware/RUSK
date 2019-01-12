import { ConfigSetting, settingValueTypes } from "./ConfigurationSetting";
import { ExtensionModule } from "../ExtensionModules/ExtensionModule";
import { ColorChecker } from "../Utility/ColorChecker";
import { HotkeySetting } from "./HotkeySetting";

/**
 * ModuleConfiguration contains configuration for a single ExtensionModule
 */

export class ModuleConfiguration {

    private _isDirty: boolean = false;

    /**
     * Gets the dirty state of this ModuleConfiguration object
     */
    get IsDirty(): boolean {
        return this._isDirty;
    }

    /** Gets a value specifying what ExtensionModule this ModuleConfiguration object is for */
    public readonly moduleName: string;

    /** Gets the display name of the ExtensionModule, seen in the settings UI */
    public readonly displayName: string;

    /** Gets a description of the module, displayed at the top of its' settings page */
    public readonly moduleDescription: string;

    /** Gets or sets a value indicating if the ExtensionModule is enabled */
    public moduleEnabled: boolean;

    /** Gets or sets a value indicating if the ExtensionModule is visible in the configuration UI */
    public moduleVisible: boolean;

    public settings: Array<ConfigSetting>;

    public hotkeys: Array<HotkeySetting>;

    /**
     * Creates a ModuleConfiguration instance with settings for an ExtensionModule
     * @param name - The name of the ExtensionModule this ModuleConfiguration belongs to
     * @param displayName - The display name of the ExtensionModule, seen in the settings UI
     * @param desc - A user-visible description of the ExtensionModule
     * @param enabled - A value indicating if the module is enabled
     * @param visible - A value indicating if the module should be visible in the config UI
     * @param settings - An array of settings belonging to the ExtensionModule
     * @param hotkeys - An array of hotkey definitions belonging to the ExtensionModule
     */
    public constructor(name: string, displayName: string, desc: string, enabled: boolean, visible: boolean, settings: Array<ConfigSetting>, hotkeys: Array<HotkeySetting>) {
        this.moduleName = name;
        this.displayName = displayName;
        this.moduleDescription = desc;
        this.moduleEnabled = enabled;
        this.moduleVisible = visible;
        this.settings = settings;
        this.hotkeys = hotkeys;
    }

    /**
     * Restore and sanitize configuration from a POJO to an actual ModuleConfiguration
     * @param obj - The configuration object stored in memory
     * @param module - The ExtensionModule to which this configuration object should apply
     * @returns A populated ModuleConfiguration object
     */
    public static FromStorageObject(obj: any, module: ExtensionModule): ModuleConfiguration {
        let modConf = module.configSpec();
        if (obj == null) return modConf;

        if (obj.settings) {
            for (let i = 0; i < obj.settings.length; i++) {
                let setting = obj.settings[i];
                if (setting.visability) {
                    setting.visibility = setting.visability;
                    modConf.SetDirtyState(true); // Get rid of embarassing typo
                }
                if (modConf.doesSettingExist(setting.setting)) {
                    let modConfSetting = modConf.getConfigSetting(setting.setting);
                    if (modConfSetting.type == "ST_COLOR") {
                        // Verify if colors are in the right format.
                        if (!ColorChecker.CheckColorFormat(setting.value)) {
                            // setting.value = ColorChecker.GetBestColorOption(setting.value, modConfSetting.value as string);
                            setting.value = ColorChecker.GetBestColorOption("#abc", modConfSetting.value as string);
                            modConf.SetDirtyState(true);
                        }
                    }
                    modConf.changeSetting(setting.setting, setting.value);
                } else {
                    modConf.SetDirtyState(true);
                }
            }
        }
        if (obj.hotkeys) {
            obj.hotkeys.forEach(hk => {
                if (modConf.doesHotkeyExist(hk.name)) {
                    let neo = HotkeySetting.FromStorageObject(hk);
                    modConf.hotkeys.forEach(origHotkey => {
                        if (origHotkey.name == hk.name) {
                            modConf.hotkeys[modConf.hotkeys.indexOf(origHotkey)] = neo;
                        }
                    })
                } else {
                    modConf.SetDirtyState(true);
                }
            });
        }
        return modConf;
    }

    /**
     * Sets the dirty state of the ModuleConfiguration
     * @param newState - The new dirty state to set the configuration to
     */
    public SetDirtyState(newState: boolean): void {
        this._isDirty = newState;
    }

    private doesSettingExist(setting: string): boolean {
        for (let i = 0; i < this.settings.length; i++) {
            if (this.settings[i].setting == setting) return true;
        }
        return false;
    }

    private doesHotkeyExist(hotkey: string): boolean {
        let exists = false;
        this.hotkeys.forEach(hk => {
            if (hk.name == hotkey) exists = true;
        });
        return exists;
    }

    // /** Sets the given RUSKConfig object as the parent/owner of this ModuleConfiguration */
    // public setOwner(parentConfig: RUSKConfig): void {
    //     this.parentConfig = parentConfig;
    // }

    /**
     * Change a setting in a ModuleConfiguration
     * @param setting - The name of the setting that is going to be changed
     * @param newValue - The new value of the setting that is going to be changed
     */
    public ChangeSetting(setting: string, newValue: settingValueTypes): void {
        this.changeSetting(setting, newValue);

        chrome.runtime.sendMessage({
            storeConfigFor: this.moduleName,
            config: this.ToStorageObject()
        });
    }

    // This exists so we can hydrate objects without causing a notify to store changes
    private changeSetting(setting: string, newValue: settingValueTypes): void {
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
    }

    /**
     * Get the value of a configuration setting
     * @param setting - The name of the setting to return the value for
     */
    public GetSetting(setting: string): settingValueTypes {
        let settingObject = this.getConfigSetting(setting);
        if (settingObject == null) {
            chrome.runtime.sendMessage({
                logMessage: 'ModuleConfiguration for ' + this.moduleName + ' attempted reading unknown setting ' + setting
            });
            return null;
        }
        return settingObject.value;
    }

    /**
     * Returns a POJO object ready to be put in storage
     */
    public ToStorageObject(): object {

        let settings = [];
        for(let i=0; i<this.settings.length; i++) {
            settings.push(this.settings[i].ToStorageObject());
        }
        let hotkeys = [];
        this.hotkeys.forEach(hk => {
            hotkeys.push(hk.ToStorageObject());
        });

        return {
            moduleName: this.moduleName,
            moduleDescription: this.moduleDescription,
            displayName: this.displayName,
            enabled: this.moduleEnabled,
            visible: this.moduleVisible,
            settings,
            hotkeys
        };
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
