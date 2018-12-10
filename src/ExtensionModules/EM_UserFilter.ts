import { ExtensionModule } from "./ExtensionModule";
import { ConfigOptions } from "../Configuration/ConfigOptions";
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
            .WithExtensionModuleName("UserFilter")
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

    init = (config: ModuleConfiguration) => {
        try {
            this.cfg = config;
            this.forumTrolls = this.getForumTrollConfig();
            this.threadTrolls = this.getThreadTrollConfig();
            // BEGIN DEBUG
            //this.forumTrolls.add(7212); // SHJINNJWÆST
            //this.forumTrolls.add(1978); // Konesseur
            // END DEBUG
        } catch (e) {
            console.log("init exception: " + e.message);
        }
    }

    preprocess = () => {
        try {
            this.posts = PostInfo.GetPostsFromDocument(document);
        } catch (e) {
            console.error("UserFilter.preprocess: " + e.message);
        }
    }

    execute = (context: PageContext) => {
        // mark each username with red/orange/green
        this.posts.forEach(function(post: PostInfo, idx: number, posts: PostInfo[]) {
            try {
                var row = post.rowElement;
                var nameelt = row.querySelector("span.name") as Element;
                nameelt.insertAdjacentHTML('afterend',
                    ' ' +
                    '<a class="nav" id="' + post.posterid + 'green" title="Unblock">' +
                    '<img src="' + chrome.runtime.getURL('/img/green.png') + '" valign="middle" width="12" height="12" border="0"/>' +
                    '</a>' +
                    '\u202f' +
                    '<a class="nav" id="' + post.posterid + 'orange" title="48h Topic Block">' +
                    '<img src="' + chrome.runtime.getURL('/img/orange.png') + '" valign="middle" width="12" height="12" border="0"/>' +
                    '</a>' +
                    '\u202f' +
                    '<a class="nav" id="' + post.posterid + 'red" title="Block">' +
                    '<img src="' + chrome.runtime.getURL('/img/red.png') + '" valign="middle" width="12" height="12" border="0"/>' +
                    '</a>');
                var green = row.querySelector('a[id="'+post.posterid+'green"]') as HTMLAnchorElement;
                var orange = row.querySelector('a[id="'+post.posterid+'orange"]') as HTMLAnchorElement;
                var red = row.querySelector('a[id="'+post.posterid+'red"]') as HTMLAnchorElement;
                green.addEventListener("click", function(ev) {
                    console.log("Unblocking " + post.posterNickname);
                    if (this.isThreadTroll(""+post.threadId, ""+post.posterid)) {
                        this.removeThreadTroll(""+post.threadId, ""+post.posterid);
                        this.storeThreadTrolls();
                    } else {
                        this.forumTrolls.delete(post.posterid);
                        this.storeForumTrolls();
                    }
                    this.posts.forEach(function(other: PostInfo, idx: number, posts: PostInfo[]) {
                        if (other.posterid == post.posterid) {
                            if (other.postid != post.postid) {
                                other.rowElement.style.display = "";
                                other.buttonRowElement.style.display = "";
                                (other.buttonRowElement.nextElementSibling as HTMLTableRowElement).style.display = "none";
                            }
                            var r = other.rowElement.querySelector('a[id="'+post.posterid+'red"]') as HTMLAnchorElement;
                            var o = other.rowElement.querySelector('a[id="'+post.posterid+'orange"]') as HTMLAnchorElement;
                            var g = other.rowElement.querySelector('a[id="'+post.posterid+'green"]') as HTMLAnchorElement;
                            r.style.display = "";
                            o.style.display = "";
                            g.style.display = "none";
                        }
                    }.bind(this));
                }.bind(this));
                orange.addEventListener("click", function() {
                    console.log("Thread-blocking " + post.posterNickname);
                    this.addThreadTroll(""+post.threadId, ""+post.posterid);
                    this.storeThreadTrolls();
                    this.posts.forEach(function(other: PostInfo, idx: number, posts: PostInfo[]) {
                        if (other.posterid == post.posterid) {
                            other.rowElement.style.display = "none";
                            other.buttonRowElement.style.display = "none";
                            (other.buttonRowElement.nextElementSibling as HTMLTableRowElement).style.display = "";
                            var r = other.rowElement.querySelector('a[id="'+post.posterid+'red"]') as HTMLAnchorElement;
                            var o = other.rowElement.querySelector('a[id="'+post.posterid+'orange"]') as HTMLAnchorElement;
                            var g = other.rowElement.querySelector('a[id="'+post.posterid+'green"]') as HTMLAnchorElement;
                            r.style.display = "none";
                            o.style.display = "none";
                            g.style.display = "";
                        }
                    }.bind(this));
                }.bind(this));
                red.addEventListener("click", function() {
                    console.log("Blocking " + post.posterNickname);
                    this.forumTrolls.add(post.posterid);
                    this.storeForumTrolls();
                    this.posts.forEach(function(other: PostInfo, idx: number, posts: PostInfo[]) {
                        if (other.posterid == post.posterid) {
                            other.rowElement.style.display = "none";
                            other.buttonRowElement.style.display = "none";
                            (other.buttonRowElement.nextElementSibling as HTMLTableRowElement).style.display = "";
                            var r = other.rowElement.querySelector('a[id="'+post.posterid+'red"]') as HTMLAnchorElement;
                            var o = other.rowElement.querySelector('a[id="'+post.posterid+'orange"]') as HTMLAnchorElement;
                            var g = other.rowElement.querySelector('a[id="'+post.posterid+'green"]') as HTMLAnchorElement;
                            r.style.display = "none";
                            o.style.display = "none";
                            g.style.display = "";
                        }
                    }.bind(this));
                }.bind(this));
                if (this.forumTrolls.has(post.posterid) || this.isThreadTroll(""+post.threadId, ""+post.posterid)) {
                    orange.style.display = "none";
                    red.style.display = "none";
                }
                else {
                    green.style.display = "none";
                }
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
};