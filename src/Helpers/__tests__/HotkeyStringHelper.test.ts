import { HotkeyStringHelper } from "../HotkeyStringHelper";
import { HotkeySetting } from "../../Configuration/HotkeySetting";
import { RBKwebPageType } from "../../Context/RBKwebPageType";
import { ConfigurationOptionVisibility } from "../../Configuration/ConfigurationOptionVisibility";
import { KeyCombo } from "../../Utility/KeyCombo";

/**
 * Tests that verify that HotkeyStringHelper behaves
 */

describe('HotkeyStringHelper', () => {

    describe('HotkeySettingToListString', () => {

        it('returns empty string with null input', () => {
            let res = HotkeyStringHelper.HotkeySettingToListString(null);
            expect(res).toBe('');
        });

        it('returns empty string with no keycombos input', () => {
            let hk = new HotkeySetting('Test', 'Test', [], [RBKwebPageType.RBKweb_ALL], ConfigurationOptionVisibility.Always);
            let res = HotkeyStringHelper.HotkeySettingToListString(hk);
            expect(res).toBe('');
        });

        it('returns correct string with single keycombo input', () => {
            let hk = new HotkeySetting('Test', 'Test', [
                KeyCombo.FromString('Ctrl J')
                ], [RBKwebPageType.RBKweb_ALL], ConfigurationOptionVisibility.Always);
            let res = HotkeyStringHelper.HotkeySettingToListString(hk);
            expect(res).toBe('Ctrl J');
        });

        it('returns correct string with two keycombo input', () => {
            let hk = new HotkeySetting('Test', 'Test', [
                KeyCombo.FromString('Ctrl J'), 
                KeyCombo.FromString('J')
                ], [RBKwebPageType.RBKweb_ALL], ConfigurationOptionVisibility.Always);
            let res = HotkeyStringHelper.HotkeySettingToListString(hk);
            expect(res).toBe('Ctrl J eller J');
        });

        it('returns correct string with three keycombo input', () => {
            let hk = new HotkeySetting('Test', 'Test', [
                KeyCombo.FromString('Ctrl J'), 
                KeyCombo.FromString('Shift Q'), 
                KeyCombo.FromString('ENTER')
                ], [RBKwebPageType.RBKweb_ALL], ConfigurationOptionVisibility.Always);
            let res = HotkeyStringHelper.HotkeySettingToListString(hk);
            expect(res).toBe('Ctrl J, Shift Q eller ENTER');
        });

        it('works when we swap out the lastSeparator too', () => {
            let hk = new HotkeySetting('Test', 'Test', [
                KeyCombo.FromString('Ctrl J'), 
                KeyCombo.FromString('J')
                ], [RBKwebPageType.RBKweb_ALL], ConfigurationOptionVisibility.Always);
            let res = HotkeyStringHelper.HotkeySettingToListString(hk, "og");
            expect(res).toBe('Ctrl J og J');
        });
    });
});