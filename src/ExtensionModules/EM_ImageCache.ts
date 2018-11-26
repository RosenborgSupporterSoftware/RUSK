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
            'whosonline.gif'
        ];

        var imgs = document.body.querySelectorAll("img");
        if (imgs) {
            for (var c = 0; c < imgs.length; ++c) {
                var img = imgs.item(c) as HTMLImageElement;
                var file = img.src;
                if (file) {
                    var match = file.match(/.*\/([^/]*)$/);
                    if (match) {
                        var filename = match[1];
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



