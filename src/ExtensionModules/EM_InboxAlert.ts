import { ExtensionModule } from "./ExtensionModule";
import { ConfigOptions } from "../Configuration/ConfigOptions";
import { SettingType } from "../Configuration/SettingType";
import { RBKwebPageType } from "../Context/RBKwebPageType";

/**
 * EM_InboxAlert - Extension module for RBKweb.
 */

export class InboxAlert implements ExtensionModule {
    readonly name : string = "InboxAlert";

    pageTypesToRunOn: Array<RBKwebPageType> = [
        RBKwebPageType.RBKweb_FORUM_START,
        RBKwebPageType.RBKweb_FORUM_FORUMLIST,
        RBKwebPageType.RBKweb_FORUM_TOPICLIST,
        RBKwebPageType.RBKweb_FORUM_POSTLIST,
        RBKwebPageType.RBKweb_FORUM_POSTNEWTOPIC,
        RBKwebPageType.RBKweb_FORUM_REPLYTOTOPIC,
        RBKwebPageType.RBKweb_FORUM_EDITPOST,
        RBKwebPageType.RBKweb_FORUM_USERPROFILE,
        RBKwebPageType.RBKweb_FORUM_SEARCH_BYAUTHOR,
    ];

    runBefore: Array<string> = ['late-extmod'];
    runAfter: Array<string> = ['early-extmod'];

    getConfigOptions = (): ConfigOptions => {
        return {
            displayName: "InboxAlert",
            options: [
                {
                    setting: "alertHeaderPM",
                    type: SettingType.bool,
                    label: "Legg inn ekstra alert om PM"
                }
            ]
        };
    };

    execute = () => {
        var icon = document.body.querySelector('img[src$="icon_mini_message.gif"]') as HTMLImageElement;
        if (icon) {
            var alt = icon.alt;
            if (!(alt == "You have no new messages" ||
                  alt == "Du har ingen nye meldinger" ||
                  alt == "Du hast keine neuen Nachrichten." ||
                  alt == "Log in to check your private messages")) {
                var table = icon.closest("table") as HTMLTableElement;
                var parent = table.parentElement;
                table.insertAdjacentHTML("afterend",
                    '<div class="pmalert" width="100%" align="center">' +
                    '<br><a href="privmsg.php?folder=inbox">DU HAR ULESTE PRIVATE MELDINGER</a><br><br>' +
                    '</div>');
            }
        }

    };
};