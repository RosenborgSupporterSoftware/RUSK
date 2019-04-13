import { SettingType } from "../Configuration/SettingType";
import { RBKwebPageType } from "../Context/RBKwebPageType";
import { ConfigurationOptionVisibility } from "../Configuration/ConfigurationOptionVisibility";
import { PostInfo } from "../Utility/PostInfo";
import { ConfigBuilder } from "../Configuration/ConfigBuilder";
import { ModuleConfiguration } from "../Configuration/ModuleConfiguration";
import { PageContext } from "../Context/PageContext";
import { ModuleBase } from "./ModuleBase";

/**
 * EM_UserFilter - Extension module for RBKweb.
 */

// FIXME: common preprocessing step with UsernameTracker, SignatureFilter (marking userid
// on username DOM objects)

export class UserFilter extends ModuleBase {
    readonly name: string = "UserFilter";
    private _unblockables: Array<number> = [
        2,      // 2mas
        26,     // Hedon
        31,     // haavarl
        648,    // Harald
        1177,   // Troilonge
        1190,   // attach
        2120,   // Kjello
        6289,   // larsarus
        6500,   // OrionPax
        8235,   // Putte
        8674,   // RUSK
    ];

    pageTypesToRunOn: Array<RBKwebPageType> = [
        RBKwebPageType.RBKweb_FORUM_POSTLIST // FIXME: only post views
    ];

    configSpec = () =>
        ConfigBuilder
            .Define()
            .EnabledByDefault()
            .WithExtensionModuleName(this.name)
            .WithDisplayName("Brukerfiltrering")
            .WithDescription("Denne modulen filtrerer forumbrukere")
            .WithConfigOption(opt =>
                opt
                    .WithSettingName("forumTrolls")
                    .WithSettingType(SettingType.text)
                    .WithVisibility(ConfigurationOptionVisibility.Never)
                    .WithDefaultValue('[]')
            )
            .WithConfigOption(opt =>
                opt
                    .WithSettingName("threadTrolls")
                    .WithSettingType(SettingType.text)
                    .WithVisibility(ConfigurationOptionVisibility.Never)
                    .WithDefaultValue('{}')
            )
            .Build();

    posts: Array<PostInfo> = new Array<PostInfo>();
    forumTrolls: Set<number> = new Set<number>();
    threadTrolls: Map<string, Object> = new Map<string, Object>();
    dotdotdotURL: string;

    i18n_no = {
        "Block user": "Blokker bruker",
        "Thread block 48H": "Blokker i tråd for 2 dager",
        "Unblock": "Stopp blokkering",
    }

    i18n = {}

    tr = (text: string): string => {
        return this.i18n[text] || text;
    }

    BLOCK_MENUITEM: string = "Block user";
    THREADBLOCK_MENUITEM: string = "Thread block 48H";
    UNBLOCK_MENUITEM: string = "Unblock";

    css_template: string;
    css: string;

    rendered: boolean;

    init = (config: ModuleConfiguration) => {
        super.init(config);
        try {
            this.rendered = false;
            this.forumTrolls = this.getForumTrollConfig();
            this.threadTrolls = this.getThreadTrollConfig();
            this.dotdotdotURL = chrome.runtime.getURL("/img/dotdotdot.png");
        } catch (e) {
            console.log("init exception: " + e.message);
        }

        return null;
    }

    preprocess = (context: PageContext) => {
        this.posts = context.RUSKPage.items as Array<PostInfo>;
        if (context.Language == "norwegian") this.i18n = this.i18n_no;
    }

