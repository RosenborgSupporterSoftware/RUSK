/**
 * Tests for ForumInfo class
 */

import fs = require('fs');
import path = require('path');
import { ForumInfo } from '../ForumInfo';

function loadForumPage(filename: string) {
    let rbkweb = fs.readFileSync(path.resolve(__dirname, '../../Testdata/' + filename), 'utf8');
    document.body.innerHTML = rbkweb;
}

describe('ForumInfo class', () => {

    describe('GetForumsFromDocument', () => {

        it('parses forums from forum frontpage', () => {
            loadForumPage('forumpage.html');

            let forums = ForumInfo.GetForumsFromDocument(document);

            expect(forums).not.toBeNull();
            expect(forums.length).toBe(8);
            
            expect(forums[0].title).toBe('Sportslig avdeling');
            expect(forums[0].itemId).toBe(1);
            expect(forums[0].description).toBe('Kamper, spillere, trenere, laguttak, overganger.');
            expect(forums[0].baseUrl).toBe('http://localhost/viewforum.php?f=1');
            
            expect(forums[0].isUnread).toBeTruthy();
            expect(forums[2].isUnread).toBeFalsy();
            
            expect(forums[0].latestPoster).toBe('Whoppa');
            expect(forums[0].topics).toBe(3126);
            expect(forums[0].posts).toBe(690998);
            expect(forums[0].lastUpdate).toEqual(new Date('2019-02-19 08:44'));
        });

        it('parses forums from forum subpage', () => {
            loadForumPage('forumsubpage.html');

            let forums = ForumInfo.GetForumsFromDocument(document);

            expect(forums).not.toBeNull();
            expect(forums.length).toBe(3);
            
            expect(forums[0].title).toBe('Fotball generelt');
            expect(forums[0].itemId).toBe(3);
            expect(forums[0].description).toBe('Ikke-rosenborgsk fotball, først og fremst norsk fotball og landslaget.');
            expect(forums[0].baseUrl).toBe('http://localhost/viewforum.php?f=3');
            
            expect(forums[0].isUnread).toBeTruthy();
            expect(forums[2].isUnread).toBeFalsy();
            
            expect(forums[0].latestPoster).toBe('Zorbeltuss');
            expect(forums[0].topics).toBe(705);
            expect(forums[0].posts).toBe(141736);
            expect(forums[0].lastUpdate).toEqual(new Date('2019-02-19 02:17'));
        });

    });
});