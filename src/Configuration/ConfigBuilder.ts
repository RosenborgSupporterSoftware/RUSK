import { SettingType } from "./SettingType";
import { ConfigurationOptionVisibility } from "./ConfigurationOptionVisibility";
import { ModuleConfiguration } from "./ModuleConfiguration";
import { ConfigSetting, ConfigurationSetting } from "./ConfigurationSetting";
import { Log } from "../Utility/Log";
import { KeyCombo } from "../Utility/KeyCombo";
import { RBKwebPageType } from "../Context/RBKwebPageType";
import { HotkeyAction } from "../Utility/HotkeyAction";
import { HotkeySetting } from "./HotkeySetting";

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
    hotkeys: Array<HotkeyOptionBuilder> = [];

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

        let hotkeys = new Array<HotkeySetting>();

        this.hotkeys.forEach(hk => {
            hotkeys.push(new HotkeySetting(hk.name, hk.label, hk.hotkeys, hk.validPages, hk.visibility));
        });

        return new ModuleConfiguration(this.name, this.displayName, this.description, this.defaultEnabled, this.defaultVisible, settings, hotkeys);
    }

    private createTextOption(opt: ConfigOptionBuilder): ConfigurationSetting<string> {

        if (opt.type != SettingType.text || typeof opt.defaultValue != "string") {
            throw new Error('Option ' + opt.setting + ' unsuitable as string');
        }

        return new ConfigurationSetting(opt.setting, opt.type, opt.defaultValue, opt.label, opt.isShared, opt.visibility);
    }

    private createColorOption(opt: ConfigOptionBuilder): ConfigurationSetting<string> {
        if (opt.type != SettingType.color || typeof opt.defaultValue != "string") {
            let err = 'Option ' + opt.setting + ' unsuitable as color';
            Log.Error(err);
            throw new Error(err);
        }
        // TODO: Validate default color value

        return new ConfigurationSetting(opt.setting, opt.type, opt.defaultValue, opt.label, opt.isShared, opt.visibility);
    }

    private createBoolOption(opt: ConfigOptionBuilder): ConfigurationSetting<boolean> {
        if (opt.type != SettingType.bool || typeof opt.defaultValue != "boolean") {
            let err = 'Option ' + opt.setting + ' unsuitable as bool';
            Log.Error(err);
            throw new Error(err);
        }

        return new ConfigurationSetting(opt.setting, opt.type, opt.defaultValue, opt.label, opt.isShared, opt.visibility);
    }

    private createListOption(opt: ConfigOptionBuilder): ConfigurationSetting<Array<string>> {
        if (opt.type != SettingType.list || !Array.isArray(opt.defaultValue)) {
            let err = 'Option ' + opt.setting + ' unsuitable as list';
            Log.Error(err);
            throw new Error(err);
        }

        return new ConfigurationSetting(opt.setting, opt.type, opt.defaultValue, opt.label, opt.isShared, opt.visibility);
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

    /** Adds a config option (setting) to the configSpec */
    public WithConfigOption(callback: (opt: ConfigOptionBuilder) => ConfigOptionBuilder): ConfigBuilder {
        this.configOptions.push(callback(new ConfigOptionBuilder()));
        return this;
    }

    /** Adds a hotkey to the configSpec */
    public WithHotkey(callback: (opt: HotkeyOptionBuilder) => HotkeyOptionBuilder): ConfigBuilder {
        this.hotkeys.push(callback(new HotkeyOptionBuilder()));
        return this;
    }
}

export class HotkeyOptionBuilder {

    name: string;
    label: string;
    hotkeys: Array<KeyCombo> = [];
    validPages: Array<RBKwebPageType> = [];
    visibility: ConfigurationOptionVisibility = ConfigurationOptionVisibility.Always;

    /** Set the name of the hotkey, called with invoke() against the ExtMod */
    public WithHotkeyName(hotkeyName: string): HotkeyOptionBuilder {
        this.name = hotkeyName;
        return this;
    }

    /** Set the label of the hotkey, displayed in the settings UI */
    public WithLabel(label: string): HotkeyOptionBuilder {
        this.label = label;
        return this;
    }

    /** Define the keyboard combinations used to trigger this hotkey */
    public WithKeyCombos(combos: Array<string>): HotkeyOptionBuilder {
        if (combos == null) return this;

        combos.forEach(hk => {
            this.hotkeys.push(KeyCombo.FromString(hk));
        });
        return this;
    }

    /** Defines which page types this particular hotkey will run on */
    public WithPageTypes(pageTypes: Array<RBKwebPageType>): HotkeyOptionBuilder {
        if (pageTypes == null) return this;

        pageTypes.forEach(pt => {
            this.validPages.push(pt);
        });

        return this;
    }

    /** Sets the visibility of this hotkey */
    public WithVisibility(visibility: ConfigurationOptionVisibility): HotkeyOptionBuilder {
        this.visibility = visibility;
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
