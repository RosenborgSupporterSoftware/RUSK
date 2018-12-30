import { ExtensionModule } from "./ExtensionModule";
import { SettingType } from "../Configuration/SettingType";
import { PageContext } from "../Context/PageContext";
import { RBKwebPageType } from "../Context/RBKwebPageType";
import { ConfigBuilder } from "../Configuration/ConfigBuilder";
import { ModuleConfiguration } from "../Configuration/ModuleConfiguration";
import { PostInfo } from "../Utility/PostInfo";

const SCROLLDIRECTION_KEY = "RUSK-PostPage-ScrollDirection";

/**
 * EM_ColorizePosts - Extension module for colorizing posts on RBKweb.
 * Unread posts are colorized green.
 * Locates a "selectedItem" and colorizes it another color (beige?).
 * User can move selectedItem to next/previous with hotkeys "j" and "k".
 * When landing on a page or moving to next/previous selectedItem, it is scrolled into view
 */

export class ColorizePosts implements ExtensionModule {

    readonly name: string = "ColorizePosts";
    cfg: ModuleConfiguration;
    currentlySelectedItem: PostInfo = null;
    allPosts: Array<PostInfo> = null;

    private _unreadColorEven: string;
    private _unreadColorOdd: string;
    private _readColorEven: string;
    private _readColorOdd: string;
    private _selectedUnread: string;
    private _selectedRead: string;

    pageTypesToRunOn: Array<RBKwebPageType> = [
        RBKwebPageType.RBKweb_FORUM_POSTLIST
    ];

    runBefore: Array<string> = [];
    runAfter: Array<string> = [];

