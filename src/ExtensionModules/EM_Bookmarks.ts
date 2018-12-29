import { ExtensionModule } from "./ExtensionModule";
import { RBKwebPageType } from "../Context/RBKwebPageType";
import { ConfigBuilder } from "../Configuration/ConfigBuilder";
import { ModuleConfiguration } from "../Configuration/ModuleConfiguration";
import { PostInfo } from "../Utility/PostInfo";
import { SettingType } from "../Configuration/SettingType";
import { ConfigurationOptionVisibility } from "../Configuration/ConfigurationOptionVisibility";
import { Log } from "../Utility/Log";
import { PageContext } from "../Context/PageContext";

/**
 * EM_Bookmarks - Extension module for RBKweb.
 */

export class Bookmarks implements ExtensionModule {
    readonly name: string = "Bookmarks";
    cfg: ModuleConfiguration;

    pageTypesToRunOn: Array<RBKwebPageType> = [
        RBKwebPageType.RBKweb_FORUM_FORUMLIST,
        RBKwebPageType.RBKweb_FORUM_POSTLIST,
        RBKwebPageType.RBKweb_FORUM_BOOKMARKS,
    ];

    runBefore: Array<string> = ['late-extmod'];
    runAfter: Array<string> = ['early-extmod'];

    configSpec = () =>
        ConfigBuilder
            .Define()
            .EnabledByDefault()
            .WithExtensionModuleName(this.name)
            .WithDisplayName(this.name)
            .WithDescription("En modul som lar deg bookmark'e tråder og poster til en egen side.")
            .WithConfigOption(opt =>
                opt
                    .WithSettingName("threadNames")
                    .WithSettingType(SettingType.text)
                    .WithLabel("Navn på tråder")
                    .WithVisibility(ConfigurationOptionVisibility.Never)
                    .WithDefaultValue("{}")
            )
            .WithConfigOption(opt =>
                opt
                    .WithSettingName("accountNames")
                    .WithSettingType(SettingType.text)
                    .WithLabel("Navn på brukere")
                    .WithVisibility(ConfigurationOptionVisibility.Never)
                    .WithDefaultValue("{}")
            )
            .WithConfigOption(opt =>
                opt
                    .WithSettingName("bookmarkedThreads")
                    .WithSettingType(SettingType.text)
                    .WithLabel("Bokmerkede tråder")
                    .WithVisibility(ConfigurationOptionVisibility.Never)
                    .WithDefaultValue("{}")
            )
            .WithConfigOption(opt =>
                opt
                    .WithSettingName("bookmarkedPosts")
                    .WithSettingType(SettingType.text)
                    .WithLabel("Bokmerkede poster")
                    .WithVisibility(ConfigurationOptionVisibility.Never)
                    .WithDefaultValue("{}")
            )
            .Build();

    maxBookmarks: number = 25;
    bookmarkedThreads: object = {};
    bookmarkedPosts: object = {};
    accountNames: object = {};
    threadNames: object = {};

    starredPNG: string;
    unstarredPNG: string;

    init = (config: ModuleConfiguration) => {
        this.cfg = config;
        this.starredPNG = chrome.runtime.getURL('/img/starred.png');
        this.unstarredPNG = chrome.runtime.getURL('/img/unstarred.png');
        this.bookmarkedThreads = JSON.parse(this.cfg.GetSetting("bookmarkedThreads") as string);
        this.bookmarkedPosts = JSON.parse(this.cfg.GetSetting("bookmarkedPosts") as string);
        this.accountNames = JSON.parse(this.cfg.GetSetting('accountNames') as string);
        this.threadNames = JSON.parse(this.cfg.GetSetting('threadNames') as string);
    }

    i18n_no = {
        "Bookmarks": "Bokmerker",
        "Bookmark": "Sett bokmerke",
        "Unbookmark": "Fjern bokmerke",
    }

    i18n = {}

    tr = (text: string): string => {
        return this.i18n[text] || text;
    }

    BOOKMARK_POST: string = "Bookmark";
    BOOKMARK_POST_DEL: string = "Unbookmark";

    posts: Array<PostInfo>;

