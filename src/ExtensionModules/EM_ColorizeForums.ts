import { ExtensionModule } from "./ExtensionModule";
import { SettingType } from "../Configuration/SettingType";
import { PageContext } from "../Context/PageContext";
import { RBKwebPageType } from "../Context/RBKwebPageType";
import { ConfigBuilder } from "../Configuration/ConfigBuilder";
import { ModuleConfiguration } from "../Configuration/ModuleConfiguration";
import { ForumInfo } from "../Utility/ForumInfo";

/**
 * EM_ColorizeForums - Extension module for colorizing forums on RBKweb.
 * Unread forums are colorized green.
 * Locates a "selectedItem" and colorizes it another color (beige?).
 * User can move selectedItem to next/previous with hotkeys "j" and "k".
 * User can move into selectedItem by pressing enter.
 */

export class ColorizeForums implements ExtensionModule {

    readonly name: string = "ColorizeForums";
    cfg: ModuleConfiguration;
    currentlySelectedItem: ForumInfo = null;
    allForums: Array<ForumInfo> = null;

    private _unreadColorEven: string;
    private _unreadColorOdd: string;
    private _readColorEven: string;
    private _readColorOdd: string;
    private _selectedUnread: string;
    private _selectedRead: string;

    pageTypesToRunOn: Array<RBKwebPageType> = [
        RBKwebPageType.RBKweb_FORUM_FORUMLIST
    ];

    runBefore: Array<string> = [];
    runAfter: Array<string> = [];

    configSpec = () =>
        ConfigBuilder
            .Define()
            .EnabledByDefault()
            .WithExtensionModuleName(this.name)
            .WithDisplayName("Fargelegging av forum")
            .WithDescription("Denne modulen fargelegger forum på RBKweb i henhold til status.")
            .WithConfigOption(opt =>
                opt
                    .WithSettingName("UnreadColorEven")
                    .WithLabel("Farge for uleste tråder (liketallslinjer)")
                    .WithSettingType(SettingType.color)
                    .WithDefaultValue('#90EE90')
                    .AsSharedSetting()
            )
            .WithConfigOption(opt =>
                opt
                    .WithSettingName("UnreadColorOdd")
                    .WithLabel("Farge for uleste tråder (oddetallslinjer)")
                    .WithSettingType(SettingType.color)
                    .WithDefaultValue('#A0FEA0')
                    .AsSharedSetting()
            )
            .WithConfigOption(opt =>
                opt
                    .WithSettingName("ReadColorEven")
                    .WithLabel("Farge for leste tråder (liketallslinjer)")
                    .WithSettingType(SettingType.color)
                    .WithDefaultValue('#FFFFFF')
                    .AsSharedSetting()
            )
            .WithConfigOption(opt =>
                opt
                    .WithSettingName("ReadColorOdd")
                    .WithLabel("Farge for leste tråder (oddetallslinjer)")
                    .WithSettingType(SettingType.color)
                    .WithDefaultValue('#EFEFEF')
                    .AsSharedSetting()
            )
            .WithConfigOption(opt =>
                opt
                    .WithSettingName("SelectedItemColor")
                    .WithLabel("Farge for valgt tråd")
                    .WithSettingType(SettingType.color)
                    .WithDefaultValue('#DDE7C7')
                    .AsSharedSetting()
            )
            .WithConfigOption(opt =>
                opt
                    .WithSettingName("SelectedUnreadItemColor")
                    .WithLabel("Farge for valgt tråd")
                    .WithSettingType(SettingType.color)
                    .WithDefaultValue('#EDEEC9')
                    .AsSharedSetting()
            )
            .Build();

    init = (config: ModuleConfiguration) => {
        this.cfg = config;

        this._unreadColorEven = this.cfg.GetSetting("UnreadColorEven") as string;
        this._unreadColorOdd = this.cfg.GetSetting("UnreadColorOdd") as string;
        this._readColorEven = this.cfg.GetSetting("ReadColorEven") as string;
        this._readColorOdd = this.cfg.GetSetting("ReadColorOdd") as string;
        this._selectedRead = this.cfg.GetSetting("SelectedItemColor") as string;
        this._selectedUnread = this.cfg.GetSetting("SelectedUnreadItemColor") as string;
    }

