/**
 * A utility class designed to make it easy to define hotkeys for RUSK
 */
export class KeyCombo {

    private _shiftKey: boolean = false;
    private _altKey: boolean = false;
    private _ctrlKey: boolean = false; // FIXME: Handle Mac command keys
    private _key: string;

    /** Gets a value indicating whether this KeyCombo requires the Shift key to be pressed */
    public get ShiftKey(): boolean {
        return this._shiftKey;
    }

    /** Gets a value indicating whether this KeyCombo requires the Alt key to be pressed */
    public get AltKey(): boolean {
        return this._altKey;
    }

    /** Gets a value indicating whether this KeyCombo requires the Ctrl/Cmd key to be pressed */
    public get CtrlKey(): boolean {
        return this._ctrlKey;
    }

    /** Gets the main key used in this KeyCombo object */
    public get Key(): string {
        return this._key;
    }

    private constructor() {
    }

    /**
     * Create a KeyCombo object based on an input string
     * @param keyString - The string input to create a hotkey from
     * @returns the KeyCombo object or null if the input was useless
     * @example let hotkey = KeyCombo.FromString("Ctrl Shift Alt P");
     */
    public static FromString(keyString: string): KeyCombo {
        if (keyString == null || keyString.length == 0) return null;

        let components = keyString.split(' ');
        if (components.length == 0) return null;

        let keyCombo = new KeyCombo();

        for (let i = 0; i < components.length; i++) {
            switch (components[i].toUpperCase()) {
                case "SHIFT":
                    keyCombo._shiftKey = true;
                    break;
                case "ALT":
                    keyCombo._altKey = true;
                    break;
                case "CTRL":
                    keyCombo._ctrlKey = true;
                    break;
                default:
                    keyCombo._key = components[i].toUpperCase();
                    break;
            }
        }

        if (keyCombo.Key == null) return null;

        return keyCombo;
    }

    /**
     * Make a proper KeyCombo object out of one that looks like one.
     * @param storage The KeyCombo-like object from storage/context switch that looks like a KeyCombo but isn't really.
     */
    public static FromStorage(storage: KeyCombo): KeyCombo {
        let keyCombo = new KeyCombo()

        keyCombo._altKey = storage._altKey;
        keyCombo._ctrlKey = storage._ctrlKey;
        keyCombo._shiftKey = storage._shiftKey;
        keyCombo._key = storage._key;

        return keyCombo;
    }

    public IsMatch(event: KeyboardEvent): boolean {
        if (event == null) return false;

        if (event.shiftKey != this.ShiftKey) return false;
        if (event.altKey != this.AltKey) return false;
        if (event.ctrlKey != this.CtrlKey) return false;

        if (event.key.toUpperCase() != this.Key.toUpperCase()) return false;

        return true;
    }

    /**
     * Gets a string representation of this hotkey
     */
    public toString(): string {

        let result = "";

        if (this._ctrlKey) result += "Ctrl ";
        if (this._altKey) result += "Alt ";
        if (this._shiftKey) result += "Shift ";

        result += this._key;

        return result;
    }

    /**
     * Checks this KeyCombo object for equality with another KeyCombo object
     * @param other - The KeyCombo object to check against
     * @returns A boolean indicating whether the objects match or not
     */
    public Equals(other: KeyCombo): boolean {
        if (other == null) return false;

        if (other.AltKey != this._altKey) return false;
        if (other.ShiftKey != this._shiftKey) return false;
        if (other.CtrlKey != this._ctrlKey) return false;
        if (other.Key != this._key) return false;

        return true;
    }
}