    execute = () => {
        // mark each username with red/orange/green
        this.posts.forEach(function (post: PostInfo) {
            try {
                if (this._unblockables.indexOf(post.posterid) > -1) return; // No need for menu items for these guys

                var row = post.rowElement;
                var menu = post.getContextMenu();
                var threadblocked = this.isThreadTroll("" + post.threadId, "" + post.posterid);
                var blocked = this.forumTrolls.has(post.posterid);
                menu.addAction(this.tr(this.UNBLOCK_MENUITEM), blocked, function () {
                    if (this.isThreadTroll("" + post.threadId, "" + post.posterid)) {
                        this.removeThreadTroll("" + post.threadId, "" + post.posterid);
                        this.storeThreadTrolls();
                    } else {
                        this.forumTrolls.delete(post.posterid);
                        this.storeForumTrolls();
                    }
                    this.posts.forEach(function (other: PostInfo) {
                        if (other.posterid == post.posterid) {
                            other.rowElement.style.display = "";
                            other.buttonRowElement.style.display = "";
                            (other.buttonRowElement.nextElementSibling as HTMLTableRowElement).style.display = "none";
                            var cmenu = other.getContextMenu();
                            cmenu.getAction(this.tr(this.UNBLOCK_MENUITEM)).hide();
                            cmenu.getAction(this.tr(this.BLOCK_MENUITEM)).show();
                            cmenu.getAction(this.tr(this.THREADBLOCK_MENUITEM)).show();
                        }
                    }.bind(this));
                }.bind(this));
                menu.addAction(this.tr(this.BLOCK_MENUITEM), !blocked, function () {
                    this.forumTrolls.add(post.posterid);
                    this.storeForumTrolls();
                    this.posts.forEach(function (other: PostInfo) {
                        if (other.posterid == post.posterid) {
                            other.rowElement.style.display = "none";
                            other.buttonRowElement.style.display = "none";
                            (other.buttonRowElement.nextElementSibling as HTMLTableRowElement).style.display = "";
                            var cmenu = other.getContextMenu();
                            cmenu.getAction(this.tr(this.BLOCK_MENUITEM)).hide();
                            cmenu.getAction(this.tr(this.THREADBLOCK_MENUITEM)).hide();
                            cmenu.getAction(this.tr(this.UNBLOCK_MENUITEM)).show();
                        }
                    }.bind(this));
                }.bind(this));
                menu.addAction(this.tr(this.THREADBLOCK_MENUITEM), !threadblocked, function () {
                    this.addThreadTroll("" + post.threadId, "" + post.posterid);
                    this.storeThreadTrolls();
                    this.posts.forEach(function (other: PostInfo) {
                        if (other.posterid == post.posterid) {
                            other.rowElement.style.display = "none";
                            other.buttonRowElement.style.display = "none";
                            (other.buttonRowElement.nextElementSibling as HTMLTableRowElement).style.display = "";
                            var cmenu = other.getContextMenu();
                            cmenu.getAction(this.tr(this.BLOCK_MENUITEM)).hide();
                            cmenu.getAction(this.tr(this.THREADBLOCK_MENUITEM)).hide();
                            cmenu.getAction(this.tr(this.UNBLOCK_MENUITEM)).show();
                        }
                    }.bind(this));
                }.bind(this));
            } catch (e) {
                console.error("exception: " + e.message);
            }
        }.bind(this));

        // hide all troll posts, and insert troll buttons
        this.posts.forEach(function (post: PostInfo) {
            try {
                //console.log("poster id: '" + post.posterid + "'");
                var posterid = post.posterid;
                var row = post.rowElement;
                var buttons = post.buttonRowElement as HTMLTableRowElement;
                if (this.forumTrolls.has(posterid) || this.isThreadTroll("" + post.threadId, "" + posterid)) {
                    buttons.insertAdjacentHTML('afterend', '<tr>' +
                        '<td class="row2" colspan="2">' +
                        '<a class="nav trollbutton" id="' + post.postid + '">' + post.posterNickname + '</a>' +
                        '</td></tr>');
                } else {
                    buttons.insertAdjacentHTML('afterend', '<tr>' +
                        '<td class="row2" colspan="2">' +
                        '<a class="nav trollbutton">' + post.posterNickname + '</a>' +
                        '</td></tr>');
                }
                var addition = buttons.nextElementSibling as HTMLTableRowElement;
                var button = addition.querySelector("a") as HTMLAnchorElement;
                button.addEventListener("click", function () {
                    row.style.display = "";
                    buttons.style.display = "";
                    addition.style.display = "none";
                }.bind(this));
                if (this.forumTrolls.has(posterid) || this.isThreadTroll("" + post.threadId, "" + posterid))
                    row.style.display = buttons.style.display = "none";
                else
                    addition.style.display = "none";
            } catch (e) {
                console.log("UserFilter: " + e.message);
            }

        }.bind(this));

    }

