/**
 * RBKwebPageType - enum representing the different page types available on RBKweb.
 */

 export enum RBKwebPageType {

    // Forum pages

    RBKweb_ALL,                     // All RBKweb pages

    RBKweb_FORUM_ALL,               // Meta page that matches all forum pages
    RBKweb_FORUM_START,             // Not a page - the start of the forum related values

    RBKweb_FORUM_LOGIN,             // http://www.rbkweb.no/forum/login.php
    RBKweb_FORUM_FORUMLIST,         // http://www.rbkweb.no/forum/index.php
    RBKweb_FORUM_TOPICLIST,         // http://www.rbkweb.no/forum/viewforum.php?f=1 +
                                    // http://www.rbkweb.no/forum/search.php?search_id=newposts
    RBKweb_FORUM_POSTLIST,          // http://www.rbkweb.no/forum/viewtopic.php?t=8423
    RBKweb_FORUM_BOOKMARKS,         // http://www.rbkweb.no/forum/index.php#bookmarks

    RBKweb_FORUM_POSTNEWTOPIC,      // http://www.rbkweb.no/forum/posting.php?mode=newtopic&f=1
    RBKweb_FORUM_REPLYTOTOPIC,      // http://www.rbkweb.no/forum/posting.php?mode=reply&t=2186
    RBKweb_FORUM_EDITPOST,          // http://www.rbkweb.no/forum/posting.php?mode=editpost&p=1013975
    RBKweb_FORUM_VOTEONTOPIC,       // http://www.rbkweb.no/forum/posting.php?mode=vote&t=1
    RBKweb_FORUM_POSTINGLANDINGPAGE,// http://www.rbkweb.no/forum/posting.php
    RBKweb_FORUM_SMILEYS,           // http://www.rbkweb.no/forum/posting.php?mode=smilies
    RBKweb_FORUM_REVIEW_IFRAME,     // http://www.rbkweb.no/forum/posting.php?mode=topicreview
    RBKweb_FORUM_DELETEPOST,        // https://www.rbkweb.no/forum/posting.php?mode=delete&p=1031074
    RBKweb_FORUM_MODCONTROLPANEL,   // https://www.rbkweb.no/forum/modcp.php?t=8585&mode=delete

    RBKweb_FORUM_PM_INBOX,          // http://www.rbkweb.no/forum/privmsg.php?folder=inbox
    RBKweb_FORUM_PM_SENTBOX,        // http://www.rbkweb.no/forum/privmsg.php?folder=sentbox
    RBKweb_FORUM_PM_OUTBOX,         // http://www.rbkweb.no/forum/privmsg.php?folder=outbox
    RBKweb_FORUM_PM_SAVEBOX,        // http://www.rbkweb.no/forum/privmsg.php?folder=savebox
    RBKweb_FORUM_PM_POST,           // http://www.rbkweb.no/forum/privmsg.php?mode=post&u=6500
    RBKweb_FORUM_PM_READINBOX,      // http://www.rbkweb.no/forum/privmsg.php?folder=inbox&mode=read&p=26672

    RBKweb_FORUM_USERPROFILE,       // http://www.rbkweb.no/forum/profile.php?mode=viewprofile&u=6500
    RBKweb_FORUM_USERPROFILE_FORM,  // http://www.rbkweb.no/forum/profile.php?mode=editprofile&u=6500
    RBKweb_FORUM_USERPROFILE_SAVED, // http://www.rbkweb.no/forum/profile.php
    RBKweb_FORUM_SEARCH_FORM,       // http://www.rbkweb.no/forum/search.php
    RBKweb_FORUM_SEARCH_BYAUTHOR,   // http://www.rbkweb.no/forum/search.php?search_author=OrionPax
    RBKweb_FORUM_SEARCH_RESULTS,    // http://www.rbkweb.no/forum/search.php?mode=results

    RBKweb_FORUM_END,               // Not a page - the end of the forum related values

   // Regular RBKweb pages

    RBKweb_FRONTPAGE,               // http://www.rbkweb.no/
    RBKweb_MATCH_OVERVIEW,          // http://www.rbkweb.no/kamper2018.php
    RBKweb_MATCH_OVERVIEW_INDEX,    // http://www.rbkweb.no/arkiv/kamper.shtml
    RBKweb_COPYRIGHT,               // http://www.rbkweb.no/copyright.shtml
    RBKweb_ARTICLE_OVERVIEW,        // http://www.rbkweb.no/nyheter.shtml
    RBKweb_ARTICLE,                 // http://www.rbkweb.no/vis/12345

    // Errors

    RBKweb_UNKNOWN_URL,             // This means we're not done yet

    RBKweb_NON_RBKWEB_URL           // How on earth does this even happen?
 }