import { KeyCombo } from "./KeyCombo";
import { RBKwebPageType } from "../Context/RBKwebPageType";
import { PageTypeClassifier } from "../Context/PageTypeClassifier";

export type HotkeyFunction = (actionName: string) => void;

/**
 * A class that connects a keyboard combination, a page and a hotkey name together
 */

export class HotkeyAction {

    private _name: string;
    private _extensionModule: string;
    private _hotkeys: Array<KeyCombo>;
    private _pageTypes: Array<RBKwebPageType>;

    /** Gets the unique name of the hotkey */
    public get Name(): string {
        return this._name;
    }

    /** Gets the name of the ExtensionModule this hotkey belongs to */
    public get ExtensionModule(): string {
        return this._extensionModule;
    }

    /** Gets the list of KeyCombo objects */
    public get Hotkeys(): Array<KeyCombo> {
        return this._hotkeys;
    }

    /** Gets the page types this hotkey is valid for */
    public get PageTypes(): Array<RBKwebPageType> {
        return this._pageTypes;
    }

    private constructor(name: string, extmod: string, hotkeys: Array<KeyCombo>, pageTypes: Array<RBKwebPageType>) {
        this._name = name;
        this._extensionModule = extmod;
        this._hotkeys = hotkeys;
        this._pageTypes = pageTypes;
    }

    /**
     * Create a new HotkeyAction object.
     * @param name - The unique name of the hotkey - passed to the action when called
     * @param hotkeys - The list of hotkeys mapping to this HotkeyAction
     * @param pageTypes - The page types which this HotkeyAction is relevant for
     */
    public static Create(name: string, extmod: string, hotkeys: Array<KeyCombo>, pageTypes: Array<RBKwebPageType>) {
        let actualHotkeys = new Array<KeyCombo>();
        hotkeys.forEach(hk => actualHotkeys.push(KeyCombo.FromStorage(hk)));
        return new HotkeyAction(name, extmod, actualHotkeys, pageTypes);
    }

    /**
     * Check to see if a HotkeyAction should be invoked based on the page type we're on and the keyboard combination pressed
     * @param pageType - The type of page we are currently on
     * @param keyCombo - The KeyCombo pushed by the user
     */
    public IsMatch(pageType: RBKwebPageType, keyCombo: KeyCombo): boolean {
        // Check PageType
        if (!PageTypeClassifier.ShouldRunOnPage(this._pageTypes, pageType)) return false;

        // Check KeyCombo
        let comboMatch = false;
        this._hotkeys.forEach(hotkey => { if (keyCombo.Equals(hotkey)) comboMatch = true; })

        return comboMatch;
    }
}
