import { HotkeyAction } from "../Utility/HotkeyAction";
import { ModuleConfiguration } from "../Configuration/ModuleConfiguration";
import { file } from "@babel/types";
import { Log } from "../Utility/Log";

/**
 * RUSKUI.ts
 * A class containing modifications to the RBKweb User Interface by RUSK modules.
 * An instance of this class is returned by each ExtMod's init() function.
 * It contains any UI elements the ExtMod wants to inject into the page.
 * Currently this means hotkeys.
 * Coming additions: CSS injection, menu items in the left main menu of RBKweb.
 */

export class RUSKUI {

    private _hotkeys = new Array<HotkeyAction>();
    private _cssFilename: string;
    private _cssProperties: Map<string, string>;

    /** Gets the hotkeys defined by this module */
    public get Hotkeys(): Array<HotkeyAction> {
        return this._hotkeys;
    }

    /** Gets the filename of the CSS file to use */
    public get CSSFilename(): string {
        return this._cssFilename;
    }

    /** Gets the CSS properties to use */
    public get CSSProperties(): Map<string, string> {
        return this._cssProperties;
    }

    public constructor() {
    }

    /**
     * Extract hotkeys from the configuration of an ExtensionModule
     * @param config - The module configuration to extract hotkeys from
     */
    public ExtractHotkeys(config: ModuleConfiguration) {
        config.hotkeys.forEach(hk => {
            this._hotkeys.push(HotkeyAction.Create(hk.name, config.moduleName, hk.hotkeys, hk.validPages));
        })
    }

    /**
     * Fetch CSS from the given filename - relative to the extension data directory
     * @param filename - The CSS file to load into RBKweb
     * @param properties - The CSS properties (if any) to use
     */
    public FetchCSS(filename: string, properties: Map<string, string>) {
        this.guardCSSProps(properties);

        this._cssFilename = filename;
        this._cssProperties = properties;
    }

    private guardCSSProps(props: Map<string, string>) {
        for (let prop of props) {
            if (!prop[0].startsWith('--')) {
                Log.Error(`Invalid CSS property name ${prop[0]} - CSS properties must start with --`);
            }
        }
    }
}

