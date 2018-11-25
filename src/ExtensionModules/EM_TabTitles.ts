import { ExtensionModule } from "./ExtensionModule";
import { ConfigOptions } from "../Configuration/ConfigOptions";
import { SettingType } from "../Configuration/SettingType";
import { RBKwebPageType } from "../Context/RBKwebPageType";

/**
 * EM_TabTitle - Extension module for RBKweb.
 */

export class TabTitles implements ExtensionModule {
    readonly name : string = "Fanetittel";

    pageTypesToRunOn: Array<RBKwebPageType> = [
        RBKwebPageType.RBKweb_ALL
    ];

    runBefore: Array<string> = ['late-extmod'];
    runAfter: Array<string> = ['early-extmod'];

    getConfigOptions = (): ConfigOptions => {
        return {
            displayName: "Fanetittel",
            options: [
                {
                    setting: "shortenTitles",
                    type: SettingType.bool,
                    label: "Fjern fanetittel prefix"
                }
            ]
        }
    };

    execute = () => {
        chrome.runtime.sendMessage({logMessage: "kampoversikt execute()"});
        var elt = document.querySelector('head title');
        if (elt != null) {
            var title = elt.textContent;
            var newtitle = "";
            if (title.indexOf("RBKweb - View topic - ") == 0)
                newtitle = title.substr(22);
            else if (title.indexOf("RBKweb - View Forum - ") == 0)
                newtitle = title.substr(22);
            else if (title.indexOf("RBKweb - Index") == 0)
                newtitle = "Index";
            else if (title.indexOf("RBKweb - Search") == 0)
                newtitle = "Search";
            //else
            //    chrome.runtime.sendMessage({logMessage: "unchanged title '" + title + "'."});
            if (newtitle != "") {
                chrome.runtime.sendMessage({logMessage: "changing title from '" + title + "' to '" + newtitle + "'."});
                elt.textContent = newtitle;
            }
        }

    }
};