    preprocess = async () => {
        let request = await fetch(chrome.runtime.getURL("data/colorizeThreads.css"));
        let text = await request.text();

        let css = this.hydrateTemplate(text);
        chrome.runtime.sendMessage({ css: css, from: this.name });
    }

    execute = (context: PageContext) => {
        this.allForums = context.RUSKPage.items as Array<ForumInfo>;

        this.allForums.forEach((thread, index) => {
            this.tagRows(thread, index);
        });

        this.determineSelectedItem(this.allForums);
        this.setupHotkeys();
    }

    private setupHotkeys(): void {
        // TODO: Dette er ondskap å gjøre her. Må få inn eget hotkey-regime.
        document.addEventListener("keypress", (ev) => {
            if (ev.code == "KeyJ") {
                this.selectNextItem();
            }
            if (ev.code == "KeyK") {
                this.selectPreviousItem();
            }
            if (ev.code == "KeyG") {
                this.cfg.ChangeSetting("UnreadColorEven", "lightgreen");
            }
            if (ev.code == "KeyB") {
                this.cfg.ChangeSetting("UnreadColorEven", "black");
            }
            if (ev.keyCode == 13 || ev.code == "KeyL") {
                this.goToSelectedItem();
            }
        })
    }

    private selectNextItem() {
        let currentIndex = this.allForums.indexOf(this.currentlySelectedItem);
        let newIndex = currentIndex + 1;
        if (newIndex >= this.allForums.length)
            newIndex = 0;
        this.selectNewItem(this.allForums[newIndex]);
    }

    private selectPreviousItem() {
        let currentIndex = this.allForums.indexOf(this.currentlySelectedItem);
        let newIndex = currentIndex - 1;
        if (newIndex < 0)
            newIndex = this.allForums.length - 1;
        this.selectNewItem(this.allForums[newIndex]);
    }

    private goToSelectedItem() {
        if (this.currentlySelectedItem == null) return;

        window.location.href = this.currentlySelectedItem.baseUrl;
    }

    private determineSelectedItem(threads: Array<ForumInfo>): void {
        if (threads.length == 0) return;

        let bestCandidate: ForumInfo = null;

        let getWinner = (first: ForumInfo, second: ForumInfo) => {
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

    private selectNewItem(newItem: ForumInfo) {
        if (this.currentlySelectedItem != null) {
            this.currentlySelectedItem.rowElement.classList.remove("RUSKSelectedItem");
        }

        newItem.rowElement.classList.add("RUSKSelectedItem");
        this.currentlySelectedItem = newItem;
        let obj = newItem.rowElement as any;
        obj.scrollIntoViewIfNeeded();
        //newItem.rowElement.scrollIntoView({behavior: "instant", block: "nearest", inline: "nearest"});
    }

    private hydrateTemplate(template: string): string {
        let replacements = new Map<string, string>();
        replacements.set('$RUSKUnreadItemEven$', this._unreadColorEven);
        replacements.set('$RUSKUnreadItemOdd$', this._unreadColorOdd);
        replacements.set('$RUSKReadItemEven$', this._readColorEven);
        replacements.set('$RUSKReadItemOdd$', this._readColorOdd);
        replacements.set('$RUSKSelectedUnread$', this._selectedUnread);
        replacements.set('$RUSKSelectedRead$', this._selectedRead);

        replacements.forEach((val, key) => {
            template = template.replace(key, val);
        });

        return template;
    }

    private tagRows(forum: ForumInfo, index: number): void {
        let row = forum.rowElement;

        row.classList.add('RUSKItem');
        if (forum.isUnread) {
            row.classList.add('RUSKUnreadItem');
        } else {
            row.classList.add('RUSKReadItem');
        }
        if (index % 2 == 0) {
            row.classList.add('RUSKEvenRowItem');
        } else {
            row.classList.add('RUSKOddRowItem');
        }
    }
}
