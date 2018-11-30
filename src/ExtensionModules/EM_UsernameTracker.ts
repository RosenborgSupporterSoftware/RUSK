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

    names: Map<number, string> = new Map<number, string>();

    execute = () => {
        var users = document.body.querySelectorAll('tr td span.name b')
        if (!users) return;
        users.forEach(function(elt, idx, parent) {
            var element = elt as HTMLElement;
            var username = element.textContent;
            var row = element.closest("tr") as HTMLTableRowElement;
            var nextrow = row.nextElementSibling as HTMLTableRowElement;
            var links = nextrow.querySelectorAll('td table tr td a');
            // FIXME: something fishy is going on here - the 'table tbody tr td' part is not honored... :-/
            var linkelt = links.item(1) as HTMLAnchorElement; // should be item(0)!
            var link = linkelt.href;
            var userid = parseInt(link.replace(/.*\bu=/g, ""));
            if (!this.names[6500]) this.names[6500] = "Individual 1"; // DEBUG until stored settings
            if (!this.names[6289]) this.names[6289] = "Individual 2"; // DEBUG until stored settings
            if (!this.names[userid]) {
                this.names[userid] = username;
            }
            else if (this.names[userid] && this.names[userid] != username) {
                var span = element.closest('span') as HTMLElement;
                span.insertAdjacentHTML('afterend', '<span class="nav aka' + userid +
                                        '"><br>aka&nbsp;' + this.names[userid] +
                                        '&nbsp;<a title="Thank you RUSK!" class="aka'+userid+'">' +
                                        '<img src="' + chrome.runtime.getURL("/img/checkmark.png") +
                                        '" width="12" height="12" border="0" valign="bottom" /></a></span>');
                var anchor = (span.closest("td") as HTMLTableCellElement).querySelector('a.aka' + userid) as HTMLAnchorElement;
                anchor.addEventListener('click', function(ev) {
                    var spanelts = (span.closest("table") as HTMLTableElement).querySelectorAll('span.aka' + userid);
                    for (var c = 0; c < spanelts.length; ++c) {
                        var spanelt = spanelts.item(c) as HTMLSpanElement;
                        spanelt.style.display = "none";
                    }
                    return true;
                }.bind(this));
            }
            element.setAttribute("data-userid", "" + userid);
            // chrome.runtime.sendMessage({logMessage: "user " + username +
            //                             ", id " + userid});
        }.bind(this));
    }
};