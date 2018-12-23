import { ExtensionModule } from "./ExtensionModule";
import { ConfigOptions } from "../Configuration/ConfigOptions";
import { SettingType } from "../Configuration/SettingType";
import { RBKwebPageType } from "../Context/RBKwebPageType";
import { ConfigBuilder } from "../Configuration/ConfigBuilder";
import { ModuleConfiguration } from "../Configuration/ModuleConfiguration";
import { ConfigurationOptionVisibility } from "../Configuration/ConfigurationOptionVisibility";
import { PageContext } from "../Context/PageContext";
import { ThreadInfo } from "../Utility/ThreadInfo";

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

    execute = (context: PageContext) => {
        if (!this.topics) return;

        // set up top-toggle
        var toptoggle = null;
        document.body.querySelectorAll("tr td span.nav a").forEach(function(elt, idx, parent) {
            if (idx == 0 && elt.getAttribute('href') == "index.php") {
                elt.closest("tr").insertAdjacentHTML('beforeend',
                    '<td align="right" valign="bottom">' +
                    '<a id="toptoggle" title="Show hidden">' +
                    '<img src="'+chrome.runtime.getURL("/img/green.png")+'" width="14" height="14" border="0"/>' +
                    '</a></td>');
                toptoggle = elt.closest('table').querySelector("a#toptoggle") as HTMLAnchorElement;
                toptoggle.addEventListener('click', function(ev) {
                    // FIXME: showthreads();
                    this.topics.forEach(function(thread, idx, threads) {
                        thread.rowElement.classList.remove("RUSKHiddenItem");
                    }.bind(this));
                }.bind(this));
            }
        }.bind(this));

        // set up thread toggles
        this.topics.forEach(function(thread, idx, threads) {
            var row = thread.rowElement as HTMLTableRowElement;
            var img = row.firstElementChild.querySelector("img") as HTMLImageElement;
            img.height = 12;
            img.width = 12;
            img.insertAdjacentHTML('beforebegin',
                '<a class="nav" id="' + thread.threadid + 'green" title="Show">' +
                '<img src="' + chrome.runtime.getURL("/img/green.png") + '" valign="top" width="12" height="12" class="RUSKKillTopicBullet"/></a>' +
                '<a class="nav" id="' + thread.threadid + 'red" title="Hide">' +
                '<img src="' + chrome.runtime.getURL("/img/red.png") + '" valign="top" width="12" height="12" class="RUSKKillTopicBullet"/></a> ');
            var reda = row.firstElementChild.querySelector('a[id="' + thread.threadid + 'red"]') as HTMLAnchorElement;
            var greena = row.firstElementChild.querySelector('a[id="' + thread.threadid + 'green"]') as HTMLAnchorElement;
            reda.addEventListener('click', function(ev) {
                try {
                    this.hideThreads.push(thread.threadid);
                    this.saveHideThreads();
                    thread.rowElement.classList.add("RUSKHiddenItem");
                    toptoggle.classList.remove("RUSKHiddenItem");
                    reda.classList.add("RUSKHiddenItem");
                    greena.classList.remove("RUSKHiddenItem");
                } catch (e) {
                    console.log("exception click red: " + e.message);
                }
            }.bind(this));
            greena.addEventListener('click', function(ev) {
                try {
                    this.hideThreads = this.hideThreads.filter((num) => { return num != thread.threadid });
                    this.saveHideThreads();
                    thread.rowElement.classList.remove("RUSKHiddenItem");
                    var count = 0;
                    this.topics.forEach(function(thread, idx, threads) {
                        if (this.hideThreads.indexOf(thread.threadid) != -1) { count += 1; }
                    }.bind(this));
                    if (count == 0) toptoggle.classList.add("RUSKHiddenItem");
                    greena.classList.add("RUSKHiddenItem");
                    reda.classList.remove("RUSKHiddenItem");
                } catch (e) {
                    console.log("gren click exception: " + e.message);
                }
            }.bind(this));
        }.bind(this));

        // hide threads
        var hiddencount = 0;
        this.topics.forEach(function(thread, idx, threads) {
            try {
                if (this.hideThreads.indexOf(thread.threadid) != -1) {
                    hiddencount += 1;
                    thread.rowElement.classList.add("RUSKHiddenItem");
                    (thread.rowElement.querySelector('a[id="' + thread.threadid + 'red"]') as HTMLAnchorElement).classList.add("RUSKHiddenItem");
                } else {
                    (thread.rowElement.querySelector('a[id="' + thread.threadid + 'green"]') as HTMLAnchorElement).classList.add("RUSKHiddenItem");
                }
            } catch (e) {
                console.error("exception: " + e.message);
            }
        }.bind(this));

        // hide top-toggle if no items are hidden
        if (hiddencount == 0) {
            toptoggle.classList.add("RUSKHiddenItem");
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