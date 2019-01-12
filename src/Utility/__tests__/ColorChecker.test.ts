import { ColorChecker } from "../ColorChecker";

/**
 * Tests to verify that ColorChecker does the right thing
 */


describe('ColorChecker', function () {

    describe('CheckColorFormat', function () {

        it('does not approve of null', () => {
            let res = ColorChecker.CheckColorFormat(null);
            expect(res).toBeFalsy();
        });

        it('disapproves of empty strings', () => {
            let res = ColorChecker.CheckColorFormat("");
            expect(res).toBeFalsy();
        });

        it('does not like short form colors', () => {
            let res = ColorChecker.CheckColorFormat("#FFF");
            expect(res).toBeFalsy();
        });

        it('does not like colors without a hash in front', () => {
            let res = ColorChecker.CheckColorFormat("FFFFFF");
            expect(res).toBeFalsy();
        });

        it('returns true with a properly formatted color', () => {
            let res = ColorChecker.CheckColorFormat("#FFFFFF");
            expect(res).toBeTruthy();
        });

    });

    describe('GetBestColorOption', () => {

        it('returns fallback-color when no good alternative given', () => {
            let res = ColorChecker.GetBestColorOption(null, null);
            expect(res).toBe('#FF69B4');
        });

        it('returns originalColor when it is in a proper format', () => {
            let res = ColorChecker.GetBestColorOption('#000000', 'Ignored');
            expect(res).toBe('#000000');
        });

        it('returns fallback when original is bad', () => {
            let res = ColorChecker.GetBestColorOption('Bad value', '#123456');
            expect(res).toBe('#123456');
        })
    });

    describe('LongColorFromShort', () => {

        it('returns proper conversion of short color format', () => {
            let res = ColorChecker.LongColorFromShort('#FFF');
            expect(res).toBe('#FFFFFF');
        });

        it('returns proper conversion when no hash at start', () => {
            let res = ColorChecker.LongColorFromShort('ABC');
            expect(res).toBe('#AABBCC');
        });

    });
});
