/**
 * Tests to verify that KeyCombo behaves somewhat correctly
 */

import { KeyCombo } from '../KeyCombo';

describe('KeyCombo', function() {

    describe('FromString', function() {

        it("Correctly handles null input", () => {
            let res = KeyCombo.FromString(null);
            expect(res).toBeNull();
        });

        it('Correctly handles empty input', () => {
            let res = KeyCombo.FromString('');
            expect(res).toBeNull();
        });

        it('Returns null when given modifiers only', () => {
            let res = KeyCombo.FromString('ctrl alt shift');
            expect(res).toBeNull();
        });

        it('Creates proper object with proper input', () => {
            let keyCombo = KeyCombo.FromString('Ctrl Shift U');
            expect(keyCombo).not.toBeNull();
            expect(keyCombo.ShiftKey).toBeTruthy();
            expect(keyCombo.AltKey).toBeFalsy();
            expect(keyCombo.CtrlKey).toBeTruthy();
            expect(keyCombo.Key).toBe("U");
        });

        it('Works for keyCombos without modifiers', () => {
            let keyCombo = KeyCombo.FromString('K');

            expect(keyCombo).not.toBeNull();
            expect(keyCombo.ShiftKey).toBeFalsy();
            expect(keyCombo.AltKey).toBeFalsy();
            expect(keyCombo.CtrlKey).toBeFalsy();
            expect(keyCombo.Key).toBe("K");
        });

        it('Works with special keys', () => {
            let keyCombo = KeyCombo.FromString('Ctrl Home');

            expect(keyCombo).not.toBeNull();
            expect(keyCombo.Key).toBe('HOME');
            expect(keyCombo.CtrlKey).toBeTruthy();
        });
    });

    describe('ToString', function(){

        it('Creates expected output string', () => {
            let keyCombo = KeyCombo.FromString('Ctrl Alt Shift M');
            let res = keyCombo.toString();

            expect(res).not.toBeNull();
            expect(res).toBe('Ctrl Alt Shift M');
        });

        it('Creates correct string without modifiers', () => {
            let keyCombo = KeyCombo.FromString('M');
            let res = keyCombo.toString();

            expect(res).not.toBeNull();
            expect(res).toBe('M');
        });

    });

    describe('IsMatch', function() {

        it('Returns false when null is passed', () => {
            let keyCombo = KeyCombo.FromString("U");
            let res = keyCombo.IsMatch(null);

            expect(res).toBeFalsy();
        });

        it('Returns true when event is a match', () => {
            let keyCombo = KeyCombo.FromString('Shift X');
            let event = new KeyboardEvent("keydown", {
                shiftKey: true,
                altKey: false,
                ctrlKey: false,
                key: "X"
            });

            let res = keyCombo.IsMatch(event);
            expect(res).toBeTruthy();
        });

        it('Matches correctly with special keys', () => {
            let keyCombo = KeyCombo.FromString('Ctrl Insert');
            let event = new KeyboardEvent("keydown", {
                shiftKey: false,
                altKey: false,
                ctrlKey: true,
                key: "Insert"
            });

            let res = keyCombo.IsMatch(event);
            expect(res).toBeTruthy();
        });

    });

});
