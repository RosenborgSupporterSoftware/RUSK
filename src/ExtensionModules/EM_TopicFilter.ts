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
 * EM_UserFilter - Extension module for RBKweb.
 */

// FIXME: common preprocessing step with UsernameTracker, SignatureFilter (marking userid
// on username DOM objects)

export class TopicFilter implements ExtensionModule {
    readonly name : string = "TopicFilter";
    cfg: ModuleConfiguration;

    pageTypesToRunOn: Array<RBKwebPageType> = [
        RBKwebPageType.RBKweb_FORUM_ALL // FIXME: only post views
    ];

    runBefore: Array<string> = ['late-extmod'];
    runAfter: Array<string> = ['early-extmod'];

    configSpec = () =>
        ConfigBuilder
            .Define()
            .EnabledByDefault()
            .WithExtensionModuleName("TopicFilter")
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
        //this.hideThreads.push(5976); // Framtidige trenerkandidater
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
        this.topics.forEach(function(thread, idx, threads) {
            console.log("checking thread " + thread.threadid);
            try {
                if (this.hideThreads.indexOf(thread.threadid) != -1) {
                    thread.rowElement.style.display = "none";
                }
            } catch (e) {
                console.error("exception: " + e.message);
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

    private saveHideThreads(): void {
        var hidden = JSON.stringify(this.hideThreads);
        this.cfg.ChangeSetting("hideThreads", hidden);
    }
};