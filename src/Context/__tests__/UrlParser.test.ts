import { UrlParser } from '../UrlParser';
import { RBKwebPageType } from '../RBKwebPageType';

/**
 * Tests to keep UrlParser honest
 * This is in a state of perpetual incompleteness - test cases will be
 * added when problems - and missing pages - are noticed.
 */

describe('UrlParser', function() {
    describe('ParsePageType', function() {

        describe('Invalid input', () => {
            it('handles empty string correctly', () => {
                let res = new UrlParser().ParsePageType('');
                expect(res).toBe(RBKwebPageType.RBKweb_NON_RBKWEB_URL);
            });
    
            it('handles null correctly', () => {
                let res = new UrlParser().ParsePageType(null);
                expect(res).toBe(RBKwebPageType.RBKweb_NON_RBKWEB_URL);
            });
        });

        describe('Non-RBKweb URLs', () => {
            it('handles non-RBKweb URLs correctly', () => {
                let res = new UrlParser().ParsePageType('https://www.rbk.no/');
                expect(res).toBe(RBKwebPageType.RBKweb_NON_RBKWEB_URL);
            });
        });

        describe('Regular RBKweb pages', () => {
            it('handles RBKweb frontpage', () => {
                let res = new UrlParser().ParsePageType('https://rbkweb.no/');
                expect(res).toBe(RBKwebPageType.RBKweb_FRONTPAGE);
            });

            it('handles RBKweb articles page', () => {
                let res = new UrlParser().ParsePageType('http://www.rbkweb.no/nyheter.shtml');
                expect(res).toBe(RBKwebPageType.RBKweb_ARTICLE_OVERVIEW);
            });

            it('handles RBKweb article page', () => {
                let res = new UrlParser().ParsePageType('https://www.rbkweb.no/vis/12345');
                expect(res).toBe(RBKwebPageType.RBKweb_ARTICLE);
            });
        });

        describe('RBKweb forum pages', () => {
            it('handles post delete page', () => {
                let res = new UrlParser().ParsePageType(
                    'https://www.rbkweb.no/forum/posting.php?mode=delete&p=1031074'
                );
                expect(res).toBe(RBKwebPageType.RBKweb_FORUM_DELETEPOST);
            });

            it('understands moderator control panel', () => {
                // 
                let res = new UrlParser().ParsePageType(
                    'https://www.rbkweb.no/forum/modcp.php?t=8585&mode=delete'
                );
                expect(res).toBe(RBKwebPageType.RBKweb_FORUM_MODCONTROLPANEL);
            });
        });
    });
});
