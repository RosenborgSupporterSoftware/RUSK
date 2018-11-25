/**
 * RBKwebPageType - enum representing the different page types available on RBKweb.
 */

 export enum RBKwebPageType {

    // Forum pages

    RBKweb_ALL,                     // All RBKweb pages

    RBKweb_FORUM_FORUMLIST,         // http://www.rbkweb.no/forum/index.php
    RBKweb_FORUM_TOPICLIST,         // http://www.rbkweb.no/forum/viewforum.php?f=1
    RBKweb_FORUM_POSTLIST,          // http://www.rbkweb.no/forum/viewtopic.php?t=8423

    RBKweb_FORUM_POSTNEWTOPIC,      // http://www.rbkweb.no/forum/posting.php?mode=newtopic&f=1
    RBKweb_FORUM_REPLYTOTOPIC,      // http://www.rbkweb.no/forum/posting.php?mode=reply&t=2186
    RBKweb_FORUM_EDITPOST,          // http://www.rbkweb.no/forum/posting.php?mode=editpost&p=1013975

    RBKweb_FORUM_PM_INBOX,          // http://www.rbkweb.no/forum/privmsg.php?folder=inbox
    RBKweb_FORUM_PM_SENTBOX,        // http://www.rbkweb.no/forum/privmsg.php?folder=sentbox
    RBKweb_FORUM_PM_OUTBOX,         // http://www.rbkweb.no/forum/privmsg.php?folder=outbox
    RBKweb_FORUM_PM_SAVEBOX,        // http://www.rbkweb.no/forum/privmsg.php?folder=savebox
    RBKweb_FORUM_PM_POST,           // http://www.rbkweb.no/forum/privmsg.php?mode=post&u=6500
    RBKweb_FORUM_PM_READINBOX,      // http://www.rbkweb.no/forum/privmsg.php?folder=inbox&mode=read&p=26672

    RBKweb_FORUM_USERPROFILE,       // http://www.rbkweb.no/forum/profile.php?mode=viewprofile&u=6500
    RBKweb_FORUM_SEARCH_BYAUTHOR,   // http://www.rbkweb.no/forum/search.php?search_author=OrionPax

   // Regular RBKweb pages

    RBKweb_MATCH_OVERVIEW,          // http://www.rbkweb.no/kamper2018.php

    // Errors

    RBKweb_UNKNOWN_URL,             // This means we're not done yet

    RBKweb_NON_RBKWEB_URL           // How on earth does this even happen?
 }