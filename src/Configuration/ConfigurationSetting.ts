import { ConfigurationOptionVisibility } from "./ConfigurationOptionVisibility";
import { SettingType } from "./SettingType";

/** Value types that can be used in ConfigurationSetting<T> objects */
export type settingValueTypes = string | boolean | Array<string>;

/** Convenience type for cleaner code */
export type ConfigSetting = ConfigurationSetting<settingValueTypes>;

/**
 * Represents a single configuration setting
 */
export class ConfigurationSetting<T extends settingValueTypes>  {
    readonly setting: string;
    readonly type: SettingType;
    value: T;
    readonly isShared: boolean;
    readonly visibility: ConfigurationOptionVisibility;
    readonly label: string;

    constructor(setting: string, type: SettingType, value: T, label: string, isShared: boolean = false, visibility: ConfigurationOptionVisibility = ConfigurationOptionVisibility.Always) {
        this.setting = setting;
        this.type = type;
        this.value = value;
        this.label = label;
        this.isShared = isShared;
        this.visibility = visibility;
    }

    /** Creates a clone of the ConfigurationSetting instance */
    public Clone(): ConfigurationSetting<T> {
        return new ConfigurationSetting(this.setting, this.type, this.value, this.label, this.isShared, this.visibility);
    }

    public ToStorageObject(): object {
        return {
            setting: this.setting,
            type: this.type,
            label: this.label,
            isShared: this.isShared,
            visibility: this.visibility,
            value: this.value
        };
    }

    public static FromStorageObject(obj: any): ConfigSetting {
        return new ConfigurationSetting(obj.setting, obj.type, obj.value, obj.label, obj.isShared, obj.visibility);
    }
}
