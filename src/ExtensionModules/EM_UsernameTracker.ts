import { ExtensionModule } from "./ExtensionModule";
import { ConfigOptions } from "../Configuration/ConfigOptions";
import { SettingType } from "../Configuration/SettingType";
import { RBKwebPageType } from "../Context/RBKwebPageType";

/**
 * EM_UsernameTracker - Extension module for RBKweb.
 */

// FIXME: common preprocessing step with TrollFilter (marking userid on username DOM objects)

export class UsernameTracker implements ExtensionModule {
    readonly name : string = "UsernameTracker";

    pageTypesToRunOn: Array<RBKwebPageType> = [
        RBKwebPageType.RBKweb_FORUM_ALL // FIXME: only post views
    ];

    runBefore: Array<string> = ['late-extmod'];
    runAfter: Array<string> = ['early-extmod'];

    getConfigOptions = (): ConfigOptions => {
        return {
            displayName: "UsernameTracker",
            options: [
                {
                    setting: "trackUsernames",
                    type: SettingType.bool,
                    label: "Varsle endrede brukernavn"
                },
                { // this is a config the users probably shouldn't see or know about.
                    setting: "knownUsernames",
                    type: SettingType.text,
                    label: "Kjente brukernavn"
                }
            ]
        }
    };

    execute = () => {
        var users = document.body.querySelectorAll('tr td span.name b')
        if (!users) return;
        users.forEach(function(elt, idx, parent) {
            var element = elt as HTMLElement;
            var row = element.closest("tr") as HTMLTableRowElement;
            var nextrow = row.nextElementSibling as HTMLTableRowElement;
            var links = nextrow.querySelectorAll('td table tbody tr td a');
            // FIXME: something fishy is going on here - the 'table tbody tr td' part is not honored... :-/
            var linkelt = links.item(1) as HTMLAnchorElement;
            var link = linkelt.href;
            var userid = link.replace(/.*\bu=/g, "");
            element.setAttribute("data-userid", userid);
            // chrome.runtime.sendMessage({logMessage: "user " + element.textContent + ", id " + userid});
        });
    }
};