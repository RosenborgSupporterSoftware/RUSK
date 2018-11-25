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

        // forum/posting.php?mode=reply&t=1466
        if (url.match(/forum\/posting\.php\?mode=reply&t=\d{1,6}/)) {
            return RBKwebPageType.RBKweb_FORUM_REPLYTOTOPIC;
        }

        // forum/posting.php?mode=editpost&p=1013975
        if (url.match(/forum\/posting\.php\?mode=editpost&p=\d{1,7}/)) {
            return RBKwebPageType.RBKweb_FORUM_EDITPOST;
        }

        // forum/posting.php?mode=newtopic&f=1
        if (url.match(/forum\/posting\.php\?mode=newtopic&f=\d{1,2}/)) {
            return RBKwebPageType.RBKweb_FORUM_POSTNEWTOPIC;
        }

        // forum/privmsg.php?folder=inbox
        if (url.match(/forum\/privmsg\.php\?folder=inbox/)) {
            return RBKwebPageType.RBKweb_FORUM_PMINBOX;
        }

        console.error('UrlParser could not parse forum url ' + url);
        return RBKwebPageType.RBKweb_UNKNOWN_URL;
    }
}
