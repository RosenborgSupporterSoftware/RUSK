import { KeyCombo } from "../Utility/KeyCombo";
import { RBKwebPageType } from "../Context/RBKwebPageType";
import { ConfigurationOptionVisibility } from "./ConfigurationOptionVisibility";

/**
 * Represents a hotkey definition
 */

export class HotkeySetting {

    readonly name: string;
    readonly label: string;
    readonly hotkeys: Array<KeyCombo> = [];
    readonly validPages: Array<RBKwebPageType> = [];
    readonly visibility: ConfigurationOptionVisibility = ConfigurationOptionVisibility.Always;

    constructor(name: string, label: string, hotkeys: Array<KeyCombo>, validPages: Array<RBKwebPageType>, visibility: ConfigurationOptionVisibility) {
        this.name = name;
        this.label = label;
        this.hotkeys = hotkeys;
        this.validPages = validPages;
        this.visibility = visibility;
    }

    /** Creates a clone of the HotkeySetting instance */
    public Clone(): HotkeySetting {
        return new HotkeySetting(this.name, this.label, this.hotkeys, this.validPages, this.visibility);
    }

    public setKeyCombos(keyCombos: Array<KeyCombo>) {
        this.hotkeys.length = 0;
        keyCombos.forEach(kc => this.hotkeys.push(kc));
    }

    public ToStorageObject(): any {
        let keyDefs = new Array<string>();
        this.hotkeys.forEach(hk => {
            keyDefs.push(hk.toString());
        });
        return {
            name: this.name,
            label: this.label,
            hotkeys: keyDefs,
            validPages: this.validPages,
            visibility: this.visibility
        };
    }

    public static FromStorageObject(obj: any): HotkeySetting {
        let keys = new Array<KeyCombo>();
        obj.hotkeys.forEach(hk => {
            if (typeof hk == "string") {
                keys.push(KeyCombo.FromString(hk));
            } else {
                keys.push(hk);
            }
        });
        return new HotkeySetting(obj.name, obj.label, keys, obj.validPages, obj.visibility);
    }
}
