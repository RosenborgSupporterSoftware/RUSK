import { KeyCombo } from "../KeyCombo";
import { RBKwebPageType } from "../../Context/RBKwebPageType";
import { HotkeyAction } from "../HotkeyAction";

/**
 * Tests for HotkeyAction functionality
 */

describe('HotkeyAction', () => {

    describe('Create', () => {

        it('creates proper object given proper parameters', () => {
            let noop = "";
            let hotkeys = [KeyCombo.FromString("Ctrl Shift P")];
            let pageTypes = [RBKwebPageType.RBKweb_FORUM_ALL];

            let sut = HotkeyAction.Create("Test", "Test", hotkeys, pageTypes);

            expect(sut).not.toBeNull();
            expect(sut.Name).toBe('Test');
            expect(sut.Hotkeys.length).toBe(1);
            expect(sut.PageTypes.length).toBe(1);
        });

    });

    describe('IsMatch', () => {

        it('returns true if everything matches', () => {
            let hotkeys = [KeyCombo.FromString("Ctrl Shift P")];
            let pageTypes = [RBKwebPageType.RBKweb_FORUM_ALL];

            let sut = HotkeyAction.Create("Test", "Test", hotkeys, pageTypes);
            let res = sut.IsMatch(RBKwebPageType.RBKweb_FORUM_FORUMLIST, KeyCombo.FromString("Ctrl Shift P"));

            expect(res).toBeTruthy();
        });

        it("returns false if pageType doesn't match", () => {
            let hotkeys = [KeyCombo.FromString("Ctrl Shift P")];
            let pageTypes = [RBKwebPageType.RBKweb_FORUM_ALL];

            let sut = HotkeyAction.Create("Test", "Test", hotkeys, pageTypes);
            let res = sut.IsMatch(RBKwebPageType.RBKweb_ARTICLE_OVERVIEW, KeyCombo.FromString("Ctrl Shift P"));

            expect(res).toBeFalsy();
        });

        it("returns false if keyCombo doesn't match", () => {
            let hotkeys = [KeyCombo.FromString("Ctrl Shift P")];
            let pageTypes = [RBKwebPageType.RBKweb_FORUM_ALL];

            let sut = HotkeyAction.Create("Test", "Test", hotkeys, pageTypes);
            let res = sut.IsMatch(RBKwebPageType.RBKweb_FORUM_EDITPOST, KeyCombo.FromString("Ctrl Shift G"));

            expect(res).toBeFalsy();
        });

    });

});