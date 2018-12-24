import { ExtensionModule } from "./ExtensionModule";
import { ConfigOptions } from "../Configuration/ConfigOptions";
import { SettingType } from "../Configuration/SettingType";
import { RBKwebPageType } from "../Context/RBKwebPageType";
import { ConfigBuilder } from "../Configuration/ConfigBuilder";
import { ModuleConfiguration } from "../Configuration/ModuleConfiguration";
import { ConfigurationOptionVisibility } from "../Configuration/ConfigurationOptionVisibility";
import { PageContext } from "../Context/PageContext";
import { ThreadInfo } from "../Utility/ThreadInfo";
import { ContextMenu } from "../Utility/ContextMenu";

/**
 * EM_TopicFilter - Extension module for RBKweb.
 */

// FIXME: common preprocessing step with UsernameTracker, SignatureFilter (marking userid
// on username DOM objects)

export class TopicFilter implements ExtensionModule {
    readonly name : string = "TopicFilter";
    cfg: ModuleConfiguration;

    pageTypesToRunOn: Array<RBKwebPageType> = [
        RBKwebPageType.RBKweb_FORUM_TOPICLIST
    ];

    runBefore: Array<string> = ['late-extmod'];
    runAfter: Array<string> = ['early-extmod'];

    configSpec = () =>
        ConfigBuilder
            .Define()
            .EnabledByDefault()
            .WithExtensionModuleName(this.name)
            .WithDisplayName('Trådfilter')
            .WithDescription("Denne modulen filtrerer forumtråder")
            .WithConfigOption(opt =>
                opt
                    .WithSettingName("hideThreads")
                    .WithSettingType(SettingType.text)
                    .WithVisibility(ConfigurationOptionVisibility.Never)
                    .WithDefaultValue('[]')
            )
            .Build();

    hideThreads: Array<number>;

    topics: Array<ThreadInfo>;

    init = (config: ModuleConfiguration) => {
        this.cfg = config;
        this.hideThreads = JSON.parse(this.getConfigItem("hideThreads") || "{}");
    }

    preprocess = () => {
        try {
            this.topics = ThreadInfo.GetThreadsFromDocument(document);
        } catch (e) {
            console.log("topics scrape exception: " + e.message);
        }
    }

    HIDE_THREAD: string = "Hide thread";
    SHOW_THREAD: string = "Show thread";
    HIDE_THREADS: string = "Hide filtered threads";
    SHOW_THREADS: string = "Show hidden threads";

    topmenu: ContextMenu = null;

    execute = (context: PageContext) => {
        if (!this.topics) return;

        // set up top-menu
        try {
            if (this.topmenu == null) {
                var body = document.body.querySelector('table.forumline') as HTMLTableElement;
                if (body) {
                    var header = body.previousElementSibling;
                    if (header) {
                        var link = header.querySelector('span.gensmall a[href*="mark=topics"]') as HTMLAnchorElement;
                        if (link) {
                            link.insertAdjacentHTML('afterend', ' <div style="margin-left:5px;"></div>');
                            var root = link.nextElementSibling as HTMLDivElement;
                            this.topmenu = new ContextMenu(root, "forumline");
                        }
                    }
                }
            }
            if (this.topmenu == null) {
                document.body.querySelectorAll("tr td span.nav a").forEach(function(elt, idx, parent) {
                    if (idx == 0 && elt.getAttribute('href') == "index.php") {
                        this.topmenu = new ContextMenu(elt.closest("tr"), "forumline");
                    }
                }.bind(this));
            }
            if (this.topmenu != null) {
                this.topmenu.addAction(this.SHOW_THREADS, true, function() {
                    this.topmenu.getAction(this.SHOW_THREADS).hide();
                    this.topmenu.getAction(this.HIDE_THREADS).show();
                    this.topics.forEach(function(thread: ThreadInfo, idx, threads) {
                        thread.rowElement.classList.remove("RUSKHiddenItem");
                    }.bind(this));
                }.bind(this));
                this.topmenu.addAction(this.HIDE_THREADS, true, function() {
                    this.topmenu.getAction(this.SHOW_THREADS).show();
                    this.topmenu.getAction(this.HIDE_THREADS).hide();
                    this.topics.forEach(function(thread: ThreadInfo, idx, threads) {
                        if (this.hideThreads.indexOf(thread.threadid) != -1)
                            thread.rowElement.classList.add("RUSKHiddenItem");
                    }.bind(this));
                }.bind(this));
            }
        } catch (e) {
            console.error("error: " + e.message + " => " + e.stack);
        }

        var hiddencount = 0;
        this.topics.forEach(function(topic: ThreadInfo, idx, topics) {
            var menu = topic.getContextMenu();
            var visible = this.hideThreads.indexOf(topic.threadid);
            if (!visible) {
                hiddencount += 1;
                topic.rowElement.classList.add("RUSKHiddenItem");
            }
            menu.addAction(this.HIDE_THREAD, visible, function() {
                try {
                    this.hideThreads.push(topic.threadid);
                    this.saveHideThreads();
                    topic.rowElement.classList.add("RUSKHiddenItem");
                    this.topmenu.menuElement.classList.remove("RUSKHiddenItem");
                    menu.getAction(this.SHOW_THREAD).show();
                    menu.getAction(this.HIDE_THREAD).hide();
                    this.topmenu.getAction(this.HIDE_THREADS).hide();
                    this.topmenu.getAction(this.SHOW_THREADS).show();
                } catch (e) {
                    console.log("exception hiding topic: " + e.message);
                }
            }.bind(this));
            menu.addAction(this.SHOW_THREAD, !visible, function() {
                try {
                    this.hideThreads = this.hideThreads.filter((num) => { return num != topic.threadid });
                    this.saveHideThreads();
                    var count = 0;
                    this.topics.forEach(function(thread, idx, threads) {
                        if (this.hideThreads.indexOf(thread.threadid) != -1) { count += 1; }
                    }.bind(this));
                    if (count == 0) this.topmenu.menuElement.classList.add("RUSKHiddenItem");
                    this.saveHideThreads();
                    topic.rowElement.classList.remove("RUSKHiddenItem");
                    menu.getAction(this.SHOW_THREAD).hide();
                    menu.getAction(this.HIDE_THREAD).show();
                } catch (e) {
                    console.log("exception showing topic: " + e.message);
                }
            }.bind(this));
        }.bind(this));

        // hide top-menu if no items are hidden
        if (this.topmenu) {
            if (hiddencount == 0) {
                this.topmenu.menuElement.classList.add("RUSKHiddenItem");
                this.topmenu.getAction(this.SHOW_THREADS).hide();
                this.topmenu.getAction(this.HIDE_THREADS).show();
            }
            else {
                this.topmenu.menuElement.classList.remove("RUSKHiddenItem");
                this.topmenu.getAction(this.HIDE_THREADS).hide();
                this.topmenu.getAction(this.SHOW_THREADS).show();
            }
        }
    }

    private getConfigItem(setting: string): string {
        try {
            for (let i = 0; i < this.cfg.settings.length; i++) {
                if (this.cfg.settings[i].setting == setting) {
                    return this.cfg.settings[i].value as string;
                }
            }
            console.log("did not find setting '" + setting);
        } catch (e) {
            console.error("getConfigItem exception: " + e.message);
        }
    }

    private saveHideThreads(): void {
        var hidden = JSON.stringify(this.hideThreads);
        this.cfg.ChangeSetting("hideThreads", hidden);
    }
};