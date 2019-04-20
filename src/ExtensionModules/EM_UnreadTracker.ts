import { SettingType } from "../Configuration/SettingType";
import { RBKwebPageType } from "../Context/RBKwebPageType";
import { ConfigBuilder } from "../Configuration/ConfigBuilder";
import { ModuleConfiguration } from "../Configuration/ModuleConfiguration";
import { ConfigurationOptionVisibility } from "../Configuration/ConfigurationOptionVisibility";
import { PageContext } from "../Context/PageContext";
import { PostInfo } from "../Utility/PostInfo";
import { Log } from "../Utility/Log";
import { ModuleBase } from "./ModuleBase";
import { ThreadInfo } from "../Utility/ThreadInfo";
import { RUSKUI } from "../UI/RUSKUI";
import * as LZString from "lz-string";

/**
 * EM_UnreadTracker - Extension module for RBKweb.
 */

 // FIXME: lz-string for big dicts

// https://www.rbkweb.no/forum/viewtopic.php?t=6754&view=newest

export class UnreadTracker extends ModuleBase {
    readonly name : string = "UnreadTracker";

    pageTypesToRunOn: Array<RBKwebPageType> = [
        RBKwebPageType.RBKweb_FORUM_POSTLIST,
        RBKwebPageType.RBKweb_FORUM_TOPICLIST
    ];

    configSpec = () =>
        ConfigBuilder
            .Define()
            .EnabledByDefault()
            .WithExtensionModuleName(this.name)
            .WithDisplayName('UnreadTracker')
            .WithDescription("Denne modulen tracker uleste poster")
            .WithConfigOption(opt =>
                opt
                    .WithSettingName("readPages")
                    .WithSettingType(SettingType.text)
                    .WithVisibility(ConfigurationOptionVisibility.Never)
                    .WithDefaultValue('{}')
            )
            .WithConfigOption(opt =>
                opt
                    .WithSettingName("readPosts")
                    .WithSettingType(SettingType.text)
                    .WithVisibility(ConfigurationOptionVisibility.Never)
                    .WithDefaultValue('{}')
            )
            .WithConfigOption(opt =>
                opt
                    .WithSettingName("fadeUnread")
                    .WithLabel("Fade bort farven på uleste innlegg")
                    .WithSettingType(SettingType.bool)
                    .WithVisibility(ConfigurationOptionVisibility.Always)
                    .WithDefaultValue(true)
            )
            .Build();

    readPosts: Map<number, number>;
    readPages: Map<number, number>;
    fadeUnread: boolean;
    fadeDelay: number = 1000; 

    posts: Array<PostInfo>;
    topics: Array<ThreadInfo>;

    scrollThrottle: NodeJS.Timeout;

    topic: number;
    page: number;

    i18n_no = {}
    i18n = {}

    tr = (text: string): string => {
        return this.i18n[text] || text;
    }

    read: Set<number> = new Set<number>();

    init = (config: ModuleConfiguration) => {
        console.log("UnreadTracker.init");

        try {
        super.init(config);
        this.fadeUnread = this.getFadeUnreadConfig();
        this.readPosts = this.getReadPostsConfig();
        this.readPages = this.getReadPagesConfig();

        // reset for debug/testing
        //this.readPosts = new Map<number, number>();
        //this.readPages = new Map<number, number>();

        window.addEventListener('scroll', (e: Event) => {
            if (this.posts != null) {
                if (this.scrollThrottle != null)
                    return;
                this.scrollThrottle = setTimeout(() => {
                    this.scrollThrottle = null;
                    this.viewScrolled();
                }, 200);
            }
        });
        window.addEventListener('beforeunload', (e: Event) => {
            if (this.posts != null) {
                if (this.unreadChanged) {
                    this.unreadChanged = false;
                    this.storeState();
                }
            }
        });

        } catch (ex) {

            console.error("init: " + ex.message);
        }
        return null;
    }

