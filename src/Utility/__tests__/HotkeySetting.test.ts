import { HotkeySetting } from "../../Configuration/HotkeySetting";
import { KeyCombo } from "../KeyCombo";
import { ConfigurationOptionVisibility } from "../../Configuration/ConfigurationOptionVisibility";
import { RBKwebPageType } from "../../Context/RBKwebPageType";

describe('HotkeySetting', () => {

    describe('Clone', () => {

        it('Creates a proper clone', () => {
            let original = new HotkeySetting('Test', 'Label', [KeyCombo.FromString('Ctrl J')], [RBKwebPageType.RBKweb_ALL], ConfigurationOptionVisibility.Always);

            let sut = original.Clone();

            expect(sut.name).toBe(original.name);
            expect(sut.label).toBe(original.label);
            expect(sut.visibility).toBe(original.visibility);
            expect(sut.hotkeys.length).toBe(1);
            expect(sut.hotkeys[0].Equals(original.hotkeys[0])).toBeTruthy();
            expect(sut.validPages.length).toBe(1);
            expect(sut.validPages[0]).toBe(original.validPages[0]);
        });

    });

    describe('ToStorageObject', () => {

        let sut = new HotkeySetting('Test', 'Label', [KeyCombo.FromString('Ctrl J')], [RBKwebPageType.RBKweb_ALL], ConfigurationOptionVisibility.Always);
        let res = sut.ToStorageObject();

        expect(res).not.toBeNull();
        expect(res.name).toBe('Test');
        expect(res.label).toBe('Label');
        expect(res.visibility).toBe(ConfigurationOptionVisibility.Always);

        expect(res.hotkeys).not.toBeNull();
        expect(res.hotkeys.length).toBe(1);
        expect(res.hotkeys[0]).toBe('Ctrl J');

        expect(res.validPages).not.toBeNull();
        expect(res.validPages.length).toBe(1);
        expect(res.validPages[0]).toBe(RBKwebPageType.RBKweb_ALL);
    });

});