    preprocess = (context: PageContext) => {
        this.posts = context.RUSKPage.items as Array<PostInfo>;
        if (context.Language == "norwegian") this.i18n = this.i18n_no;
        try {
            var link = document.body.querySelector('a.gensmall[href="search.php?search_id=newposts') as HTMLAnchorElement;
            if (link) { // index.php page
                link.insertAdjacentHTML('beforebegin', '<a name="bookmarks" class="gensmall bookmarks">Bookmarks</a><br>');
                var bookmarks = link.parentElement.querySelector('a[name="bookmarks"]') as HTMLAnchorElement;
                var handler = function(ev) {
                    if (!window.location.href.endsWith("#bookmarks"))
                        window.history.replaceState(null, null, window.location.href + "#bookmarks");
                    var remove1 = document.body.querySelector('a[href="index.php?mark=forums"]') as HTMLAnchorElement;
                    var content = document.body.querySelector('table.forumline') as HTMLTableElement;
                    var elt: HTMLElement = content;
                    do {
                        elt = elt.previousElementSibling as HTMLElement;
                        if (elt && elt instanceof HTMLTableElement) {
                            elt.outerHTML = "";
                            elt = undefined;
                        }
                        else if (elt && elt instanceof HTMLBRElement) {
                            elt.outerHTML = "";
                        }
                    } while (elt);
                    if (remove1) remove1.outerHTML = "";
                    this.addBookmarksHeader(content);
                    var html = [];
                    html.push('<tr>');
                    html.push('<th class="thCornerElt">&nbsp;</th>');
                    html.push('<th class="thTop">Author</th>');
                    html.push('<th class="thTop">Thread title</th>');
                    html.push('<th class="thTop">Snippet</th>');
                    html.push('<th class="thTop">Date</th>');
                    html.push('</tr>');
                    Object.keys(this.bookmarkedPosts).forEach(function(key: string, idx, collection) {
                        var bookmark = this.bookmarkedPosts[key];
                        var postid = key;
                        var userid = bookmark.b;
                        var threadid = bookmark.c;
                        var time = bookmark.d * 60000;
                        var timestr = "";
                        if (time) {
                            var date = new Date(time);
                            timestr = this.timeString(date);
                        }
                        var snippet = bookmark.e || "";
                        if (snippet.length >= 50) snippet = snippet + "...";
                        html.push('<tr>');
                        html.push('<td class="row2" align="center"><a title="Unstar"><img name="starred" data-postid="' + postid + '" src="' + this.starredPNG + '" width="14" height="14"/></a></td>');
                        html.push('<td class="row2" align="center"><span class="name"><a href="profile.php?mode=viewprofile&u='+userid+'">' + this.accountNames[""+userid] + '</a></span></td>');
                        html.push('<td class="row2"><a class="topictitle" href="viewtopic.php?p=' + postid + '#' + postid + '">' + this.threadNames[""+threadid] + '</a></td>');
                        html.push('<td class="row2"><a class="gensmall" href="viewtopic.php?p=' + postid + '#' + postid + '">' + snippet + '</a></td>');
                        html.push('<td class="row2"><span class="gensmall">' + timestr + '</span></td>');
                        html.push('</tr>');
                    }.bind(this));
                    content.innerHTML = html.join("");
                    content.querySelectorAll('img[name="starred"]').forEach(function(elt: HTMLImageElement, key, parent) {
                        var anchor = elt.parentElement as HTMLAnchorElement;
                        anchor.addEventListener('click', function() {
                            try {
                                var postid = elt.getAttribute('data-postid');
                                if (elt.src == this.starredPNG) {
                                    elt.src = this.unstarredPNG;
                                    anchor.title = "Star";
                                    this.unstar(postid, anchor);
                                } else {
                                    elt.src = this.starredPNG;
                                    anchor.title = "Unstar";
                                    this.star(postid, anchor);
                                }
                            } catch (e) {
                                console.error("star/unstar: " + e.message + " - " + e.stack);
                            }
                        }.bind(this));
                    }.bind(this));
                }.bind(this);
                bookmarks.addEventListener('click', handler);
                if (window.location.href.endsWith("#bookmarks")) {
                    handler();
                }
            }
        } catch (e) {
            console.error("execute error: " + e.message + " - " + e.stack);
        }
    }

