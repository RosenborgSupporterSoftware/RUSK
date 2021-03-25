/**
 * Tests for PageContext
 * Basically just checking the sanity of the state stuff
 */

import { PageContext } from "../PageContext";

describe('PageContext', function() {

    describe('states', function() {

        it('lets us set a state', () => {
            let sut = new PageContext();
            sut.SetState('testState');
            let res = sut.IsInState('testState');
            expect(res).toBeTruthy();
        });

        it('does not have a state by default', () => {
            let sut = new PageContext();

            let res = sut.IsInState('anyState');
            expect(res).toBeFalsy();
        });

        it('lets us clear a set state', () => {
            let sut = new PageContext();
            sut.SetState('testState');
            expect(sut.IsInState('testState')).toBeTruthy();

            sut.ClearState('testState');
            let res = sut.IsInState('testState');
            expect(res).toBeFalsy();
        });

        it('lets us play with state in any order', () => {
            let sut = new PageContext();
            sut.SetState('stateA');
            expect(sut.IsInState('stateA')).toBeTruthy();
            expect(sut.IsInState('stateB')).toBeFalsy();

            sut.SetState('stateB');
            expect(sut.IsInState('stateA')).toBeTruthy();
            expect(sut.IsInState('stateB')).toBeTruthy();

            sut.ClearState('stateA');
            expect(sut.IsInState('stateA')).toBeFalsy();
            expect(sut.IsInState('stateB')).toBeTruthy();

            sut.ClearState('stateB');
            expect(sut.IsInState('stateA')).toBeFalsy();
            expect(sut.IsInState('stateB')).toBeFalsy();
        });

    });
});
