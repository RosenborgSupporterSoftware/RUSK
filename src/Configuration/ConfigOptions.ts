import { ConfigOption } from "./ConfigOption";

/**
 * A set of configuration options for an ExtensionModule.
 * This is used to render the configuration interface for the ExtensionModule.
 */

export interface ConfigOptions {
    /** The displayname of the extensionmodule in the configuration interface */
    readonly displayName: string;

    /** The options needed to configure this ExtensionModule */
    readonly options: Array<ConfigOption>;
}