    execute = (context: PageContext) => {
        try {
            if (context.PageType == RBKwebPageType.RBKweb_FORUM_POSTLIST) {
                var threadTitleElt = (document.body.querySelector('a.maintitle') as HTMLAnchorElement);
                var threadTitle = threadTitleElt ? threadTitleElt.textContent : "";
                this.posts.forEach(function(post: PostInfo, key, parent) {
                    var cmenu = post.getContextMenu();
                    var bookmarked = this.bookmarkedPosts[""+post.postid] != undefined;
                    if (Object.keys(this.bookmarkedPosts).length < this.maxBookmarks) {
                        // disabled when having too many bookmarks
                        cmenu.addAction(this.BOOKMARK_POST, !bookmarked, function() {
                            if (this.accountNames[""+post.posterid] != post.posterNickname) {
                                this.accountNames[""+post.posterid] = post.posterNickname;
                                this.saveAccountNames();
                            }
                            if (this.threadNames[""+post.threadId] != threadTitle) {
                                this.threadNames[""+post.threadId] = threadTitle;
                                this.saveThreadNames();
                            }
                            var template = document.createElement('template') as HTMLTemplateElement;
                            template.innerHTML = '<div>' + post.postBodyElement.innerHTML + '</div>';
                            template.content.querySelectorAll('table').forEach(function(elt: HTMLTableElement, key, parent) {
                                elt.outerHTML = "";
                            }.bind(this));
                            var snippet = template.content.textContent;
                            var idx = snippet.indexOf("________");
                            if (idx != -1) snippet = snippet.substring(0, idx);
                            snippet = snippet.trim();
                            snippet = snippet.substring(0,50);
                            this.bookmarkedPosts[""+post.postid] = {
                                 // a: post.postid,
                                 b: post.posterid,
                                 c: post.threadId,
                                 d: Math.trunc(post.postedDate.getTime() / 60000),
                                 e: snippet
                            };
                            cmenu.getAction(this.BOOKMARK_POST).hide();
                            cmenu.getAction(this.BOOKMARK_POST_DEL).show();
                            this.saveBookmarkedPosts();
                        }.bind(this));
                    }
                    cmenu.addAction(this.BOOKMARK_POST_DEL, bookmarked, function() {
                        this.unstar(""+post.postid);
                        cmenu.getAction(this.BOOKMARK_POST).show();
                        cmenu.getAction(this.BOOKMARK_POST_DEL).hide();
                    }.bind(this));
                }.bind(this));
            }
        } catch (e) {
            console.error("execute error: " + e.message + " - " + e.stack);
        }
    }

    private addBookmarksHeader(contentTag: HTMLTableElement): void {
        contentTag.insertAdjacentHTML('beforebegin',
            '<table width="100%">' +
            '<tr>' +
            '<td><a class="maintitle">Bookmarks</a></td>' +
            '<br>' +
            '</tr>' +
            '<tr>' +
            '<td><a class="nav" href="index.php">RBKweb Forum Index</a> <span class="nav">-&gt;</span> <span class="nav">Bookmarked posts</span></td>' +
            '<br>' +
            '</tr>' +
            '</table>');
    }

    unstarred = {};

    private unstar(id: string, tag: HTMLAnchorElement): void {
        this.unstarred[id] = this.bookmarkedPosts[id];
        delete this.bookmarkedPosts[id];
        this.saveBookmarkedPosts();
    }

    private star(id: string, tag: HTMLAnchorElement): void {
        this.bookmarkedPosts[id] = this.unstarred[id];
        this.saveBookmarkedPosts();
    }

    private timeString(date: Date): string {
        function print02(num: number): string {
            var str = "" + num;
            if (str.length == 1) str = "0" + str;
            return str;
        }
        return "" + date.getDate() +
            "." + (date.getMonth() + 1) +
            "." + date.getFullYear() + "&nbsp;" +
            print02(date.getHours()) + ":" +
            print02(date.getMinutes());
    }

    private saveThreadNames(): void {
        var json = JSON.stringify(this.threadNames);
        //console.log("storing thread names: '" + json + "'");
        this.cfg.ChangeSetting("threadNames", json);
    }

    private saveAccountNames(): void {
        var json = JSON.stringify(this.accountNames);
        //console.log("storing account names: '" + json + "'");
        this.cfg.ChangeSetting("accountNames", json);
    }

    private saveBookmarkedThreads(): void {
        var json = JSON.stringify(this.bookmarkedThreads);
        //console.log("storing thread bookmarks: '" + json + "'");
        this.cfg.ChangeSetting("bookmarkedThreads", json);
    }

    private saveBookmarkedPosts(): void {
        var json = JSON.stringify(this.bookmarkedPosts);
        //console.log("storing post bookmarks: '" + json + "'");
        this.cfg.ChangeSetting("bookmarkedPosts", json);
    }
}