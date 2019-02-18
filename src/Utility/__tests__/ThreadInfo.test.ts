/**
 * Tests for ThreadInfo class
 */

import fs = require('fs');
import path = require('path');
import { ThreadInfo } from '../ThreadInfo';
import { ThreadType } from '../../Context/ThreadType';

function loadPostPage(filename: string) {
    let rbkweb = fs.readFileSync(path.resolve(__dirname, '../../Testdata/' + filename), 'utf8');
    document.body.innerHTML = rbkweb;
}

describe('ThreadInfo class', () => {

    describe('GetThreadsFromDocument', () => {

        it('parses the expected threads from threadlist page', () => {
            loadPostPage('threadpage.html');

            let threads = ThreadInfo.GetThreadsFromDocument(document);
            expect(threads.length).toBe(52);
            expect(threads[4].threadid).toBe(2101);
            expect(threads[4].itemId).toBe(2101);
            expect(threads[5].url).toBe('http://localhost/viewtopic.php?t=8555&view=newest');
            expect(threads[9].baseUrl).toBe('http://localhost/viewtopic.php?t=1111');
            expect(threads[4].latestPageUrl).toBe('http://localhost/viewtopic.php?t=2101&start=700');
            expect(threads[4].lastPostUrl).toBe('http://localhost/viewtopic.php?p=1006784#1006784');
            
            expect(threads[4].isUnread).toBeFalsy();
            expect(threads[5].isUnread).toBeTruthy();
            
            expect(threads[0].threadType).toBe(ThreadType.Announcement);
            expect(threads[2].threadType).toBe(ThreadType.Sticky);
            expect(threads[5].threadType).toBe(ThreadType.Normal);

            // TODO: Få tak i en side med isLocked og test det.
            // TODO: Samme med poll
            // TODO: Og threadAttributes

            expect(threads[4].title).toBe('Videofiler');
            expect(threads[5].threadStarter).toBe('2mas');
            expect(threads[5].latestPoster).toBe('Henning');
            expect(threads[6].numberOfPages).toBe(8);
            expect(threads[6].replies).toBe(177);
            expect(threads[1].views).toBe(134149);
            expect(threads[0].lastUpdate).toEqual(new Date('2018-05-24 20:38'));
            expect(threads[0].forumId).toBe(11);
            expect(threads[0].forumName).toBe('På sidelinja');
        });

        it('parses the expected threads from the newposts page', () => {
            loadPostPage('newposts.html');

            let threads = ThreadInfo.GetThreadsFromDocument(document);

            expect(threads.length).toBe(5);

            expect(threads[4].threadid).toBe(8555);
            expect(threads[4].itemId).toBe(8555);
            expect(threads[0].url).toBe('http://localhost/viewtopic.php?t=7618&start=5675');
            expect(threads[0].baseUrl).toBe('http://localhost/viewtopic.php?t=7618&view=newest');
            expect(threads[0].latestPageUrl).toBe('http://localhost/viewtopic.php?t=7618&start=5675');
            expect(threads[0].lastPostUrl).toBe('http://localhost/viewtopic.php?p=1029419#1029419');

            expect(threads[0].isUnread).toBeTruthy();
            expect(threads[1].isUnread).toBeFalsy();

            // TODO: Threadtype

            expect(threads[0].title).toBe('Nicklas Bendtner');
            expect(threads[1].title).toBe('Nils Arne Eggen');
            expect(threads[3].threadStarter).toBe('Hedon');
            expect(threads[3].latestPoster).toBe('OrionPax');
            expect(threads[0].numberOfPages).toBe(228);
            expect(threads[0].replies).toBe(5679);
            expect(threads[0].views).toBe(1395109);
            expect(threads[1].lastUpdate).toEqual(new Date('2019-02-15 10:32'));
            expect(threads[0].forumId).toBe(1);
            expect(threads[0].forumName).toBe('Sportslig avdeling');
        });
    });

});
