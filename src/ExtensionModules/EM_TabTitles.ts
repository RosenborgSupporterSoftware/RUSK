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
            displayName: "TabTitles",
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
        var titleelt = document.querySelector('head title');
        if (titleelt != null) {
            var title = titleelt.textContent;
            if (title.startsWith("RBKweb - View topic - "))
                titleelt.textContent = title.substr(22);
            else if (title.startsWith("RBKweb - View Forum - "))
                titleelt.textContent = title.substr(22);
            else if (title.startsWith("RBKweb - Index"))
                titleelt.textContent = "Index";
            else if (title.startsWith("RBKweb - Search"))
                titleelt.textContent = "Search";
            else if (title.startsWith("RBKweb - Private Messaging"))
                titleelt.textContent = "Private Messaging";
            else if (title.startsWith("RBKweb - Send private message"))
                titleelt.textContent = "Send private message";
            else if (title.startsWith("RBKweb - Read message"))
                titleelt.textContent = "Read message";
            else if (title.indexOf("RBKweb - Kamper sesongen ") != -1)
                titleelt.textContent = title.substring(title.indexOf(" - ")+3);
        }
    }
};