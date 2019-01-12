import { HotkeyAction } from "../Utility/HotkeyAction";
import { ModuleConfiguration } from "../Configuration/ModuleConfiguration";

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

    /** Gets the hotkeys defined by this module */
    public get Hotkeys(): Array<HotkeyAction> {
        return this._hotkeys;
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
}

