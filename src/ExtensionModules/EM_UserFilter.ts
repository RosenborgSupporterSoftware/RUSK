import { SettingType } from "../Configuration/SettingType";
import { RBKwebPageType } from "../Context/RBKwebPageType";
import { ConfigurationOptionVisibility } from "../Configuration/ConfigurationOptionVisibility";
import { PostInfo } from "../Utility/PostInfo";
import { ConfigBuilder } from "../Configuration/ConfigBuilder";
import { ModuleConfiguration } from "../Configuration/ModuleConfiguration";
import { PageContext } from "../Context/PageContext";
import { ModuleBase } from "./ModuleBase";
import { Log } from "../Utility/Log";

/**
 * EM_UserFilter - Extension module for RBKweb.
 */

// FIXME: common preprocessing step with UsernameTracker, SignatureFilter (marking userid
// on username DOM objects)
// FIXME: make SignatureFilter preprocessing/tagging run before UserFilter.execute to treat
// quotes in signatures special (not affected)

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
            .WithConfigOption(opt =>
                opt
                    .WithSettingName("forumQuoteAbusers")
                    .WithSettingType(SettingType.text)
                    .WithVisibility(ConfigurationOptionVisibility.Never)
                    .WithDefaultValue('[]')
            )
            .WithConfigOption(opt =>
                opt
                .WithSettingName("killQuotes")
                .WithLabel("Skjul sitat fra troll")
                .WithSettingType(SettingType.bool)
                .WithVisibility(ConfigurationOptionVisibility.Always)
                .WithDefaultValue(true)
            )
            .WithConfigOption(opt =>
                opt
                .WithSettingName("killAllQuotes")
                .WithLabel("Skjul all sitering")
                .WithSettingType(SettingType.bool)
                .WithVisibility(ConfigurationOptionVisibility.Always)
                .WithDefaultValue(false)
            )
            .WithConfigOption(opt =>
                opt
                .WithSettingName("killKilledQuotePosts")
                .WithLabel("Skjul poster med skult sitering")
                .WithSettingType(SettingType.bool)
                .WithVisibility(ConfigurationOptionVisibility.Always)
                .WithDefaultValue(false)
            )
            .Build();

    posts: Array<PostInfo> = new Array<PostInfo>();
    forumTrolls: Set<number> = new Set<number>();
    forumQuoteAbusers: Set<number> = new Set<number>();
    threadTrolls: Map<string, Object> = new Map<string, Object>();
    killQuotes: boolean = false;
    killAllQuotes: boolean = false;
    killKilledQuotePosts: boolean = false;
    dotdotdotURL: string;

    i18n_no = {
        "Block user": "Blokker bruker",
        "Block user quoting": "Skjul siteringer for bruker",
        "Unblock user quotes": "Vis siteringer for bruker",
        "Thread block 48H": "Blokker i tråd for 2 dager",
        "Unblock": "Stopp blokkering",
    }

    i18n = {}

    tr = (text: string): string => {
        return this.i18n[text] || text;
    }

    BLOCK_MENUITEM: string = "Block user";
    BLOCK_QUOTES_MENUITEM: string = "Block user quoting";
    UNBLOCK_QUOTES_MENUITEM: string = "Unblock user quoting";
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
            this.forumQuoteAbusers = this.getForumQuoteAbusersConfig();
            this.killQuotes = this.getKillQuotesConfig();
            this.killAllQuotes = this.getKillAllQuotesConfig();
            this.killKilledQuotePosts = this.getKillKilledQuotePostsConfig();
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
        // set up filter context menu items for each post
        this.posts.forEach(function (post: PostInfo) {
            try {
                if (this._unblockables.indexOf(post.posterid) > -1)
                    return; // No need for menu items for these guys

                var row = post.rowElement;
                var menu = post.getContextMenu();
                var forumblocked = this.isForumTroll(post.posterid);
                var threadblocked = this.isThreadTroll(post.threadId, post.posterid);
                var blocked = forumblocked || threadblocked;
                menu.addAction(this.tr(this.UNBLOCK_MENUITEM), blocked, function () {
                    if (this.isThreadTroll(post.threadId, post.posterid)) {
                        this.removeThreadTroll(post.threadId, post.posterid);
                        this.storeThreadTrolls();
                    } else {
                        this.removeForumTroll(post.posterid);
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
                    this.addForumTroll(post.posterid);
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
                menu.addAction(this.tr(this.THREADBLOCK_MENUITEM), !blocked, function () {
                    this.addThreadTroll(post.threadId, post.posterid);
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
                var quotesBlocked = this.forumQuoteAbusers.has(post.posterid);
                menu.addAction(this.tr(this.BLOCK_QUOTES_MENUITEM), !quotesBlocked, function() {
                    this.addQuoteAbuser(post.posterid);
                    this.storeForumQuoteAbusers();
                    var cmenu = post.getContextMenu();
                    cmenu.getAction(this.tr(this.BLOCK_QUOTES_MENUITEM)).hide();
                    cmenu.getAction(this.tr(this.UNBLOCK_QUOTES_MENUITEM)).show();
                }.bind(this));
                menu.addAction(this.tr(this.UNBLOCK_QUOTES_MENUITEM), quotesBlocked, function() {
                    this.removeQuoteAbuser(post.posterid);
                    this.storeForumQuoteAbusers();
                    var cmenu = post.getContextMenu();
                    cmenu.getAction(this.tr(this.BLOCK_QUOTES_MENUITEM)).show();
                    cmenu.getAction(this.tr(this.UNBLOCK_QUOTES_MENUITEM)).hide();
                }.bind(this));
            } catch (e) {
                console.error("exception: " + e.message);
            }
        }.bind(this));

        // hide all troll posts, and insert troll buttons
        this.posts.forEach(function (post: PostInfo) {
            try {
                //console.log("poster id: '" + post.posterid + "'");
                var row = post.rowElement;
                var buttons = post.buttonRowElement as HTMLTableRowElement;
                if (this.isForumTroll(post.posterid)
                    || this.isThreadTroll(post.threadId, post.posterid)
                    || (this.killKilledQuotePosts && this.hasQuotedForumTroll(post)))
                {
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
                if (this.isForumTroll(post.posterid)
                    || this.isThreadTroll(post.threadId, post.posterid)
                    || (this.killKilledQuotePosts && this.hasQuotedForumTroll(post)))
                {
                    row.style.display = buttons.style.display = "none";
                }
                else {
                    addition.style.display = "none";
                }
            } catch (e) {
                console.log("UserFilter: " + e.message);
            }
        }.bind(this));

        this.posts.forEach(function(post: PostInfo) {
            this.insertQuoteButtons(post);
        }.bind(this));
    }

    private insertQuoteButtons(post: PostInfo): void {
        post.rowElement.querySelectorAll("table.RUSKQuote").forEach(function(elt: Element, key: number, parent: NodeListOf<Element>) {
            var table = elt as HTMLTableElement;
            if (table.classList.contains("RUSKSignature")) return; // does not work as of now (signature-filter execution order)
            var handle = table.querySelector("tr td span.genmed b") as HTMLElement;
            var match = handle.textContent.match(/(.*) (wrote|skrev):/);
            if (match) {
                var username = match[1];
                var verb = match[2];
                var userid = -1;
                table.classList.forEach(function(value: string, key: number, parent: DOMTokenList) {
                    if (value.startsWith("RUSKQuoteUser-")) userid = +(value.substring(14));
                }.bind(this));

                var inserted = false;
                if (userid != -1 && this.killQuotes &&
                     (this.isForumTroll(userid) || this.isThreadTroll(this.topic, userid))) {
                    table.insertAdjacentHTML('afterend',
                        '<table width="90%" align="center" class="RUSKQuoteUser-' + key + '-Button"><tr><td><span class="nav"><a class="trollbutton">' + username + ' ' + verb + '</a></span></td></tr></table>');
                    inserted = true;
                }
                else if (this.killAllQuotes || this.isQuoteAbuser(post.posterid)) {
                    table.insertAdjacentHTML('afterend',
                        '<table width="90%" align="center" class="RUSKQuote-Button"><tr><td><span class="nav"><a class="trollbutton">' + username + ' ' + verb + '</a></span></td></tr></table>');
                    inserted = true;
                }
                else {
                    table.insertAdjacentHTML('afterend',
                        '<table width="90%" align="center" class="RUSKQuote-Button"><tr><td><span class="nav"><a class="trollbutton">' + username + ' ' + verb + '</a></span></td></tr></table>');
                    var buttontable = table.nextElementSibling as HTMLTableElement;
                    buttontable.style.display = "none";
                    var button = buttontable.querySelector("a") as HTMLAnchorElement;
                    button.addEventListener('click', function(ev) {
                        buttontable.style.display = "none";
                        table.style.display = "";
                    }.bind(this));
                }
                if (inserted) {
                    table.style.display = "none";
                    var buttontable = table.nextElementSibling as HTMLTableElement;
                    var button = buttontable.querySelector("a") as HTMLAnchorElement;
                    button.addEventListener('click', function(ev) {
                        buttontable.style.display = "none";
                        table.style.display = "";
                    }.bind(this));
                }
            }
        }.bind(this));
    }

    private updateQuoteButtons(post: PostInfo): void {
        post.rowElement.querySelectorAll("table.RUSKQuote").forEach(function(elt: Element, key: number, parent: NodeListOf<Element>) {
            var table = elt as HTMLTableElement;
            if (table.classList.contains("RUSKSignature")) return; // does not work as of now (signature-filter execution order)
            var buttontable = table.nextElementSibling as HTMLTableElement;

            var handle = table.querySelector("tr td span.genmed b") as HTMLElement;
            var match = handle.textContent.match(/(.*) (wrote|skrev):/);
            if (match) {
                var username = match[1];
                var verb = match[2];
                var userid = -1;
                table.classList.forEach(function(value: string, key: number, parent: DOMTokenList) {
                    if (value.startsWith("RUSKQuoteUser-")) userid = +(value.substring(14));
                }.bind(this));

                if (userid != -1 && this.killQuotes &&
                     (this.isForumTroll(userid) || this.isThreadTroll(this.topic, userid))) {
                    table.style.display = "none";
                    buttontable.style.display = "";
                }
                else if (this.killAllQuotes || this.isQuoteAbuser(post.posterid)) {
                    table.style.display = "none";
                    buttontable.style.display = "";
                }
                else {
                    table.style.display = "";
                    buttontable.style.display = "none";
                }
            }
        }.bind(this));
    }

    private getForumTrollConfig(): Set<number> {
        var trolls = new Set<number>();
        try {
            var settings = this._cfg.GetSetting("forumTrolls") as string;
            //console.log("loaded forum-trolls: " + settings);
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

    private getForumQuoteAbusersConfig(): Set<number> {
        var abusers = new Set<number>();
        try {
            var settings = this._cfg.GetSetting("forumQuoteAbusers") as string;
            //console.log("loaded forum-quote-abusers: " + settings);
            var abuserids = JSON.parse(settings || "[]");
            abuserids.forEach(function (troll: number) {
                if (this._unblockables.indexOf(+troll) == -1)
                    abusers.add(+troll);
            }.bind(this));
        } catch (e) {
            console.error("getForumQuoteAbusersConfig exception: " + e.message);
        }
        //console.log("returning forumQuoteAbusers = " + JSON.stringify(abusers));
        return abusers;
    }

    private getKillQuotesConfig(): boolean {
        return this._cfg.GetSetting("killQuotes") as boolean;
    }

    private getKillAllQuotesConfig(): boolean {
        return this._cfg.GetSetting("killAllQuotes") as boolean;
    }

    private getKillKilledQuotePostsConfig(): boolean {
        return this._cfg.GetSetting("killKilledQuotePosts") as boolean;
    }

    private getTresholdTime(): number {
        return (new Date()).getTime() - (1000 * 60 * 60 * 24 * 2);
    }

    private isForumTroll(userid: number): boolean {
        return this.forumTrolls.has(userid);
    }

    private hasQuotedForumTroll(post: PostInfo): boolean {
        var quotedTroll = false;
        post.rowElement.querySelectorAll("table.RUSKQuote").forEach(function(elt: Element, key: number, parent: NodeListOf<Element>) {
            elt.classList.forEach(function(value: string, idx: number, classlist: DOMTokenList) {
                if (value.startsWith("RUSKQuoteUser-")) {
                    var userid = +(value.substring(14));
                    if (this.isForumTroll(userid) || this.isThreadTroll(this.topic, userid))
                        quotedTroll = true;
                }
            }.bind(this));
        }.bind(this));
        return quotedTroll;
    }

    private addForumTroll(userid: number): void {
        if (!this.forumTrolls.has(userid)) {
            this.forumTrolls.add(userid);
        }
        Log.Debug("added userid=" + userid + " to forum-trolls");
    }

    private removeForumTroll(userid: number) {
        if (this.forumTrolls.has(userid)) {
            this.forumTrolls.delete(userid);
        }
        Log.Debug("removed userid=" + userid + " from forum-trolls");
    }

    private isThreadTroll(thread: number, userid: number): boolean {
        var threadinfo = {};
        if (this.threadTrolls.has("" + thread))
            threadinfo = this.threadTrolls.get("" + thread);
        if (threadinfo["" + userid] && (threadinfo["" + userid] > this.getTresholdTime()))
            return true;
        return false;
    }

    private isQuoteAbuser(userid: number): boolean {
        return this.forumQuoteAbusers.has(userid);
    }

    private addThreadTroll(thread: number, userid: number) {
        var threadinfo = {};
        if (this.threadTrolls.has("" + thread))
            threadinfo = this.threadTrolls.get("" + thread);
        threadinfo["" + userid] = (new Date()).getTime();
        this.threadTrolls.set("" + thread, threadinfo);
        Log.Debug("added userid=" + userid + " to thread-trolls(threadid=" + thread + ")");
    }

    private removeThreadTroll(thread: number, userid: number) {
        var threadinfo = {};
        if (this.threadTrolls.has("" + thread))
            threadinfo = this.threadTrolls.get("" + thread);
        if (threadinfo["" + userid])
            delete threadinfo["" + userid];
        if (Object.keys(threadinfo).length == 0)
            this.threadTrolls.delete("" + thread);
        else
            this.threadTrolls.set("" + thread, threadinfo);
        Log.Debug("removed userid=" + userid + " from thread-trolls(threadid=" + thread + ")");
    }

    private addQuoteAbuser(userid: number): void {
        if (!this.forumQuoteAbusers.has(userid))
            this.forumQuoteAbusers.add(userid);
        this.posts.forEach(function(post: PostInfo, idx: number, array: PostInfo[]) {
            if (post.posterid == userid) {
                this.updateQuoteButtons(post);
            }
        }.bind(this));
        Log.Debug("added userid=" + userid + " to quote-abusers");
    }

    private removeQuoteAbuser(userid: number): void {
        if (this.forumQuoteAbusers.has(userid))
            this.forumQuoteAbusers.delete(userid);
        this.posts.forEach(function(post: PostInfo, idx: number, array: PostInfo[]) {
            if (post.posterid == userid) {
                this.updateQuoteButtons(post);
            }
        }.bind(this));
        Log.Debug("removed userid=" + userid + " from quote-abusers");
    }

    private storeForumTrolls(): void {
        var items = [];
        this.forumTrolls.forEach(function(troll: number, idx: number, forumTrolls) {
            items.push(troll);
        }.bind(this));
        var settings = JSON.stringify(items);
        //console.log("storing forum-trolls: '" + settings + "'");
        this._cfg.ChangeSetting("forumTrolls", settings);
    }

    private storeForumQuoteAbusers(): void {
        var items = [];
        this.forumQuoteAbusers.forEach(function(abuser: number, idx: number, forumTrolls) {
            items.push(abuser);
        }.bind(this));
        var settings = JSON.stringify(items);
        //console.log("storing forum-quote-abusers: '" + settings + "'");
        this._cfg.ChangeSetting("forumQuoteAbusers", settings);
    }

    private storeThreadTrolls(): void {
        //console.log("storing thread-trolls");
        var setting = {};
        this.threadTrolls.forEach(function(value: Object, key: string) {
            setting[key] = value;
        }.bind(this));
        var dictstr = JSON.stringify(setting);
        //console.log("storing thread-trolls: '" + dictstr + "'");
        this._cfg.ChangeSetting("threadTrolls", dictstr);
    }
}
