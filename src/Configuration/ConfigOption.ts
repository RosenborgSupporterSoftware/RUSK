import { SettingType } from "./SettingType";

/**
 * Represents a single configuration option for an ExtensionModule
 */

export interface ConfigOption {

    /** The name of the configuration option */
    setting: string;

    /** The type of the configuration option */
    type: SettingType;

    /** A descriptive label displayed in the user interface */
    label: string;
}