    private getForumTrollConfig(): Set<number> {
        var trolls = new Set<number>();
        try {
            var settings = this._cfg.GetSetting("forumTrolls") as string;
            //console.log("loaded forumTrolls: " + settings);
            var trollids = JSON.parse(settings || "[]");
            trollids.forEach(function (troll: number) {
                if(this._unblockables.indexOf(+troll) == -1)
                    trolls.add(+troll);
            }.bind(this));
        } catch (e) {
            console.error("getForumTrollConfig exception: " + e.message);
        }
        //console.log("returning forumTrolls = " + JSON.stringify(trolls));
        return trolls;
    }

    private getThreadTrollConfig(): Map<string, Object> {
        var threadtrolls = new Map<string, Object>();
        try {
            var threadtrollstr = this._cfg.GetSetting("threadTrolls") as string;
            //console.log("loaded thread-trolls: " + threadtrollstr);
            var config = JSON.parse(threadtrollstr);
            var treshold = this.getTresholdTime();
            var filtered = false;
            Object.keys(config).forEach(function (threadid: string, idx: number, array) {
                var threadinfo = {};
                Object.keys(config[threadid]).forEach(function (troll: string, idx: number, array) {
                    var timestamp = +(config[threadid][troll]);
                    if (timestamp < treshold)
                        filtered = true;
                    else
                        threadinfo[troll] = timestamp;
                }.bind(this));
                threadtrolls.set(threadid, threadinfo);
            }.bind(this));
            if (filtered) this.storeThreadTrolls();
        } catch (e) {
            console.error('loading thread troll info: ' + e.message);
        }
        return threadtrolls;
    }

    private getTresholdTime(): number {
        return (new Date()).getTime() - (1000 * 60 * 60 * 24 * 2);
    }

    private isThreadTroll(thread: string, userid: string): boolean {
        var threadinfo = {};
        if (this.threadTrolls.has(thread))
            threadinfo = this.threadTrolls.get(thread);
        if (threadinfo[userid] && (threadinfo[userid] > this.getTresholdTime()))
            return true;
        return false;
    }

    private addThreadTroll(thread: string, userid: string) {
        var threadinfo = {};
        if (this.threadTrolls.has(thread))
            threadinfo = this.threadTrolls.get(thread);
        threadinfo[userid] = (new Date()).getTime();
        this.threadTrolls.set(thread, threadinfo);
    }

    private removeThreadTroll(thread: string, userid: string) {
        var threadinfo = {};
        if (this.threadTrolls.has(thread))
            threadinfo = this.threadTrolls.get(thread);
        if (threadinfo[userid])
            delete threadinfo[userid];
        if (Object.keys(threadinfo).length == 0)
            this.threadTrolls.delete(thread);
        else
            this.threadTrolls.set(thread, threadinfo);
    }

    private storeForumTrolls(): void {
        var items = [];
        this.forumTrolls.forEach(function (troll: string, idx: number, forumTrolls) {
            items.push(+troll);
        }.bind(this));
        var settings = JSON.stringify(items);
        //console.log("storing forumTrolls: '" + settings + "'");
        this._cfg.ChangeSetting("forumTrolls", settings);
    }

    private storeThreadTrolls(): void {
        var setting = {};
        this.threadTrolls.forEach(function (value: Object, key: string) {
            setting[key] = value;
        })
        var dictstr = JSON.stringify(setting);
        //console.log("storing threadTrolls: '" + dictstr + "'");
        this._cfg.ChangeSetting("threadTrolls", dictstr);
    }
}
