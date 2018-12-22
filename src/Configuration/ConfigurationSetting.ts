import { ConfigurationOptionVisibility } from "./ConfigurationOptionVisibility";

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
    readonly visability: ConfigurationOptionVisibility;

    constructor(setting: string, value: T, isShared: boolean = false, visibility: ConfigurationOptionVisibility = ConfigurationOptionVisibility.Always) {
        this.setting = setting;
        this.value = value;
        this.isShared = isShared;
        this.visability = visibility;
    }

    /** Creates a clone of the ConfigurationSetting instance */
    public Clone(): ConfigurationSetting<T> {
        return new ConfigurationSetting(this.setting, this.value, this.isShared, this.visability);
    }

    public ToStorageObject(): object {
        return {
            setting: this.setting,
            isShared: this.isShared,
            visability: this.visability,
            value: this.value
        };
    }

    public static FromStorageObject(obj: any): ConfigSetting {
        return new ConfigurationSetting(obj.setting, obj.value, obj.isShared, obj.visability);
    }
}