    preprocess = (context: PageContext) => {
        if (context.Language == "norwegian")
            this.i18n = this.i18n_no;

        if (context.PageType == RBKwebPageType.RBKweb_FORUM_TOPICLIST) {
            this.topics = context.RUSKPage.items as Array<ThreadInfo>;
            this.posts = null;
            this.topic = -1;
            this.page = -1;
            if (this.preprocessTopicList(context.Username != undefined))
                this.storeState();
        }
        else {
            this.posts = context.RUSKPage.items as Array<PostInfo>;
            this.topics = null;
            this.topic = this.getCurrentTopicId();
            this.page = this.getCurrentPage();
            if (this.preprocessThreadPosts(context.Username != undefined))
                this.storeState();
        }
    }

    private preprocessTopicList(loggedIn: boolean): boolean {
        console.log("UnreadTracker.preprocessTopicList");
        var changed = false;
        this.topics.forEach((topic: ThreadInfo, idx: number, array: ThreadInfo[]) => {
            try {
            var lastPostMatch = topic.lastPostUrl.match(/.*#([0-9]+)/);
            var lastPost = -1;
            if (lastPostMatch)
                lastPost = +(lastPostMatch[1]);
            var lastReadPost = -1;
            if (this.readPosts.has(topic.threadid))
                lastReadPost = this.readPosts.get(topic.threadid);

            if (lastReadPost == -1 && lastPost != -1 && !topic.isUnread && loggedIn) {
                // topic is not seen before, but topic is marked as read by rbkweb,
                // so gather up the relevant data
                this.readPosts.set(topic.threadid, lastPost);
                var lastPageMatch = topic.latestPageUrl.match(/.*start=([0-9]+)/);
                var lastPage = 1;
                if (lastPageMatch)
                    lastPage = this.startToPageNumber(+(lastPageMatch[1]));
                //console.log("thread " + topic.threadid + ": last page is " + lastPage);
                this.readPages.set(topic.threadid, lastPage);
                lastReadPost = lastPost;
                changed = true;
            }

            if (lastPost == -1) {
                console.log("could not parse lastPost from " + topic.lastPostUrl);
            } else if (lastReadPost) {
                //console.log("lastPost is " + lastPost + ", lastRead for '" + topic.title + "' is " + lastReadPost);
            }

            if (lastReadPost == -1) {
                if (loggedIn) {
                    this.markTopicUnread(topic);
                }
            }
            else if (lastPost > lastReadPost) {
                this.markTopicUnread(topic);
            }
            else {
                this.markTopicRead(topic);
            }
            } catch (ex) {
                console.error("processing topic: " + ex.message);

            }
        });
        return changed;
    }

    private markTopicUnread(topic: ThreadInfo): void {
        console.log("marking topic " + topic.threadid + " as unread");
        topic.rowElement.classList.add("RUSKUnreadItem");
        topic.rowElement.classList.remove("RUSKReadItem");
        // FIXME: change logo
    }

    private markTopicRead(topic: ThreadInfo): void {
        console.log("marking topic " + topic.threadid + " as read");
        topic.rowElement.classList.remove("RUSKUnreadItem");
        topic.rowElement.classList.add("RUSKReadItem");
        // FIXME: change logo
    }

    private preprocessThreadPosts(loggedIn: boolean): boolean {
        // most of the logic is inside viewScrolled()
        var changed = false;
        var lastRead = this.readPosts.get(this.topic) || -1;
        if (lastRead != -1) { // we know read/unread state
            this.posts.forEach((post: PostInfo, idx: number) => {
                if (post.postid > lastRead) {
                    this.markUnread(post);
                } else {
                    this.markRead(post);
                }
            });
        }
        else if (loggedIn) {
            // we neet to figure out where read/unread starts (if on this page)
            var isRead = undefined;
            var prevPostId = undefined;
            this.posts.forEach((post: PostInfo, idx: number) => {
                if (isRead == undefined) {
                    isRead = !post.isUnread;
                    prevPostId = post.postid;
                }
                else {
                    var thisReadState = !post.isUnread;
                    if (isRead && !thisReadState) {
                        this.readPosts.set(this.topic, prevPostId);
                        var pageMatch = document.URL.match(/.*&start=([0-9]+)/);
                        if (pageMatch) {
                            var lastPage = this.startToPageNumber(+(pageMatch[1]));
                            this.readPages.set(this.topic, lastPage);
                        }
                        changed = true;
                    }
                    prevPostId = post.postid;
                }
            });
        }
        return changed;
    }

    private startToPageNumber(startnum: number): number {
        return (startnum/25)+1;
    }

    private getCurrentTopicId(): number {
        var topic = -1;
        var topiclink = document.body.querySelector("a.maintitle") as HTMLAnchorElement;
        var url = topiclink.href;
        var topicmatch = url.match(/viewtopic.php\?t=([0-9]*)/);
        if (topicmatch)
            topic = +(topicmatch[1]);
        return topic;
    }

    private getCurrentPage(): number {
        var page = -1;
        var topiclink = document.body.querySelector("a.maintitle") as HTMLAnchorElement;
        var url = topiclink.href;
        var pagematch = url.match(/viewtopic.php\?.*start=([0-9]*)/);
        if (pagematch)
            page = ((+(pagematch[1]))/25)+1;
        return page;
    }


    execute = () => {
        /*
        if (!this.posts) return;

        var collection = [];
        this.posts.forEach((post: PostInfo, idx: number) => {
            var a = post.buttonRowElement.querySelector("a.nav") as HTMLAnchorElement;
            collection.push(a);
        });
        */
    }

    private markUnread(post: PostInfo): void {
        var icon = post.rowElement.querySelector("td a img") as HTMLImageElement;
        icon.setAttribute("title", "New Post");
        icon.setAttribute("alt", "New post");
        icon.setAttribute("src", "templates/subSilver/images/icon_minipost_new.gif");
        post.rowElement.classList.add("RUSKUnreadItem");
        post.rowElement.classList.remove("RUSKReadItem");
    }

    private markRead(post: PostInfo): void {
        var icon = post.rowElement.querySelector("td a img") as HTMLImageElement;
        icon.setAttribute("title", "Post");
        icon.setAttribute("alt", "Post");
        icon.setAttribute("src", "templates/subSilver/images/icon_minipost.gif");
        post.rowElement.classList.add("RUSKReadItem");
        post.rowElement.classList.remove("RUSKUnreadItem");
    }

    private viewScrolled(): void {
        console.log("viewScrolled");
        var lastRead = this.readPosts.get(this.topic) || -1;
        var lastIdx = this.posts.length - 1;
        if (lastRead == -1) {
            this.posts.forEach((post: PostInfo, idx: number) => {
                if (lastRead == -1) {
                    if (post.rowElement.classList.contains("RUSKUnreadItem")) {
                        lastRead = post.postid;
                        this.readPosts.set(this.topic, post.postid);
                        this.readPages.set(this.topic, this.page);
                        this.scheduleStorage();
                    }
                }
            });
        }

        this.posts.forEach((post: PostInfo, idx: number) => {
            if (post.isMostlyInView()) {
                //console.log("post " + post.postid + " is in view");
                this.read.add(post.postid);
                if (lastRead == -1) {
                    
                    console.log("lastRead == -1");
                    if (post.rowElement.classList.contains("RUSKUnreadItem")) {
                        console.log("making note of read-state");
                        lastRead = post.postid;
                        this.readPosts.set(this.topic, post.postid);
                        this.readPages.set(this.topic, this.page);
                    }
                    else {
                        console.log("returning");
                        return;
                    }
                }
                this.posts.forEach((other: PostInfo, i: number) => {
                    if (!this.read.has(other.postid) && i < idx && other.rowElement.classList.contains("RUSKUnreadItem")) {
                        this.read.add(other.postid);
                        if (this.fadeUnread) {
                            var p = other;
                            setTimeout(() => {
                                p.rowElement.classList.add("RUSKReadItem");
                                p.rowElement.classList.remove("RUSKUnreadItem");
                            }, this.fadeDelay);
                        }
                    }
                });

                if (this.fadeUnread) {
                    var p = post;
                    setTimeout(() => {
                        p.rowElement.classList.add("RUSKReadItem");
                        p.rowElement.classList.remove("RUSKUnreadItem");
                    }, this.fadeDelay+100); // slightly after the post above
                }

                if (idx == lastIdx) { // last post on page
                    if (!this.readPosts.get(this.topic) || this.readPosts.get(this.topic) < post.postid) {
                        this.readPosts.set(this.topic, post.postid);
                        this.readPages.set(this.topic, this.page);
                    }
                    this.storeState();
                }
                else {
                    if (!this.readPosts.has(this.topic) || this.readPosts.get(this.topic) < post.postid) {
                        this.readPosts.set(this.topic, post.postid);
                        this.readPages.set(this.topic, this.page);
                        this.scheduleStorage();
                    }
                }
            }
        });
    }

    unreadChanged: boolean = false;
    storeReadPostsTask: NodeJS.Timeout;

    private storeState() {
        console.log("storing unread posts state");
        if (this.storeReadPostsTask != null) {
            clearTimeout(this.storeReadPostsTask);
            this.storeReadPostsTask = null;
        }
        this.storeReadPosts();
        this.storeReadPages();
        this.unreadChanged = false;
    }

    private scheduleStorage(): void {
        console.log("scheduleStorage");
        this.unreadChanged = true;
        if (this.storeReadPostsTask != null)
            clearTimeout(this.storeReadPostsTask);
        this.storeReadPostsTask = setTimeout(() => {
            this.storeReadPostsTask = null;
            this.storeState();
        }, 10000);
    }

    private getFadeUnreadConfig(): boolean {
        return this._cfg.GetSetting("fadeUnread") as boolean;
    }

    private getReadPostsConfig(): Map<number, number> {
        try {
        var readPosts = new Map<number, number>();
        var readPostsCfg = this._cfg.GetSetting("readPosts") as string;
        if (readPostsCfg.startsWith("lz:")) {
            console.log("compressed readposts (" + readPostsCfg.length + " chars)");
            var compressed = readPostsCfg.substring(3);
            readPostsCfg = LZString.decompress(compressed);
        }
        console.log("loading readposts (" + readPostsCfg.length + " chars)");
        var dict = JSON.parse(readPostsCfg || "{}");
        Object.keys(dict).forEach((value: string, idx: number, array: string[]) => {
            readPosts.set(+value, dict[value]);
        });
    } catch (ex) {
        console.error("getReadPostsConfig: " + ex.message, ex.stack);
    }
        return readPosts;
    }

    private getReadPagesConfig(): Map<number, number> {
        try {
        var readPages = new Map<number, number>();
        var readPagesCfg = this._cfg.GetSetting("readPages") as string;
        if (readPagesCfg.startsWith("lz:")) {
            console.log("compressed readpages (" + readPagesCfg.length + " chars)");
            var compressed = readPagesCfg.substring(3);
            readPagesCfg = LZString.decompress(compressed);
        }
        console.log("loading readpages (" + readPagesCfg.length + " chars)");
        var dict = JSON.parse(readPagesCfg || "{}");
        Object.keys(dict).forEach((value: string, idx: number, array: string[]) => {
            readPages.set(+value, dict[value]);
        });
    } catch (ex) {
        console.error("getReadPagesConfig: " + ex.message, ex.stack);
    }
        return readPages;
    }

    private storeReadPosts(): void {
        var setting = {};
        this.readPosts.forEach((value: number, key: number, map: Map<number, number>) => {
            setting["" + key] = value;
        });
        var readposts = JSON.stringify(setting);
        if (readposts.length > 1024) {
            var compressed = LZString.compress(readposts);
            readposts = "lz:" + compressed;
        }
        console.log("storing readposts (" + readposts.length + " chars)");
        this._cfg.ChangeSetting("readPosts", readposts);
    }

    private storeReadPages(): void {
        var setting = {};
        this.readPages.forEach((value: number, key: number, map: Map<number, number>) => {
            setting["" + key] = value;
        });
        var readpages = JSON.stringify(setting);
        if (readpages.length > 1024) {
            var compressed = LZString.compress(readpages);
            readpages = "lz:" + compressed;
        }
        console.log("storing readpages (" + readpages.length + " chars)");
        this._cfg.ChangeSetting("readPages", readpages);
    }
}