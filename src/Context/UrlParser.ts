import { RBKwebPageType } from "./RBKwebPageType";
import { Log } from "../Utility/Log";

/**
 * A simple utility class that receives an RBKweb URL and returns the appropriate RBKwebPageType enum value
 */

export class UrlParser {

    /** Parse a URL and return the correct RBKwebPageType value */
    ParsePageType(url: string): RBKwebPageType {

        if (url.length == 0)
            return RBKwebPageType.RBKweb_NON_RBKWEB_URL;

        // Check if we're even at RBKweb - extension should not run otherwise, but just for making sure we're catching everything
        let rbkwebMatch = url.match(/https?:\/\/(www\.)?(rbkweb\.(no|com)|rosenborg\.info)\/(.*)/);
        if (!rbkwebMatch) {
            return RBKwebPageType.RBKweb_NON_RBKWEB_URL;
        }
        var restUrl = rbkwebMatch[rbkwebMatch.length - 1];
        var hashPart = restUrl.match(/^([^#]*)#(.*)/);
        var hashArg = "";
        if  (hashPart) {
            hashArg = hashPart[2];
            restUrl = hashPart[1];
        }
        var queryStringMatch = restUrl.match(/^([^?]*)\?(.*)/);
        var queryString = "";
        if (queryStringMatch) {
            restUrl = queryStringMatch[1];
            queryString = queryStringMatch[2];
        }


        if (restUrl == "") // FIXME: proper enum
            return RBKwebPageType.RBKweb_UNKNOWN_URL;

        try {
            if (restUrl.startsWith('forum/')) {
                // We're at the forum, yay!
                return this.parseForumUrl(restUrl, queryString, hashArg);
            }
        } catch (e) {
            chrome.runtime.sendMessage({ module: "UrlParser", message: e.message, exception: e });
        }

        // TODO: Resten av RBKweb
        if (restUrl == "nyheter.shtml")
            return RBKwebPageType.RBKweb_ARTICLE_OVERVIEW;
        if (restUrl.startsWith('vis/'))
            return RBKwebPageType.RBKweb_ARTICLE;

        if (restUrl.match(/^kamper\d{4}(\.php|\.shtml)$/)) {
            return RBKwebPageType.RBKweb_MATCH_OVERVIEW;
        }
        if (restUrl == 'arkiv/kamper.shtml') {
            return RBKwebPageType.RBKweb_MATCH_OVERVIEW_INDEX;
        }
        if (restUrl == 'copyright.shtml') {
            return RBKwebPageType.RBKweb_COPYRIGHT;
        }

        // Dette må fjernes når denne klassen begynner å bli noenlunde moden
        Log.Error('UrlParser could not parse url ' + url);
        return RBKwebPageType.RBKweb_UNKNOWN_URL;
    }

    parseForumUrl(url: string, query: string, hash: string): RBKwebPageType {
        if (url == 'forum/login.php')
            return RBKwebPageType.RBKweb_FORUM_LOGIN;
        if (url == 'forum/' || url == 'forum/index.php')
            return RBKwebPageType.RBKweb_FORUM_FORUMLIST;
        if (url == 'forum/index.php' && hash == "bookmarks")
            return RBKwebPageType.RBKweb_FORUM_BOOKMARKS;

        if (url == 'forum/viewforum.php')
            return RBKwebPageType.RBKweb_FORUM_TOPICLIST;
        if (url == 'forum/search.php' && query.match(/search_id=(newposts|egosearch|unanswered)/))
            return RBKwebPageType.RBKweb_FORUM_TOPICLIST;

        if (url == 'forum/viewtopic.php')
            return RBKwebPageType.RBKweb_FORUM_POSTLIST;

        if (url == 'forum/posting.php')
            return this.parseForumPostingUrl(url, query);

        if (url == 'forum/privmsg.php')
            return this.parseForumPrivmsgUrl(url, query);

        if (url == 'forum/search.php')
            return this.parseForumSearchUrl(url, query);

        if (url == 'forum/profile.php') {
            if (query.match(/mode=viewprofile/))
                return RBKwebPageType.RBKweb_FORUM_USERPROFILE;
            if (query.match(/mode=editprofile/))
                return RBKwebPageType.RBKweb_FORUM_USERPROFILE_FORM;
            if (!query)
                return RBKwebPageType.RBKweb_FORUM_USERPROFILE_SAVED;
        }

        Log.Error('UrlParser could not parse forum url ' + url + '&' + query);
        return RBKwebPageType.RBKweb_UNKNOWN_URL;
    }

    parseForumSearchUrl(url: string, query: string): RBKwebPageType {
        // search_author=LeMond
        if (query.length == 0)
            return RBKwebPageType.RBKweb_FORUM_SEARCH_FORM;
        if (query.match(/search_author=.+/))
            return RBKwebPageType.RBKweb_FORUM_SEARCH_BYAUTHOR;
        if (query.match(/mode=results/))
            return RBKwebPageType.RBKweb_FORUM_SEARCH_RESULTS;
        Log.Error('UrlParser could not parse forum search url ' + url + '&' + query);
        return RBKwebPageType.RBKweb_UNKNOWN_URL;
    }

    parseForumPrivmsgUrl(url: string, query: string): RBKwebPageType {
        if (query.match(/folder=inbox/))
            return RBKwebPageType.RBKweb_FORUM_PM_INBOX;
        if (query.match(/folder=sentbox/))
            return RBKwebPageType.RBKweb_FORUM_PM_SENTBOX;
        if (query.match(/folder=outbox/))
            return RBKwebPageType.RBKweb_FORUM_PM_OUTBOX;
        if (query.match(/folder=savebox/))
            return RBKwebPageType.RBKweb_FORUM_PM_SAVEBOX;
        if (query.match(/mode=post/))
            return RBKwebPageType.RBKweb_FORUM_PM_POST;

        if (query.match(/folder=inbox/) && query.match(/mode=read/))
            return RBKwebPageType.RBKweb_FORUM_PM_READINBOX;

        Log.Error('UrlParser could not parse forum privmsg url ' + url + '&' + query);
        return RBKwebPageType.RBKweb_UNKNOWN_URL;
    }

    parseForumPostingUrl(url: string, query: string): RBKwebPageType {
        if (query.match(/mode=reply/))
            return RBKwebPageType.RBKweb_FORUM_REPLYTOTOPIC;
        if (query.match(/mode=quote/))
            return RBKwebPageType.RBKweb_FORUM_REPLYTOTOPIC;
        if (query.match(/mode=editpost/))
            return RBKwebPageType.RBKweb_FORUM_EDITPOST;
        if (query.match(/mode=newtopic/))
            return RBKwebPageType.RBKweb_FORUM_POSTNEWTOPIC;
        if (query.match(/mode=vote/))
            return RBKwebPageType.RBKweb_FORUM_VOTEONTOPIC;
        if (query.match(/mode=smilies/))
            return RBKwebPageType.RBKweb_FORUM_SMILEYS;
        if (query == "") // after pressing preview
            return RBKwebPageType.RBKweb_FORUM_EDITPOST;

        Log.Error('UrlParser could not parse forum posting url ' + url + '&' + query);
        return RBKwebPageType.RBKweb_UNKNOWN_URL;
    }
}
