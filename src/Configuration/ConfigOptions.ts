import { ConfigOption } from "./ConfigOption";
import { SettingType } from "./SettingType";

/**
 * A set of configuration options for an ExtensionModule.
 * This is used to render the configuration interface for the ExtensionModule.
 */

export interface ConfigOptions {
    /** The displayname of the extensionmodule in the configuration interface */
    readonly displayName: string;

    /** Gets the default value for the enabled setting of the ExtensionModule if no existing configuration can be found */
    readonly defaultEnabled: boolean;

    /** The options needed to configure this ExtensionModule */
    readonly options: Array<ConfigOption>;
}