    configSpec = () =>
        ConfigBuilder
            .Define()
            .EnabledByDefault()
            .WithExtensionModuleName(this.name)
            .WithDisplayName("Fargelegging av innlegg")
            .WithDescription("Denne modulen fargelegger innlegg på RBKweb i henhold til status.")
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
                    .WithLabel("Farge for valgt innlegg")
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
        chrome.runtime.sendMessage({ css });
    }

    execute = (context: PageContext) => {
        this.allPosts = context.RUSKPage.items as Array<PostInfo>;
        this.allPosts.forEach((post, index) => {
            this.tagRows(post, index);
        });

        this.determineSelectedItem(this.allPosts);
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
            if (ev.code == "KeyG") {
                this.cfg.ChangeSetting("UnreadColorEven", "lightgreen");
            }
            if (ev.code == "KeyB") {
                this.cfg.ChangeSetting("UnreadColorEven", "black");
            }
            if (ev.code == "KeyO" || ev.code == "KeyH") {
                this.goUp();
            }
            if (ev.code == "KeyR") {
                this.replyToSelected();
            }
            if (ev.code == "KeyN") {
                this.newTopic();
            }
            if (ev.code == "KeyE") {
                this.editSelected();
            }
            if (ev.code == "KeyQ") {
                this.quoteSelected();
            }
            if (ev.code == "KeyI") {
                this.getIpInformation();
            }
        });
        document.addEventListener("keyup", (ev) => {
            // Captures lower level, "unprintable" keys unlike keypress above
            if (ev.code == "Delete") {
                this.deleteSelected();
            }
        });
    }

    private selectNextItem() {
        let currentIndex = this.allPosts.indexOf(this.currentlySelectedItem);
        let newIndex = currentIndex + 1;
        if (newIndex >= this.allPosts.length)
            newIndex = 0;
        this.selectNewItem(this.allPosts[newIndex]);
    }

    private selectPreviousItem() {
        let currentIndex = this.allPosts.indexOf(this.currentlySelectedItem);
        let newIndex = currentIndex - 1;
        if (newIndex < 0)
            newIndex = this.allPosts.length - 1;
        this.selectNewItem(this.allPosts[newIndex]);
    }

    private goToNextPage() {
        let links = (document.querySelectorAll('span.gensmall b a') as NodeListOf<HTMLAnchorElement>);
        links.forEach(el => {
            if (el.textContent == 'Next' || el.textContent == 'Neste') {
                localStorage.setItem(SCROLLDIRECTION_KEY, "FromNewer");
                window.location.href = el.href;
            }
        });
    }

    private goToPreviousPage() {
        let links = (document.querySelectorAll('span.gensmall b a') as NodeListOf<HTMLAnchorElement>);
        links.forEach(el => {
            if (el.textContent == 'Previous' || el.textContent == 'Forrige') {
                localStorage.setItem(SCROLLDIRECTION_KEY, "FromOlder");
                window.location.href = el.href;
            }
        });
    }

    private goUp() {
        window.location.href = (document
            .querySelector(
                'body > table:nth-child(3) > tbody > tr:nth-child(2) > td:nth-child(4) > table > tbody > tr > td > font > p:nth-child(3) > table:nth-child(3) > tbody > tr > td:nth-child(2) > span > a:nth-child(2)'
            ) as HTMLAnchorElement).href;
    }

    private replyToSelected() {
        if (this.currentlySelectedItem) {
            // Lagre hva vi skal svare på! Dette plukkes etterhvert opp av plugin for posting-side.
            var replyObject = {
                date: this.currentlySelectedItem.postedDate,
                text: this.currentlySelectedItem.postTextBody,
                author: this.currentlySelectedItem.posterNickname
            };
            localStorage.setItem('ruskReplyObject', JSON.stringify(replyObject));
        }
        let image = document.querySelector('img[src$="reply.gif"]') as HTMLImageElement;
        let anchor = image.parentNode as HTMLAnchorElement;
        window.location.href = anchor.href;
    }

    private newTopic() {
        let image = document.querySelector('img[src$="post.gif"]') as HTMLImageElement;
        let anchor = image.parentNode as HTMLAnchorElement;
        window.location.href = anchor.href;
    }

    private editSelected() {
        if (!this.currentlySelectedItem.editUrl || this.currentlySelectedItem.editUrl.length == 0) return;
        window.location.href = this.currentlySelectedItem.editUrl;
    }

    private quoteSelected() {
        if (!this.currentlySelectedItem.quoteUrl || this.currentlySelectedItem.quoteUrl.length == 0) return;
        window.location.href = this.currentlySelectedItem.quoteUrl;
    }

    private getIpInformation() {
        if (!this.currentlySelectedItem.ipInfoUrl || this.currentlySelectedItem.ipInfoUrl.length == 0) return;
        window.location.href = this.currentlySelectedItem.ipInfoUrl;
    }
    private deleteSelected() {
        if (!this.currentlySelectedItem.deleteUrl || this.currentlySelectedItem.deleteUrl.length == 0) return;
        window.location.href = this.currentlySelectedItem.deleteUrl;
    }

    private determineSelectedItem(posts: Array<PostInfo>): void {
        if (posts.length == 0) return;

        let urlMatch = window.location.href.match(/^.*\/forum\/viewtopic\.php\?p=(\d+)(&highlight=)?#\1$/);
        if (urlMatch) {
            let target = +urlMatch[1];
            for (let i = 0; i < posts.length; i++) {
                if (posts[i].postid == target) {
                    this.selectNewItem(posts[i], true);
                    return;
                }
            }
        }

        for (let i = 0; i < posts.length; i++) {
            if (posts[i].isUnread) {
                this.selectNewItem(posts[i]);
                return;
            }
        }

        let scrollDirection = localStorage.getItem(SCROLLDIRECTION_KEY);
        if (scrollDirection) {
            if (scrollDirection == "FromOlder") {
                this.selectNewItem(posts[posts.length - 1]);
            } else if (scrollDirection == "FromNewer") {
                this.selectNewItem(posts[0]);
            }
            localStorage.removeItem(SCROLLDIRECTION_KEY);
            return;
        }

        this.selectNewItem(posts[posts.length - 1]);
    }

    private selectNewItem(newItem: PostInfo, skipScrolling: boolean = false) {
        if (this.currentlySelectedItem != null) {
            this.currentlySelectedItem.rowElement.classList.remove("RUSKSelectedItem");
        }

        newItem.rowElement.classList.add("RUSKSelectedItem");
        this.currentlySelectedItem = newItem;
        if (!skipScrolling) {
            let obj = newItem.rowElement as any;    // Typescript disagrees about scrollIntoViewIfNeeded existing on HTML elements
            obj.scrollIntoViewIfNeeded();
        }
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

    private getConfigItem(setting: string): string {
        for (let i = 0; i < this.cfg.settings.length; i++) {
            if (this.cfg.settings[i].setting == setting) {
                return this.cfg.settings[i].value as string;
            }
        }
    }

    private tagRows(post: PostInfo, index: number): void {
        let row = post.rowElement;

        row.classList.add('RUSKItem');

        if (post.isUnread) {
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
