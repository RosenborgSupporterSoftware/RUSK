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
 * User can move selectedItem to next/previous with hotkeys "j" and "k".
 * User can move to next/previous page with hotkeys "shift+j" and "shift+k".
 * User can move into selectedItem by pressing enter.
 * User can move to forum list by pressing "o".
 */

export class ColorizeThreads implements ExtensionModule {

    readonly name: string = "Fargelegging av tråder";
    cfg: ModuleConfiguration;
    currentlySelectedItem: ThreadInfo = null;
    allThreads: Array<ThreadInfo> = null;

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

    preprocess = async () => {
        let request = await fetch(chrome.runtime.getURL("data/colorizeThreads.css"));
        let text = await request.text();

        let css = this.hydrateTemplate(text);
        chrome.runtime.sendMessage({ css });
    }

    execute = (context: PageContext) => {
        this.allThreads = ThreadInfo.GetThreadsFromDocument(document);

        this.allThreads.forEach((thread, index) => {
            this.tagRows(thread, index);
        });

        this.determineSelectedItem(this.allThreads);
        this.setupHotkeys();
    }

    private setupHotkeys(): void {
        // TODO: Dette er ondskap å gjøre her. Må få inn eget hotkey-regime.

        document.addEventListener("keypress", (ev) => {
            if (ev.code == "KeyJ") {
                if (ev.shiftKey) {
                    // Go to next page
                    this.goToNextPage();
                } else {
                    this.selectNextItem();
                }
            }
            if (ev.code == "KeyK") {
                if (ev.shiftKey) {
                    this.goToPreviousPage();
                } else {
                    this.selectPreviousItem();
                }
            }
            if (ev.key == 'o' || ev.code == "KeyH") {
                this.goUp();
            }
            if (ev.keyCode == 13 || ev.code == "KeyL") {
                this.goToSelectedItem();
            }
        })
    }

    private goToNextPage() {
        let links = (document.querySelectorAll('span.gensmall b a') as NodeListOf<HTMLAnchorElement>);
        links.forEach(el => {
            if (el.textContent == 'Next' || el.textContent == 'Neste') {
                window.location.href = el.href;
            }
        });
    }

    private goToPreviousPage() {
        let links = (document.querySelectorAll('span.gensmall b a') as NodeListOf<HTMLAnchorElement>);
        links.forEach(el => {
            if (el.textContent == 'Previous' || el.textContent == 'Forrige') {
                window.location.href = el.href;
            }
        });
    }

    private selectNextItem() {
        let currentIndex = this.allThreads.indexOf(this.currentlySelectedItem);
        let newIndex = currentIndex + 1;
        if (newIndex >= this.allThreads.length)
            newIndex = 0;
        this.selectNewItem(this.allThreads[newIndex]);
    }

    private selectPreviousItem() {
        let currentIndex = this.allThreads.indexOf(this.currentlySelectedItem);
        let newIndex = currentIndex - 1;
        if (newIndex < 0)
            newIndex = this.allThreads.length - 1;
        this.selectNewItem(this.allThreads[newIndex]);
    }

    private goToSelectedItem() {
        // FIXME: Denne settes kun når man går inn via tastatur, ikke via musklikk. Kan vi fikse det?
        localStorage.setItem('ruskLastEnterThreadSource', window.location.href);
        if (this.currentlySelectedItem == null) return;

        window.location.href = this.currentlySelectedItem.latestUrl;
    }

    private goUp() {
        window.location.href = (document.querySelector('form > table > tbody > tr:nth-child(2) > td:nth-child(2) > span.nav > a.nav') as HTMLAnchorElement).href;
    }

    private determineSelectedItem(threads: Array<ThreadInfo>): void {
        if (threads.length == 0) return;

        let bestCandidate: ThreadInfo = null;

        let getWinner = (first: ThreadInfo, second: ThreadInfo) => {
            if (first == null) {
                return second;
            } else if (second == null) {
                return first;
            }

            if (first.isUnread != second.isUnread) {
                if (first.isUnread) {
                    return first;
                }
                return second;
            }

            if (first.lastUpdate >= second.lastUpdate) {
                return first;
            }
            return second;
        }

        for (let i = 0; i < threads.length; i++) {
            bestCandidate = getWinner(bestCandidate, threads[i]);
        }

        this.selectNewItem(bestCandidate);
    }

    private selectNewItem(newItem: ThreadInfo) {
        if (this.currentlySelectedItem != null) {
            this.currentlySelectedItem.rowElement.classList.remove("RUSKSelectedItem");
        }

        newItem.rowElement.classList.add("RUSKSelectedItem");
        this.currentlySelectedItem = newItem;
        newItem.rowElement.scrollIntoView({behavior: "instant", block: "nearest", inline: "nearest"});
    }

    private hydrateTemplate(template: string): string {
        let keys = [], values = [];
        keys.push("$RUSKUnreadItem$");
        values.push(this.getConfigItem('UnreadColorEven'));

        for (let i = 0; i < keys.length; i++) {
            template = template.replace(keys[i], values[i]);
        }

        return template;
    }

    private getConfigItem(setting: string): string {
        for (let i = 0; i < this.cfg.settings.length; i++) {
            if (this.cfg.settings[i].setting == setting) {
                return this.cfg.settings[i].value as string;
            }
        }
    }

    private tagRows(thread: ThreadInfo, index: number): void {
        let row = thread.rowElement;

        row.classList.add('RUSKItem');
        if (thread.isUnread) {
            row.classList.add('RUSKUnreadItem');
        }
        if (thread.threadType == ThreadType.Announcement) {
            row.classList.add('RUSKAnnouncementItem');
        } else if (thread.threadType == ThreadType.Sticky) {
            row.classList.add('RUSKStickyItem');
        }
        if (thread.isLocked) {
            row.classList.add('RUSKLockedItem');
        }
        if (index % 2 == 0) {
            row.classList.add('RUSKEvenRowItem');
        } else {
            row.classList.add('RUSKOddRowItem');
        }
    }
}
