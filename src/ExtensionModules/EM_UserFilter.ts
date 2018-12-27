import { ExtensionModule } from "./ExtensionModule";
import { SettingType } from "../Configuration/SettingType";
import { RBKwebPageType } from "../Context/RBKwebPageType";
import { ConfigurationOptionVisibility } from "../Configuration/ConfigurationOptionVisibility";
import { PostInfo } from "../Utility/PostInfo";
import { ConfigBuilder } from "../Configuration/ConfigBuilder";
import { ModuleConfiguration } from "../Configuration/ModuleConfiguration";
import { PageContext } from "../Context/PageContext";

/**
 * EM_UserFilter - Extension module for RBKweb.
 */

// FIXME: common preprocessing step with UsernameTracker, SignatureFilter (marking userid
// on username DOM objects)

export class UserFilter implements ExtensionModule {
    readonly name : string = "UserFilter";
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
        try {
            this.cfg = config;
            this.rendered = false;
            this.forumTrolls = this.getForumTrollConfig();
            this.threadTrolls = this.getThreadTrollConfig();
            this.dotdotdotURL = chrome.runtime.getURL("/img/dotdotdot.png");

            fetch(chrome.runtime.getURL("/data/contextMenu.css")).then(function(response) {
                return response.text();
            }.bind(this)).then(function(text) {
                let css = this.hydrateTemplate(text);
                this.css_template = css;
                //console.log("css: " + css);
                this.css = css;
                if (this.rendered)
                    chrome.runtime.sendMessage({ css: this.css, from: 'UserFilter' });
            }.bind(this));
        } catch (e) {
            console.log("init exception: " + e.message);
        }
    }

    preprocess = (context: PageContext) => {
        try {
            this.posts = context.RUSKPage.items as Array<PostInfo>;
            if (this.css)
                chrome.runtime.sendMessage({ css: this.css, from: 'UserFilter' });
            else {
                //console.log('no css loaded yet');
                this.rendered = true;
            }
        } catch (e) {
            console.error("UserFilter.preprocess: " + e.message);
        }
        var pbutton = document.body.querySelector('span.mainmenu a.mainmenu[href^="profile.php?mode=editprofile"]') as HTMLAnchorElement;
        if (pbutton.textContent == "Profil")
            this.i18n = this.i18n_no;
    }

    execute = (context: PageContext) => {
        // mark each username with red/orange/green
        this.posts.forEach(function(post: PostInfo, idx: number, posts: PostInfo[]) {
            try {
                var row = post.rowElement;
                var nameelt = row.querySelector("span.name") as Element;
                var menu = post.getContextMenu();
                var threadblocked = this.isThreadTroll(""+post.threadId, ""+post.posterid);
                var blocked = this.forumTrolls.has(post.posterid);
                menu.addAction(this.tr(this.UNBLOCK_MENUITEM), blocked, function() {
                    if (this.isThreadTroll(""+post.threadId, ""+post.posterid)) {
                        this.removeThreadTroll(""+post.threadId, ""+post.posterid);
                        this.storeThreadTrolls();
                    } else {
                        this.forumTrolls.delete(post.posterid);
                        this.storeForumTrolls();
                    }
                    this.posts.forEach(function(other: PostInfo, idx: number, posts: PostInfo[]) {
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
                menu.addAction(this.tr(this.BLOCK_MENUITEM), !blocked, function() {
                    this.forumTrolls.add(post.posterid);
                    this.storeForumTrolls();
                    this.posts.forEach(function(other: PostInfo, idx: number, posts: PostInfo[]) {
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
                menu.addAction(this.tr(this.THREADBLOCK_MENUITEM), !threadblocked, function() {
                    this.addThreadTroll(""+post.threadId, ""+post.posterid);
                    this.storeThreadTrolls();
                    this.posts.forEach(function(other: PostInfo, idx: number, posts: PostInfo[]) {
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
        this.posts.forEach(function(post, idx, posts) {
            try {
                //console.log("poster id: '" + post.posterid + "'");
                var posterid = post.posterid;
                var row = post.rowElement;
                var buttons = post.buttonRowElement as HTMLTableRowElement;
                buttons.insertAdjacentHTML('afterend', '<tr>' +
                    '<td class="row2" colspan="2">' +
                    '<a class="nav trollbutton" name="showpost-'+post.postId+'">' + post.posterNickname + '</a>' +
                    '</td></tr>');
                var addition = buttons.nextElementSibling as HTMLTableRowElement;
                var button = addition.querySelector("a") as HTMLAnchorElement;
                button.addEventListener("click", function(ev) {
                    row.style.display = "";
                    buttons.style.display = "";
                    addition.style.display = "none";
                }.bind(this));
                if (this.forumTrolls.has(posterid) || this.isThreadTroll(""+post.threadId, ""+posterid))
                    row.style.display = buttons.style.display = "none";
                else
                    addition.style.display = "none";
            } catch (e) {
                console.log("UserFilter: " + e.message);
            }

        }.bind(this));

    }

    private getConfigItem(setting: string): string {
        try {
            for (let i = 0; i < this.cfg.settings.length; i++) {
                if (this.cfg.settings[i].setting == setting) {
                    //console.log("found setting '" + setting);
                    return this.cfg.settings[i].value as string;
                }
            }
            console.log("did not find setting '" + setting);
        } catch (e) {
            console.error("getConfigItem exception: " + e.message);
        }
    }

    private getForumTrollConfig(): Set<number> {
        var trolls = new Set<number>();
        try {
            var settings = this.getConfigItem("forumTrolls");
            //console.log("loaded forumTrolls: " + settings);
            var trollids = JSON.parse(settings || "[]");
            trollids.forEach(function(troll, idx, trollids) {
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
            var threadtrollstr = this.getConfigItem("threadTrolls");
            //console.log("loaded threadTrolls: " + threadtrollstr);
            var config = JSON.parse(threadtrollstr);
            var now = (new Date()).getTime();
            var period = 1000 * 60 * 60 * 24 * 2;
            var treshold = now - period;
            var filtered = false;
            var keys = Object.keys(config);
            keys.forEach(function(threadid: string, idx, keys) {
                var threadinfo = {};
                var obj = config[threadid];
                var trolls = Object.keys(obj);
                trolls.forEach(function(troll, idx, trolls) {
                    var timestamp = +(obj[troll]);
                    if (timestamp < treshold) {
                        filtered = true;
                    }
                    else {
                        threadinfo[troll] = timestamp;
                    }
                }.bind(this));
                threadtrolls.set(threadid, threadinfo);
            }.bind(this));
            if (filtered) this.storeThreadTrolls();
        } catch (e) {
            console.error('loading thread troll info: ' + e.message);
        }
        return threadtrolls;
    }

    private isThreadTroll(thread: string, userid: string): boolean {
        var now = (new Date()).getTime();
        var period = 1000 * 60 * 60 * 24 * 2;
        var threadinfo = {};
        if (this.threadTrolls.has(thread)) {
            threadinfo = this.threadTrolls.get(thread);
        }
        // console.log("checking thread: " + thread + ", user " + userid);
        // console.log("threadinfo: " + JSON.stringify(threadinfo));
        if (threadinfo[userid] && (threadinfo[userid] > (now - period))) {
            // console.log("found thread troll: " + userid);
            return true;
        }
        return false;
    }

    private addThreadTroll(thread: string, userid: string) {
        var now = (new Date()).getTime();
        var threadinfo = {};
        if (this.threadTrolls.has(thread))
            threadinfo = this.threadTrolls.get(thread);
        threadinfo[userid] = now;
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
        this.forumTrolls.forEach(function(troll, idx, forumTrolls) {
            items.push(+troll);
        }.bind(this));
        var settings = JSON.stringify(items);
        //console.log("storing forumTrolls: '" + settings + "'");
        this.cfg.ChangeSetting("forumTrolls", settings);
    }

    private storeThreadTrolls(): void {
        var setting = {};
        this.threadTrolls.forEach(function(value, key, trolls) {
            setting[key] = value;
        })
        var dictstr = JSON.stringify(setting);
        //console.log("storing threadTrolls: '" + dictstr + "'");
        this.cfg.ChangeSetting("threadTrolls", dictstr);
    }

    private hydrateTemplate(template: string): string {
        let keys = [], values = [];
        // keys.push("$RUSKMatchWin$");
        // values.push(this.cfg.GetSetting('MatchWinColor'));

        for (let i = 0; i < keys.length; i++) {
            template = template.replace(keys[i], values[i]);
        }

        return template;
    }

};