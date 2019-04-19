import { SettingType } from "../Configuration/SettingType";
import { RBKwebPageType } from "../Context/RBKwebPageType";
import { ConfigBuilder } from "../Configuration/ConfigBuilder";
import { ConfigurationOptionVisibility } from "../Configuration/ConfigurationOptionVisibility";
import { ModuleConfiguration } from "../Configuration/ModuleConfiguration";
import { PostInfo } from "../Utility/PostInfo";
import { Log } from "../Utility/Log";
import { PageContext } from "../Context/PageContext";
import { ModuleBase } from "./ModuleBase";
import { RUSKUI } from "../UI/RUSKUI";
import * as LZString from "lz-string";

/**
 * EM_UsernameTracker - Extension module for RBKweb.
 */

export class UsernameTracker extends ModuleBase {
    readonly name : string = "UsernameTracker";

    pageTypesToRunOn: Array<RBKwebPageType> = [
        RBKwebPageType.RBKweb_FORUM_POSTLIST
    ];

    configSpec = () =>
        ConfigBuilder
            .Define()
            .EnabledByDefault()
            .WithExtensionModuleName(this.name)
            .WithDescription('Holder styr på brukernavn')
            .WithDisplayName(this.name)
            .WithConfigOption(opt =>
                opt
                    .WithSettingName("knownUsernames")
                    .WithSettingType(SettingType.text)
                    .WithVisibility(ConfigurationOptionVisibility.Never)
                    .WithDefaultValue('')
            )
            .WithConfigOption(opt =>
                opt
                .WithSettingName("highlightSelfPosts")
                .WithLabel("Uthev egne poster")
                .WithSettingType(SettingType.bool)
                .WithVisibility(ConfigurationOptionVisibility.Always)
                .WithDefaultValue(true)
            )
            .WithConfigOption(opt =>
                opt
                .WithSettingName("highlightSelfPostsColor")
                .WithLabel("Farve for utheving av egne poster")
                .WithSettingType(SettingType.color)
                .WithVisibility(ConfigurationOptionVisibility.Always)
                .WithDefaultValue('#4682b4')
            )
            .WithConfigOption(opt =>
                opt
                .WithSettingName("highlightSelfMentions")
                .WithLabel("Uthev poster som angår deg")
                .WithSettingType(SettingType.bool)
                .WithVisibility(ConfigurationOptionVisibility.Always)
                .WithDefaultValue(true)
            )
            .WithConfigOption(opt =>
                opt
                .WithSettingName("highlightSelfMentionsColor")
                .WithLabel("Farve for utheving av poster som angår deg")
                .WithSettingType(SettingType.color)
                .WithVisibility(ConfigurationOptionVisibility.Always)
                .WithDefaultValue('#B22222')
            )
            .Build();

    names: Map<number, string>;
    highlightSelfPosts: boolean;
    highlightSelfMentions: boolean;

    init = (cfg: ModuleConfiguration) => {
        super.init(cfg);
        this.names = this.getKnownUsernamesConfig();
        this.highlightSelfPosts = this.getHighlightSelfPostsConfig();
        this.highlightSelfMentions = this.getHighlightSelfMentionsConfig();

        let ui = new RUSKUI();
        ui.FetchCSS('usernames.css', new Map([
            ['--selfPostsColor', this._cfg.GetSetting("highlightSelfPostsColor") as string],
            ['--selfPostsLineWidth', this.highlightSelfPosts ? "5px" : "0px"],
            ['--selfMentionsColor', this._cfg.GetSetting("highlightSelfMentionsColor") as string],
            ['--selfMentionsLineWidth', this.highlightSelfMentions ? "5px" : "0px"]
        ]));
        return ui;
    }

    posts: Array<PostInfo>;

