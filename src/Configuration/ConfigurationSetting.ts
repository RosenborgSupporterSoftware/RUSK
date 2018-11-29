
/** Value types that can be used in ConfigurationSetting<T> objects */
export type settingValueTypes = string | boolean | Array<string>;

/** Convenience type for cleaner code */
export type ConfigSetting = ConfigurationSetting<settingValueTypes>;

/**
 * Represents a single configuration setting
 */
export class ConfigurationSetting<T extends settingValueTypes>  {
    readonly setting: string;
    value: T;
    readonly isShared: boolean;

    constructor(settingName: string, value: T, isShared: boolean = false) {
        this.setting = settingName;
        this.value = value;
        this.isShared = isShared;
    }

    /** Creates a clone of the ConfigurationSetting instance */
    public Clone(): ConfigurationSetting<T> {
        return new ConfigurationSetting(this.setting, this.value, this.isShared);
    }
}
