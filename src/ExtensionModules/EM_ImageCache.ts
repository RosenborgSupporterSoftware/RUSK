import { ExtensionModule } from "./ExtensionModule";
import { ConfigOptions } from "../Configuration/ConfigOptions";
import { SettingType } from "../Configuration/SettingType";
import { RBKwebPageType } from "../Context/RBKwebPageType";

/**
 * EM_ImageCache - Extension module for RBKweb.
 */

export class ImageCache implements ExtensionModule {
    readonly name : string = "ImageCache";

    pageTypesToRunOn: Array<RBKwebPageType> = [
        RBKwebPageType.RBKweb_ALL
    ];

    runBefore: Array<string> = ['late-extmod'];
    runAfter: Array<string> = ['early-extmod'];

    getConfigOptions = (): ConfigOptions => {
        return {
            displayName: "ImageCache",
            options: [
                {
                    setting: "cacheIcons",
                    type: SettingType.bool,
                    label: "Bruk lokalt cachede ikoner"
                }
            ]
        };
    };

    execute = () => {
        var cached = [
            'folder_big.gif',
            'folder_locked_big.gif',
            'folder_new_big.gif',
            'icon_latest_reply.gif',
            'icon_mini_faq.gif',
            'icon_mini_groups.gif',
            'icon_mini_login.gif',
            'icon_mini_members.gif',
            'icon_mini_message.gif',
            'icon_mini_profile.gif',
            'icon_mini_search.gif',
            'icon_mini_statistics.png',
            'whosonline.gif',
            'folder.gif',
            'folder_announce.gif',
            'folder_hot.gif',
            'folder_sticky.gif',
            'msg_inbox.gif',
            'msg_outbox.gif',
            'msg_savebox.gif',
            'msg_sentbox.gif',
            'voting_bar.gif',
            'norwegian/icon_pm.gif',
            'norwegian/icon_profile.gif',
            'norwegian/icon_quote.gif',
            'norwegian/msg_newpost.gif',
            'norwegian/post.gif',
            'norwegian/reply.gif',
            'english/icon_pm.gif',
            'english/icon_profile.gif',
            'english/icon_quote.gif',
            'english/msg_newpost.gif',
            'english/post.gif',
            'english/reply.gif',
        ];

        var imgs = document.body.querySelectorAll("img");
        if (imgs) {
            for (var c = 0; c < imgs.length; ++c) {
                var img = imgs.item(c) as HTMLImageElement;
                var file = img.src;
                if (file) {
                    var match = file.match(/.*\/([^/]*)\/([^/]*)$/);
                    if (match) {
                        var language = match[1];
                        var filename = match[2];
                        if (language.startsWith("lang_"))
                            filename = language.substring(5) + "/" + filename;
                        //chrome.runtime.sendMessage({logMessage: "lang " + language + ", file " + filename});
                        if (cached.findIndex(function(val, idex, arr) { return filename == val; }) != -1) {
                            // chrome.runtime.sendMessage({logMessage: "fetching " + filename + " from extension cache"});
                            img.src = chrome.runtime.getURL("img/" + filename);
                        }
                    }
                }
            }
        }
    };
};



