import { ExtensionModule } from "./ExtensionModule";
import { ConfigOptions } from "../Configuration/ConfigOptions";
import { SettingType } from "../Configuration/SettingType";
import { PageContext } from "../Context/PageContext";
import { ThreadInfo } from "../Utility/ThreadInfo";
import { ThreadType } from "../Context/ThreadType";

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
    urlsToRunOn: Array<RegExp> = [/\/forum\/viewforum\.php\?f=\d+/];

    runBefore: Array<string> = [];
    runAfter: Array<string> = [];

    getConfigOptions = (): ConfigOptions => {
        return {
            displayName: "Fargelegging av tråder",
            options: [
                {
                    setting: "unreadColor",
                    type: SettingType.color,
                    label: "Farge for uleste tråder"
                },
                {
                    setting: "selectedItemColor",
                    type: SettingType.color,
                    label: "Farge for valgt tråd"
                }
            ]
        }
    };

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
