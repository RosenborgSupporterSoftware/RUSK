import { ConfigSetting } from "./ConfigurationSetting";
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
}
