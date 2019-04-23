/**
 * Tests for PMInfo class
 */

import fs = require('fs');
import path = require('path');
import { PMInfo } from '../PMInfo';

function loadPMPage() {
    let rbkweb = fs.readFileSync(path.resolve(__dirname, '../../Testdata/pmpage.html'), 'utf8');
    document.body.innerHTML = rbkweb;
}

describe('PMInfo class', () => {

    describe('GetPMsFromDocument', () => {

        it('loads the right number of PMInfo objects', () => {
            loadPMPage();

            let res = PMInfo.GetPMsFromDocument(document);
            expect(res.length).toBe(50);
        });

        it('loads properties on posts correctly', () => {
            loadPMPage();

            let all = PMInfo.GetPMsFromDocument(document);
            let first = all[0];
            let second = all[1];

            expect(first.lastUpdate.getFullYear()).toBe(2019);
            expect(first.lastUpdate.getMonth()).toBe(4);
            expect(first.lastUpdate.getDate()).toBe(11);
            expect(first.lastUpdate.getHours()).toBe(23);
            expect(first.lastUpdate.getMinutes()).toBe(51);
            expect(first.subject).toBe('Re: Wookie Nation');
            expect(first.itemId).toBe(27117);
            expect(first.isMarked).toBe(false);
            expect(first.isUnread).toBe(true);
            expect(first.url).toBe('https://www.rbkweb.no/forum/privmsg.php?folder=inbox&mode=read&p=27117');

            expect(second.lastUpdate.getFullYear()).toBe(2019);
            expect(second.lastUpdate.getMonth()).toBe(4);
            expect(second.lastUpdate.getDate()).toBe(11);
            expect(second.lastUpdate.getHours()).toBe(19);
            expect(second.lastUpdate.getMinutes()).toBe(48);
            expect(second.subject).toBe('Wookie Nation');
            expect(second.itemId).toBe(27113);
            expect(second.isMarked).toBe(true);
            expect(second.isUnread).toBe(false);
            expect(second.url).toBe('https://www.rbkweb.no/forum/privmsg.php?folder=inbox&mode=read&p=27113');
        });

    });

});
