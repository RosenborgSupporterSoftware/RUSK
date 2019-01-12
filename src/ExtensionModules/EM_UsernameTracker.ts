import { ExtensionModule } from "./ExtensionModule";
import { SettingType } from "../Configuration/SettingType";
import { RBKwebPageType } from "../Context/RBKwebPageType";
import { ConfigBuilder } from "../Configuration/ConfigBuilder";
import { ConfigurationOptionVisibility } from "../Configuration/ConfigurationOptionVisibility";
import { ModuleConfiguration } from "../Configuration/ModuleConfiguration";
import { PostInfo } from "../Utility/PostInfo";
import { Log } from "../Utility/Log";
import { PageContext } from "../Context/PageContext";

/**
 * EM_UsernameTracker - Extension module for RBKweb.
 */

export class UsernameTracker implements ExtensionModule {
    readonly name : string = "UsernameTracker";
    cfg: ModuleConfiguration;

    pageTypesToRunOn: Array<RBKwebPageType> = [
        RBKwebPageType.RBKweb_FORUM_POSTLIST
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
            var dictstr = this.cfg.GetSetting("knownUsernames") as string;
            this.names = JSON.parse(dictstr || "{}");
            var count = 0;
            for (var key in this.names) { count += 1; }
            var logmsg = this.name + ": tracking " + count + " account names (" + dictstr.length + " bytes)";
            Log.Debug(logmsg);
            if (dictstr.length > 7500) Log.Warning("UsernameTracker closing in on 8K limit!");
        } catch (e) {
            console.error(this.name + " init failed: " + e.message);
        }

        return null;
    }

    posts: Array<PostInfo>;

    preprocess = (context: PageContext) => {
        try {
            this.posts = context.RUSKPage.items as Array<PostInfo>;
            var updated = false;
            this.posts.forEach(function(post: PostInfo, idx, posts) {
                var username = post.posterNickname;
                var userid = post.posterid;
                if (userid != -1 && !this.names[userid]) {
                    this.names[userid] = username;
                    updated = true;
                }
            }.bind(this));
            if (updated) { // we found some new names
                this.storeKnownUsernames();
            }
        } catch (e) {
            console.error("error finding usernames: " + e.message + " - " + e.stack);
        }
    }

    execute = (context: PageContext) => {
        try {
            this.posts.forEach(function(post: PostInfo, idx, posts) {
                var username = post.posterNickname;
                var userid = post.posterid;
                if (userid == -1) return;
                if (this.names[userid] && this.names[userid] != username) {
                    var spanelt = post.rowElement.querySelector('td span.name') as HTMLSpanElement;
                    spanelt.insertAdjacentHTML('afterend', '<span class="nav aka' + userid +
                                                '"><br>aka&nbsp;' + this.names[userid] +
                                                '&nbsp;<a title="Thank you RUSK!" class="aka'+userid+'">' +
                                                '<img src="' + chrome.runtime.getURL("/img/checkmark.png") +
                                                '" width="12" height="12" border="0" valign="bottom" /></a></span>');
                    var anchor = (spanelt.closest("td") as HTMLTableCellElement).querySelector('a.aka' + userid) as HTMLAnchorElement;
                    anchor.addEventListener('click', function(ev) {
                        var table = spanelt.closest('table') as HTMLTableElement;
                        table.querySelectorAll('span.aka' + userid).forEach(function(elt: HTMLSpanElement, idx, parent) {
                            elt.style.display = 'none';
                        }.bind(this));
                        this.names[userid] = username;
                        this.storeKnownUsernames();
                    }.bind(this));
                }
            }.bind(this));
        } catch (e) {
            console.error("exception: " + e.message + " - " + e.stack);
        }
    }

    invoke = function (cmd: string): boolean {
        return false;
    }

    private storeKnownUsernames(): void {
        var dictstr = JSON.stringify(this.names);
        this.cfg.ChangeSetting("knownUsernames", dictstr);
    }
}