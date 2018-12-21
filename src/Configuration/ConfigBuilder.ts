import { SettingType } from "./SettingType";
import { ConfigurationOptionVisibility } from "./ConfigurationOptionVisibility";
import { ModuleConfiguration } from "./ModuleConfiguration";
import { ConfigSetting, ConfigurationSetting } from "./ConfigurationSetting";

/**
 * ConfigBuilder is a fluent interface for defining the configuration options used by an ExtensionModule.
 */

export class ConfigBuilder {
    name: string;
    displayName: string;
    description: string;
    defaultEnabled: boolean = true;
    defaultVisible: boolean = true;
    configOptions: Array<ConfigOptionBuilder> = [];

    /** A method used to define the configuration needed for an ExtensionModule */
    public static Define(): ConfigBuilder {
        return new ConfigBuilder();
    }

    /** Builds and returns the finished configuration object */
    public Build(): ModuleConfiguration {

        let settings = new Array<ConfigSetting>();

        this.configOptions.forEach(opt => {
            switch (opt.type) {
                case SettingType.text:
                    settings.push(this.createTextOption(opt));
                    break;
                case SettingType.color:
                    settings.push(this.createColorOption(opt));
                    break;
                case SettingType.bool:
                    settings.push(this.createBoolOption(opt));
                    break;
                case SettingType.list:
                    settings.push(this.createListOption(opt));
                    break;
            }
        });
        return new ModuleConfiguration(this.name, this.displayName, this.description, this.defaultEnabled, this.defaultVisible, settings);
    }

    private createTextOption(opt: ConfigOptionBuilder): ConfigurationSetting<string> {

        if (opt.type != SettingType.text || typeof opt.defaultValue != "string") {
            throw new Error('Option ' + opt.setting + ' unsuitable as string');
        }

        return new ConfigurationSetting(opt.setting, opt.defaultValue, opt.isShared);
    }

    private createColorOption(opt: ConfigOptionBuilder): ConfigurationSetting<string> {
        if (opt.type != SettingType.color || typeof opt.defaultValue != "string") {
            throw new Error('Option ' + opt.setting + ' unsuitable as color');
        }
        // TODO: Validate default color value

        return new ConfigurationSetting(opt.setting, opt.defaultValue, opt.isShared);
    }

    private createBoolOption(opt: ConfigOptionBuilder): ConfigurationSetting<boolean> {
        if (opt.type != SettingType.bool || typeof opt.defaultValue != "boolean") {
            throw new Error('Option ' + opt.setting + ' unsuitable as bool');
        }

        return new ConfigurationSetting(opt.setting, opt.defaultValue, opt.isShared);
    }

    private createListOption(opt: ConfigOptionBuilder): ConfigurationSetting<Array<string>> {
        if (opt.type != SettingType.list || !Array.isArray(opt.defaultValue)) {
            throw new Error('Option ' + opt.setting + ' unsuitable as bool');
        }

        return new ConfigurationSetting(opt.setting, opt.defaultValue, opt.isShared);
    }

    /** Names the ExtensionModule that will use the configuration */
    public WithExtensionModuleName(name: string): ConfigBuilder {
        this.name = name;
        return this;
    }

    /** Sets the displayName of the ExtensionModule */
    public WithDisplayName(displayName: string): ConfigBuilder {
        this.displayName = displayName;
        return this;
    }

    /** Gives a description of the ExtensionModule that will be displayed in the settings UI */
    public WithDescription(description: string): ConfigBuilder {
        this.description = description;
        return this;
    }

    /** Defines that this ExtensionModule should be enabled by default for new users with no existing configuraton for it */
    public EnabledByDefault(): ConfigBuilder {
        this.defaultEnabled = true;
        return this;
    }

    /** Defines that this ExtensionModule should not be enabled by default for new users with no existing configuraton for it */
    public DisabledByDefault(): ConfigBuilder {
        this.defaultEnabled = false;
        return this;
    }

    /** Defines that this ExtensionModule should not show up in the module configuration user interface */
    public InvisibleToConfig(): ConfigBuilder {
        this.defaultVisible = false;
        return this;
    }

    public WithConfigOption(callback: (opt: ConfigOptionBuilder) => ConfigOptionBuilder): ConfigBuilder {
        this.configOptions.push(callback(new ConfigOptionBuilder()));
        return this;
    }
}

/**
 * ConfigOptionBuilder is a fluent sub-interface for building configuration options
 */
export class ConfigOptionBuilder {
    setting: string;
    defaultValue: string | boolean | Array<string>;
    type: SettingType;
    label: string;
    isShared: boolean = false;
    visibility: ConfigurationOptionVisibility = ConfigurationOptionVisibility.Always;

    /** Sets the setting name of the option */
    public WithSettingName(settingName: string): ConfigOptionBuilder {
        this.setting = settingName;
        return this;
    }

    /** Sets the default value of the option */
    public WithDefaultValue(value: string | boolean | Array<string>): ConfigOptionBuilder {
        this.defaultValue = value;
        return this;
    }

    /** Sets the setting type of the option */
    public WithSettingType(settingType: SettingType): ConfigOptionBuilder {
        this.type = settingType;
        return this;
    }

    /** Sets the display label of the option */
    public WithLabel(label: string): ConfigOptionBuilder {
        this.label = label;
        return this;
    }

    /** Sets the visibility of this option */
    public WithVisibility(visibility: ConfigurationOptionVisibility): ConfigOptionBuilder {
        this.visibility = visibility;
        return this;
    }

    /** Makes this option a shared setting that can be referenced by other ExtMods as well */
    public AsSharedSetting(): ConfigOptionBuilder {
        this.isShared = true;
        return this;
    }
}
