import { ExtensionModule } from "./ExtensionModule";
import { SettingType } from "../Configuration/SettingType";
import { RBKwebPageType } from "../Context/RBKwebPageType";
import { ConfigBuilder } from "../Configuration/ConfigBuilder";
import { ConfigurationOptionVisibility } from "../Configuration/ConfigurationOptionVisibility";
import { ModuleConfiguration } from "../Configuration/ModuleConfiguration";

/**
 * EM_UsernameTracker - Extension module for RBKweb.
 */

// FIXME: switch to use PostInfo extraction

export class UsernameTracker implements ExtensionModule {
    readonly name : string = "UsernameTracker";
    cfg: ModuleConfiguration;

    pageTypesToRunOn: Array<RBKwebPageType> = [
        RBKwebPageType.RBKweb_FORUM_POSTLIST // FIXME: only post views
    ];

    runBefore: Array<string> = ['late-extmod'];
    runAfter: Array<string> = ['early-extmod'];

    configSpec = () =>
        ConfigBuilder
            .Define()
            .EnabledByDefault()
            .WithExtensionModuleName(this.name)
            .WithDescription('Varsle endrede brukernavn')
            .WithDisplayName(this.name)
            .WithConfigOption(opt =>
                opt
                    .WithSettingName("knownUsernames")
                    .WithSettingType(SettingType.text)
                    .WithVisibility(ConfigurationOptionVisibility.Never)
                    .WithDefaultValue('')
            )
            .Build();

    names: Map<number, string> = new Map<number, string>();

    init = (config: ModuleConfiguration) => {
        try {
            this.cfg = config;
            var dictstr = this.getConfigItem("knownUsernames");
            this.names = JSON.parse(dictstr || "{}");
            var count = 0;
            for (var key in this.names) { count += 1; }
            var logmsg = this.name + ": tracking " + count + " account names";
            console.log(logmsg);
            chrome.runtime.sendMessage({logMessage: logmsg, level: "debug"});
        } catch (e) {
            console.error(this.name + " init failed: " + e.message);
        }
    }

    preprocess = () => {
        var users = document.body.querySelectorAll('tr td span.name b')
        if (!users) return;
        var updated = false;
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
            element.setAttribute("data-userid", "" + userid);
            if (!this.names[userid]) {
                this.names[userid] = username;
                updated = true;
            }
        }.bind(this));
        if (updated) {
            this.storeKnownUsernames();
        }
    }

    execute = () => {
        var users = document.body.querySelectorAll('tr td span.name b');
        if (!users) return;
        users.forEach(function(elt, idx, parent) {
            var element = elt as HTMLElement;
            var username = element.textContent;
            var userid = parseInt(element.getAttribute("data-userid"));
            if (this.names[userid] && this.names[userid] != username) {
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
                    this.names[userid] = username;
                    this.storeKnownUsernames();
                    return true;
                }.bind(this));
            }
        }.bind(this));
    }

    private getConfigItem(setting: string): string {
        for (let i = 0; i < this.cfg.settings.length; i++) {
            if (this.cfg.settings[i].setting == setting) {
                return this.cfg.settings[i].value as string;
            }
        }
    }

    private storeKnownUsernames(): void {
        var dictstr = JSON.stringify(this.names);
        this.cfg.ChangeSetting("knownUsernames", dictstr);
    }
};