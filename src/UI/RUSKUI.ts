import { HotkeyAction } from "../Utility/HotkeyAction";
import { ModuleConfiguration } from "../Configuration/ModuleConfiguration";
import { file } from "@babel/types";
import { Log } from "../Utility/Log";
import { MainMenuItem } from "../UI/MainMenuItem";
import { PageContext } from "../Context/PageContext";

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
    private _menuItems = new Array<MainMenuItem>();
    private _userTips = new Array<string>();

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

    /** Gets the MainMenuItem objects to use */
    public get MenuItems(): Array<MainMenuItem> {
        return this._menuItems;
    }

    /** Gets the usertips modules have generated */
    public get UserTips(): Array<string> {
        return this._userTips;
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
    public FetchCSS(filename: string, properties: Map<string, string> = null) {
        this.guardCSSProps(properties);

        this._cssFilename = filename;
        this._cssProperties = properties || new Map<string,string>();
    }

    /**
     * Adds a menu item to the main RUSK menu - on the bottom of the RBKweb menu on the left
     * @param label - The visible label to display for this menu item
     * @param sortOrder - The sort order for this menu item - lower number = earlier
     * @param action - The action to execute when the user clicks the menu item
     * @param context - The context used when executing the action
     */
    public AddMenuItem(label: string, sortOrder: number, action: (ctx: PageContext) => void,  context: any = null) {
        this._menuItems.push(new MainMenuItem(label, sortOrder, action, context));
    }

    /**
     * Add user tips (one displayed at random) to the RBKweb UI 
     * @param tips - The user tips to add
     */
    public AddUserTips(tips: Array<string>) {
        this._userTips = this._userTips.concat(tips);
    }

    private guardCSSProps(props: Map<string, string>) {
        if (props == null || props.entries.length == 0) return;

        for (let prop of props) {
            if (!prop[0].startsWith('--')) {
                Log.Error(`Invalid CSS property name ${prop[0]} - CSS properties must start with --`);
            }
        }
    }
}