    preprocess = (context: PageContext) => {
        try {
            this.posts = context.RUSKPage.items as Array<PostInfo>;
            var updated = false;
            this.posts.forEach(function(post: PostInfo) {
                var username = post.posterNickname;
                var userid = post.posterid;
                if (userid != -1 && !this.names.has(userid)) {
                    this.names.set(userid, username);
                    updated = true;
                }
                post.rowElement.querySelectorAll("table tr td span.genmed b").forEach(function(elt: Element, key: number, parent: NodeListOf<Element>) {
                    var bold = elt as HTMLElement;
                    if (bold.textContent.endsWith(" wrote:") || bold.textContent.endsWith(" skrev:")) {
                        var match = bold.textContent.match(/(.*) (wrote|skrev):/);
                        if (match) {
                            var table = elt.closest('table') as HTMLTableElement;
                            table.classList.add("RUSKQuote");
                            var username = match[1];
                            var verb = match[2];
                            this.names.forEach(function(value: string, key: number, map: Map<number, string>) {
                                if (username == value) table.classList.add("RUSKQuoteUser-" + key);
                            }.bind(this));
                        }
                    }
                }.bind(this));

                if (context.Username) {
                    var postcontent = post.rowElement.querySelector('tr td').nextElementSibling as HTMLTableDataCellElement;
                    var html = postcontent.innerHTML;
                    if (html.includes("@" + context.Username)
                        || html.includes("<b>" + context.Username + " wrote:</b>")
                        || html.includes("<b>" + context.Username + " skrev:</b>"))
                    {
                        // mentions will not track username changes, and stop working for previous usernames
                        post.rowElement.classList.add("RUSKSelfMention");
                    }
                    if (post.posterNickname == context.Username) {
                        post.rowElement.classList.add("RUSKSelfPost");
                    }
                }
            }.bind(this));
            if (updated) { // we found some new names
                this.storeKnownUsernamesConfig();
            }
        } catch (e) {
            console.error("error finding usernames: " + e.message + " - " + e.stack);
        }
    }

    execute = () => {
        try {
            this.posts.forEach(function(post: PostInfo) {
                var username = post.posterNickname;
                var userid = post.posterid;
                if (userid == -1) return;
                if (this.names.has(userid) && this.names.get(userid) != username) {
                    var spanelt = post.rowElement.querySelector('td span.name') as HTMLSpanElement;
                    spanelt.insertAdjacentHTML('afterend', '<span class="nav aka' + userid +
                                                '"><br>aka&nbsp;' + this.names[userid] +
                                                '&nbsp;<a title="Thank you RUSK!" class="aka'+userid+'">' +
                                                '<img src="' + chrome.runtime.getURL("/img/checkmark.png") +
                                                '" width="12" height="12" border="0" valign="bottom" /></a></span>');
                    var anchor = (spanelt.closest("td") as HTMLTableCellElement).querySelector('a.aka' + userid) as HTMLAnchorElement;
                    anchor.addEventListener('click', function() {
                        var table = spanelt.closest('table') as HTMLTableElement;
                        table.querySelectorAll('span.aka' + userid).forEach(function(elt: HTMLSpanElement) {
                            elt.style.display = 'none';
                        }.bind(this));
                        this.names.set(userid, username);
                        this.storeKnownUsernames();
                    }.bind(this));
                }
            }.bind(this));
        } catch (e) {
            console.error("exception: " + e.message + " - " + e.stack);
        }
    }

    private getKnownUsernamesConfig(): Map<number, string> {
        var names = new Map<number, string>();
        try {
            var dictstr = this._cfg.GetSetting("knownUsernames") as string;
            if (dictstr.startsWith("lz:")) {
                var compressed = dictstr.substring(3);
                dictstr = LZString.decompress(compressed);
            }
            var dict = JSON.parse(dictstr || "{}");
            Object.keys(dict).forEach(function(key: string, idx: number, array) {
                names.set(+key, dict[key]);
            }.bind(this));
        } catch (ex) {
            console.error("exception reading usernames: ", ex);
            Log.Error("reading usernames: " + ex.message);
        }
        return names;
    }

    private getHighlightSelfPostsConfig(): boolean {
        return this._cfg.GetSetting("highlightSelfPosts") as boolean;
    }

    private getHighlightSelfMentionsConfig(): boolean {
        return this._cfg.GetSetting("highlightSelfMentions") as boolean;
    }

    private storeKnownUsernamesConfig(): void {
        var dict = {};
        this.names.forEach(function(value: string, key: number, map: Map<number, string>) {
            dict[key] = value;
        }.bind(this));
        var dictstr = JSON.stringify(dict);
        var length = dictstr.length;
        var lengthstr = "" + length + " characters";
        if (length > 1024) {
            var compressed = LZString.compress(dictstr);
            dictstr = "lz:" + compressed;
            lengthstr = "compressed from " + length + " to " + dictstr.length + " characters";
        }
        var logmsg = this.name + ": tracking " + this.names.size + " account names (" + lengthstr + ")";
        Log.Debug(logmsg);
        if (dictstr.length > 7500) Log.Warning("UsernameTracker closing in on 8K limit!");
        this._cfg.ChangeSetting("knownUsernames", dictstr);
    }
}