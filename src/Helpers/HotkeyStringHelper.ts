import { HotkeySetting } from "../Configuration/HotkeySetting";

/**
 * HotkeyStringHelper.ts
 * 
 * Silly class that takes a HotkeySetting class and turns it into a 
 * human-readable list of keyboard combinations to push.
 * 
 * Separated into a class by itself to make it easier to unit test.
 */

export class HotkeyStringHelper {

    /**
     * Turn a HotkeySetting object into a human-readable list of keyboard combinations
     * @param hotkey - The HotkeySetting object to build the string from
     * @param lastSeparator - The word to put before the final hotkey as a separator. Defaults to "eller".
     */
    public static HotkeySettingToListString(hotkey: HotkeySetting, lastSeparator = "eller"): string {
        if(hotkey == null) return '';

        if(hotkey.hotkeys.length == 1) {
            return hotkey.hotkeys[0].toString();
        } else {
            let combos = hotkey.hotkeys.length;
            let keyString = "";
            for(let i=0; i<combos; i++) {
                keyString += hotkey.hotkeys[i].toString();
                if(i+1 < combos) {
                    // More to come
                    if(i+2 < combos) {
                        keyString += ", ";
                    } else {
                        keyString += " " + lastSeparator + " ";
                    }
                }
            }
            return keyString;
        }
    }
}