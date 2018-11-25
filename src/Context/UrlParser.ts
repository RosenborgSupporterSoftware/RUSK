import { RBKwebPageType } from "./RBKwebPageType";

/**
 * A simple utility class that receives an RBKweb URL and returns the appropriate RBKwebPageType enum value
 */

export class UrlParser {

    /** Parse a URL and return the correct RBKwebPageType value */
    ParsePageType(url: string): RBKwebPageType {

        if(url.length == 0)
            return RBKwebPageType.RBKweb_NON_RBKWEB_URL;

        // Check if we're even at RBKweb - extension should not run otherwise, but just for making sure we're catching everything
        let rbkwebMatch = url.match(/https?:\/\/(www\.)?rbkweb\.(no|com)\/(.*)/);
        if (!rbkwebMatch) {
            return RBKwebPageType.RBKweb_NON_RBKWEB_URL;
        }
        var restUrl = rbkwebMatch[rbkwebMatch.length - 1];

        if (restUrl.startsWith('forum/')) {
            // We're at the forum, yay!
            return this.parseForumUrl(restUrl);
        }

        // TODO: Resten av RBKweb

        // Dette må fjernes når denne klassen begynner å bli noenlunde moden
        console.error('UrlParser could not parse url ' + url);
        return RBKwebPageType.RBKweb_UNKNOWN_URL;
    }

    parseForumUrl(url: string): RBKwebPageType {
        if (url == 'forum/index.php') {
            return RBKwebPageType.RBKweb_FORUM_FORUMLIST;
        }

        if (url.match(/forum\/viewforum\.php\?f=\d{1,2}/)) {
            return RBKwebPageType.RBKweb_FORUM_TOPICLIST;
        }

        // TODO: Flere query params vi må ta høyde for?
        if (url.match(/forum\/viewtopic.php\?t=\d{1,6}(&start=\d{1,6})?/)) {
            return RBKwebPageType.RBKweb_FORUM_POSTLIST;
        }

        if (url.startsWith('forum/posting.php?')) {
            return this.parseForumPostingUrl(url.substr(18));
        }

        if (url.startsWith('forum/privmsg.php?')) {
            return this.parseForumPrivmsgUrl(url.substr(18));
        }

        if (url.startsWith('forum/search.php?')) {
            return this.parseForumSearchUrl(url.substr(17));
        }

        if (url.match(/forum\/profile\.php\?mode=viewprofile&u=\d{1,6}/)) {
            return RBKwebPageType.RBKweb_FORUM_USERPROFILE;
        }

        console.error('UrlParser could not parse forum url ' + url);
        return RBKwebPageType.RBKweb_UNKNOWN_URL;
    }

    parseForumSearchUrl(url: string): RBKwebPageType {
        // search_author=LeMond
        if (url.match(/search_author=.+/)) {
            return RBKwebPageType.RBKweb_FORUM_SEARCH_BYAUTHOR;
        }
    }

    parseForumPrivmsgUrl(url: string): RBKwebPageType {

        if (url == 'folder=inbox') {
            return RBKwebPageType.RBKweb_FORUM_PM_INBOX;
        }
        if (url == 'folder=sentbox') {
            return RBKwebPageType.RBKweb_FORUM_PM_SENTBOX;
        }
        if (url == 'folder=outbox') {
            return RBKwebPageType.RBKweb_FORUM_PM_OUTBOX;
        }
        if (url == 'folder=savebox') {
            return RBKwebPageType.RBKweb_FORUM_PM_SAVEBOX;
        }
        if (url.match(/mode=post&u=\d{1,6}/)) {
            return RBKwebPageType.RBKweb_FORUM_PM_POST;
        }

        if (url.match(/folder=inbox&mode=read&p=\d{1,10}/)) {
            return RBKwebPageType.RBKweb_FORUM_PM_READINBOX;
        }

        console.error('UrlParser could not parse forum privmsg url ' + url);
    }

    parseForumPostingUrl(url: string): RBKwebPageType {
        if (url.match(/mode=reply&t=\d{1,6}/)) {
            return RBKwebPageType.RBKweb_FORUM_REPLYTOTOPIC;
        }

        if (url.match(/mode=editpost&p=\d{1,7}/)) {
            return RBKwebPageType.RBKweb_FORUM_EDITPOST;
        }

        if (url.match(/mode=newtopic&f=\d{1,2}/)) {
            return RBKwebPageType.RBKweb_FORUM_POSTNEWTOPIC;
        }

        console.error('UrlParser could not parse forum posting url ' + url);
        return RBKwebPageType.RBKweb_UNKNOWN_URL;
    }
}
