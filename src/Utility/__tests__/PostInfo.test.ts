/**
 * Tests for PostInfo class
 */

import fs = require('fs');
import path = require('path');
import { PostInfo } from '../PostInfo';

function loadPostPage() {
    let rbkweb = fs.readFileSync(path.resolve(__dirname, '../../Testdata/postpage.html'), 'utf8');
    document.body.innerHTML = rbkweb;
}

describe('PostInfo class', () => {

    describe('GetPostsFromDocument', () => {

        it('gets the correct amount of posts', () => {
            loadPostPage();

            let posts = PostInfo.GetPostsFromDocument(document);
            expect(posts.length).toBe(12);
        });

        
    });
    
    it('gets correct values for properties', () => {
        loadPostPage();
        
        let posts = PostInfo.GetPostsFromDocument(document);
        let fp = posts[0];

        expect(fp.postid).toBe(1029138); 
        expect(fp.itemId).toBe(1029138);
        expect(fp.threadId).toBe(8292);

        expect(fp.postedDate).toEqual(new Date('2019-02-11 14:02'));
        expect(fp.postTextBody.startsWith('Siden det ser ut som')).toBeTruthy();
        expect(fp.postTextBody.endsWith('Grilldress er også en dress:)')).toBeTruthy();
        expect(fp.isUnread).toBeFalsy();
        expect(fp.postTitle).toBe('');

        expect(fp.posterid).toEqual(1920);
        expect(fp.posterNickname).toEqual('Lomaxx');
        expect(fp.posterLocation).toEqual('Telt på wembley');
        expect(fp.posterLevel).toEqual('Veteran');
        expect(fp.posterPosts).toEqual(3172);
        expect(fp.posterRegistered).toEqual(new Date("2006-07-29")); // JS Date is evil
        
        // When running locally the URL is prefixed with localhost like below
        expect(fp.baseUrl).toBe('http://localhost/viewtopic.php?p=1029138#1029138'); 
        expect(fp.quoteUrl).toBe('http://localhost/posting.php?mode=quote&p=1029138');
        expect(fp.editUrl).toBe('http://localhost/posting.php?mode=editpost&p=1029138');
        expect(fp.deleteUrl).toBe('http://localhost/posting.php?mode=delete&p=1029138&sid=e0d470cc3f22552bae4813d6e2d4a33a');
        expect(fp.ipInfoUrl).toBe('http://localhost/modcp.php?mode=ip&p=1029138&t=8292&sid=e0d470cc3f22552bae4813d6e2d4a33a');
    });
});