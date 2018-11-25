/**
 * RBKwebPageType - enum representing the different page types available on RBKweb.
 */

 export enum RBKwebPageType {

    // Forum pages

    RBKweb_FORUM_FORUMLIST,     // http://www.rbkweb.no/forum/index.php
    RBKweb_FORUM_TOPICLIST,     // http://www.rbkweb.no/forum/viewforum.php?f=1
    RBKweb_FORUM_POSTLIST,      // http://www.rbkweb.no/forum/viewtopic.php?t=8423

    RBKweb_FORUM_POSTNEWTOPIC,  // http://www.rbkweb.no/forum/posting.php?mode=newtopic&f=1
    RBKweb_FORUM_REPLYTOTOPIC,  // http://www.rbkweb.no/forum/posting.php?mode=reply&t=2186
    RBKweb_FORUM_EDITPOST,      // http://www.rbkweb.no/forum/posting.php?mode=editpost&p=1013975

    RBKweb_FORUM_PMINBOX,       // http://www.rbkweb.no/forum/privmsg.php?folder=inbox
    RBKweb_FORUM_PMSENTBOX,     // http://www.rbkweb.no/forum/privmsg.php?folder=sentbox
    RBKweb_FORUM_PMOUTBOX,      // http://www.rbkweb.no/forum/privmsg.php?folder=outbox
    RBKweb_FORUM_PMSAVEBOX,     // http://www.rbkweb.no/forum/privmsg.php?folder=savebox

    RBKweb_UNKNOWN_URL,         // This means we're not done yet

    RBKweb_NON_RBKWEB_URL       // How on earth does this even happen?
 }