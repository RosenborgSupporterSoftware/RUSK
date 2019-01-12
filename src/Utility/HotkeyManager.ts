import { KeyCombo } from "./KeyCombo";
import { HotkeyAction } from "./HotkeyAction";
import { RBKwebPageType } from "../Context/RBKwebPageType";
import { ExtensionModule } from "../ExtensionModules/ExtensionModule";

/**
 * A class tasked with reacting to keyboard input and invoking hotkey functionality
 * First version of this class is extremely Windows centric. This needs to be fixed ASAP.
 * Meta key (Windows key on Win) is currently not really used.
 */

export class HotkeyManager {

    private static _instance: HotkeyManager;

    private _modifierKeys = [
        'Shift',        // Shift på Windows
        'Alt',          // Alt på Windows
        'Control',      // Ctrl på Windows
        'AltGraph',     // Implisitt Control også
        'Meta'          // Windows key på Windows
    ];

    private _modifiersDown = {
        shift: false,
        alt: false,
        cmdCtrl: false,
        meta: false
    };

    private _hotkeys = new Array<HotkeyAction>();
    private _pageType: RBKwebPageType;
    private _modules: Array<ExtensionModule>;

    /** Gets the current instance of the HotkeyManager class */
    public static get Instance() {
        return this._instance || (this._instance = new HotkeyManager());
    }

    /** Set the RBKwebPageType we are currently at */
    public SetPageType(pageType: RBKwebPageType) {
        this._pageType = pageType;
    }

    /** Set the list of modules we're currently working with */
    public SetModules(modules: Array<ExtensionModule>) {
        this._modules = modules;
    }

    /** Add hotkey definitions to the HotkeyManager */
    public AddHotkeys(hotkeys: Array<HotkeyAction>) {
        if (hotkeys == null) return;

        hotkeys.forEach(hk => this._hotkeys.push(hk));
    }

    private constructor() {
        document.addEventListener('keydown', ev => this.keydownHandler(ev));
        document.addEventListener('keyup', ev => this.keyupHandler(ev));
    }

    private handlePotentialHotkey(keyCombo: KeyCombo): boolean {

        let result = false;

        this._hotkeys.forEach(hk => {
            if (!hk.IsMatch(this._pageType, keyCombo)) return;

            // If we make it here, we should indeed invoke our hotkey
            // Get the right module
            this._modules.forEach(mod => {
                if (mod.name == hk.ExtensionModule) {
                    if(mod.invoke(hk.Name)) result = true;
                }
            })
        });

        return result;
    }

    private keydownHandler(ev: KeyboardEvent) {
        this.getModifierKeyState(ev);
        if (this._modifierKeys.indexOf(ev.key) == -1) {
            let keyCombo = this.createKeyCombo(ev.key);
            if (this.handlePotentialHotkey(keyCombo)) {
                ev.preventDefault();
            }
        }
    }

    private keyupHandler(ev: KeyboardEvent) {
        this.getModifierKeyState(ev);
    }

    private getModifierKeyState(ev: KeyboardEvent) {
        this._modifiersDown.shift = ev.shiftKey;
        this._modifiersDown.alt = ev.altKey;
        this._modifiersDown.cmdCtrl = ev.ctrlKey;

        // TODO: See MAC Command key as Control.
        // TODO: Handle Meta/OS key?
    }

    private createKeyCombo(key: string): KeyCombo {
        let combo = "";
        if (this._modifiersDown.cmdCtrl) combo += "Ctrl ";
        if (this._modifiersDown.alt) combo += "Alt ";
        if (this._modifiersDown.shift) combo += "Shift ";
        combo += key;

        return KeyCombo.FromString(combo);
    }
}
