import { ExtensionModule } from "./ExtensionModule";
import { SettingType } from "../Configuration/SettingType";
import { PageContext } from "../Context/PageContext";
import { ThreadInfo } from "../Utility/ThreadInfo";
import { ThreadType } from "../Context/ThreadType";
import { RBKwebPageType } from "../Context/RBKwebPageType";
import { ConfigBuilder } from "../Configuration/ConfigBuilder";
import { ModuleConfiguration } from "../Configuration/ModuleConfiguration";

/**
 * EM_ColorizeThreads - Extension module for colorizing threads on RBKweb.
 * Unread threads are colorized green.
 * Locates a "selectedItem" and colorizes it another color (beige?).
 * User can move selectedItem to next/previous with hotkeys "," and ".".
 * User can move into selectedItem by pressing enter.
 * User can move to forum list by pressing "o".
 */

export class ColorizeThreads implements ExtensionModule {

    readonly name: string = "Fargelegging av tråder";
    cfg: ModuleConfiguration;

    pageTypesToRunOn: Array<RBKwebPageType> = [
        RBKwebPageType.RBKweb_FORUM_TOPICLIST
    ];

    runBefore: Array<string> = [];
    runAfter: Array<string> = [];

    configSpec = () =>
        ConfigBuilder
            .Define()
            .EnabledByDefault()
            .WithExtensionModuleName(this.name)
            .WithDisplayName("Fargelegging av tråder")
            .WithDescription("Denne modulen fargelegger tråder på RBKweb i henhold til status.")
            .WithConfigOption(opt =>
                opt
                    .WithSettingName("UnreadColorEven")
                    .WithLabel("Farge for uleste tråder (liketallslinjer)")
                    .WithSettingType(SettingType.color)
                    .WithDefaultValue('lightgreen')
                    .AsSharedSetting()
            )
            .WithConfigOption(opt =>
                opt
                    .WithSettingName("UnreadColorOdd")
                    .WithLabel("Farge for uleste tråder (oddetallslinjer)")
                    .WithSettingType(SettingType.color)
                    .WithDefaultValue('lightgreen')
                    .AsSharedSetting()
            )
            .WithConfigOption(opt =>
                opt
                    .WithSettingName("ReadColorEven")
                    .WithLabel("Farge for leste tråder (liketallslinjer)")
                    .WithSettingType(SettingType.color)
                    .WithDefaultValue('white')
                    .AsSharedSetting()
            )
            .WithConfigOption(opt =>
                opt
                    .WithSettingName("ReadColorOdd")
                    .WithLabel("Farge for leste tråder (oddetallslinjer)")
                    .WithSettingType(SettingType.color)
                    .WithDefaultValue('white')
                    .AsSharedSetting()
            )
            .WithConfigOption(opt =>
                opt
                    .WithSettingName("SelectedItemColor")
                    .WithLabel("Farge for valgt tråd")
                    .WithSettingType(SettingType.color)
                    .WithDefaultValue('DDE7C7')
                    .AsSharedSetting()
            )
            .Build();

    init = (config: ModuleConfiguration) => {
        this.cfg = config;
    }

    preprocess = () => {
    }

    execute = (context: PageContext) => {
        let threads = ThreadInfo.GetThreadsFromDocument(document);

        threads.forEach((thread, index) => {
            this.tagRows(thread, index);
        })
    }

    private tagRows(thread: ThreadInfo, index: number): void {
        let classes = new Array<string>();

        classes.push('RwESItem');
        if (thread.isUnread) {
            classes.push('RwESUnreadItem');
        }
        if (thread.threadType == ThreadType.Announcement) {
            classes.push('RwESAnnouncementItem');
        } else if (thread.threadType == ThreadType.Sticky) {
            classes.push('RwESStickyItem');
        }
        if (thread.isLocked) {
            classes.push('RwESLockedItem');
        }
        if (index % 2 == 0) {
            classes.push('RwESEvenRowItem');
        } else {
            classes.push('RwESOddRowItem');
        }
        thread.rowElement.className = classes.join(" ");
    }
}
