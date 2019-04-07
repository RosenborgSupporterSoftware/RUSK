import { SettingType } from "../Configuration/SettingType";
import { RBKwebPageType } from "../Context/RBKwebPageType";
import { ConfigBuilder } from "../Configuration/ConfigBuilder";
import { ModuleConfiguration } from "../Configuration/ModuleConfiguration";
import { ConfigurationOptionVisibility } from "../Configuration/ConfigurationOptionVisibility";
import { PageContext } from "../Context/PageContext";
import { PostInfo } from "../Utility/PostInfo";
import { Log } from "../Utility/Log";
import { ModuleBase } from "./ModuleBase";

/**
 * EM_UnreadTracker - Extension module for RBKweb.
 */

// http://www.rbkweb.no/forum/viewtopic.php?t=6754&view=newest

export class UnreadTracker extends ModuleBase {
    readonly name : string = "UnreadTracker";

    pageTypesToRunOn: Array<RBKwebPageType> = [
        RBKwebPageType.RBKweb_FORUM_POSTLIST
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
            .Build();

    readPages: Map<number, number>;
    readPosts: Map<number, number>;

    posts: Array<PostInfo>;

    scrollThrottle: NodeJS.Timeout;

    init = (config: ModuleConfiguration) => {
        super.init(config);
        var cfgstring = this._cfg.GetSetting("readPages") as string;
        this.readPages = JSON.parse(cfgstring || "{}");
        cfgstring = this._cfg.GetSetting("readPosts") as string;
        this.readPosts = JSON.parse(cfgstring || "{}");
        window.addEventListener('scroll', function(e: Event) {
            if (this.scrollThrottle != null)
                clearTimeout(this.scrollThrottle);
            this.scrollThrottle = setTimeout(function() {
                this.scrollThrottle = null;
                this.viewScrolled();
            }.bind(this), 100);
        }.bind(this));
        return null;
    }

    url: string;
    topic: number;
    page: number;

    preprocess = (context: PageContext) => {
        this.posts = context.RUSKPage.items as Array<PostInfo>;

        if (context.Language == "norwegian") this.i18n = this.i18n_no;
        var topiclink = document.body.querySelector("a.maintitle") as HTMLAnchorElement;
        this.url = topiclink.href;
        var match = this.url.match(/viewtopic.php\?t=([0-9]*)/);
        if (match) this.topic = +match[1];
        //console.log("topic: " + this.topic);

        var lastRead = this.readPosts[this.topic] || 0;
        this.posts.forEach(function(post: PostInfo, idx: number) {
            if (post.postid > lastRead) {
                this.markUnread(post);
            } else {
                this.markRead(post);
            }
        }.bind(this));
    }

    private markUnread(post: PostInfo): void {
        var icon = post.rowElement.querySelector("td a img") as HTMLImageElement;
        icon.setAttribute("title", "New Post");
        icon.setAttribute("alt", "New post");
        icon.setAttribute("src", "templates/subSilver/images/icon_minipost_new.gif");
    }

    private markRead(post: PostInfo): void {
        var icon = post.rowElement.querySelector("td a img") as HTMLImageElement;
        icon.setAttribute("title", "Post");
        icon.setAttribute("alt", "Post");
        icon.setAttribute("src", "templates/subSilver/images/icon_minipost.gif");
    }

    i18n_no = {}
    i18n = {}

    tr = (text: string): string => {
        return this.i18n[text] || text;
    }

    execute = () => {
        /*
        if (!this.posts) return;

        var collection = [];
        this.posts.forEach(function(post: PostInfo, idx: number) {
            var a = post.buttonRowElement.querySelector("a.nav") as HTMLAnchorElement;
            collection.push(a);
        }.bind(this));
        */
    }

    private viewScrolled(): void {
        this.posts.forEach(function(post: PostInfo, idx: number) {
            if (post.isMostlyInView()) {
                // console.log("post " + post.postid + " is in view");
                post.rowElement.classList.add("RUSKReadItem");
                post.rowElement.classList.remove("RUSKUnreadItem");
                if (!this.readPosts[this.topic] || this.readPosts[this.topic] < post.postid) {
                    this.readPosts[this.topic] = post.postid;
                    this.scheduleStorage();

                }
            }
        }.bind(this));
    }

    storeReadPostsTask: NodeJS.Timeout;

    private scheduleStorage(): void {
        if (this.storeReadPostsTask != null)
            clearTimeout(this.storeReadPostsTask);
        this.storeReadPostsTask = setTimeout(function() {
            this.storeReadPostsTask = null;
            this.saveReadPosts();
            this.saveReadPages();
        }.bind(this), 2000);
    }

    private bumpRead(postid: number): void {
        this.readPosts[this.topic] = postid;
    }

    private saveReadPosts(): void {
        var readposts = JSON.stringify(this.readPosts);
        this._cfg.ChangeSetting("readPosts", readposts);
    }

    private saveReadPages(): void {
        var readpages = JSON.stringify(this.readPages);
        this._cfg.ChangeSetting("readPages", readpages);
    }
}