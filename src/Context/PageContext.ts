import { RBKwebPageType } from "./RBKwebPageType";
import { UrlParser } from "./UrlParser";
import { IRUSKPage } from "../PageHandler/IRUSKPage";
import { PostListPage } from "../PageHandler/PostListPage";
import { ThreadListPage } from "../PageHandler/ThreadListPage";
import { ForumListPage } from "../PageHandler/ForumListPage";
import { PMListPage } from "../PageHandler/PMListPage";

/**
 * PageContext - Object that gets passed to each plugin at execution time
 */

export class PageContext {

    private _username: string;
    private _customProperties: any = {};
    private _states: Array<string> = [];

    /** Gets the username of the logged in user, or undefined if user is not logged in or unknown */
    public get Username(): string {
        if(this._username == null) {
            this._username = this.tryGetUsername();
        }
        return this._username;
    }

    private _pageType: RBKwebPageType;

    /** Gets the web page type we're on */
    public get PageType(): RBKwebPageType {
        if(this._pageType == null) {
            this._pageType = this.getPageType(document.URL);
        }
        return this._pageType;
    }

    private _ruskPage: IRUSKPage;

    /** Gets an IRUSKPage object if the current page has selectable items */
    public get RUSKPage(): IRUSKPage {
        if(this._ruskPage == null) {
            this._ruskPage = this.getRuskPage(document.URL);
        }
        return this._ruskPage;
    }

    private getRuskPage(url: string): IRUSKPage {
        switch(this.PageType) {
            case RBKwebPageType.RBKweb_FORUM_FORUMLIST:
                return new ForumListPage();
            case RBKwebPageType.RBKweb_FORUM_TOPICLIST:
                return new ThreadListPage();
            case RBKwebPageType.RBKweb_FORUM_POSTLIST:
                return new PostListPage();
            case RBKwebPageType.RBKweb_FORUM_PM_INBOX:
            case RBKwebPageType.RBKweb_FORUM_PM_OUTBOX:
            case RBKwebPageType.RBKweb_FORUM_PM_READINBOX:
            case RBKwebPageType.RBKweb_FORUM_PM_SAVEBOX:
            case RBKwebPageType.RBKweb_FORUM_PM_SENTBOX:
                return new PMListPage();
        }
        return null;
    }

    private _language: string;

    public get Language(): string {
        return this._language || (this._language = this.getLanguage());
    }

    /**
     * Set a custom property value on the PageContext for others to use
     * @param key - The key name to use to set a custom property
     * @param value - The value to set for the custom property
     */
    public SetCustomProperty(key: string, value: any): void {
        this._customProperties[key] = value;
    }

    /**
     * Get a custom property value from the PageContext
     * @param key - The key name to use when fetching the custom property
     */
    public GetCustomPropery(key: string): any {
        return this._customProperties[key];
    }

    /**
     * Sets the given state on the PageContext
     * @param state The state to set
     */
    public SetState(state: string) {
        if(this._states.indexOf(state) == -1) {
            this._states.push(state);
        }
    }

    /**
     * Clears the given state from the PageContext
     * @param state The state to clear
     */
    public ClearState(state: string) {
        let index = this._states.indexOf(state);
        if(index > -1) {
            this._states.splice(index, 1);
        }
    }

    /**
     * Checks if a given state is set on the PageContext
     * @param state The state to check for
     * @returns A boolean indicating if the given state is set or not
     */
    public IsInState(state: string): boolean {
        return this._states.indexOf(state) > -1;
    }

    private getLanguage(): string {
        var pbutton = document.body.querySelector('span.mainmenu a.mainmenu[href^="profile.php?mode=editprofile"]') as HTMLAnchorElement;
        if (pbutton && pbutton.textContent == "Profil")
            return "norwegian";
        return "english";
    }

    private getPageType(url: string): RBKwebPageType {
        return new UrlParser().ParsePageType(url);
    }

    private tryGetUsername(): string {

        let selector = "body > table:nth-child(3) > tbody > tr:nth-child(2) > td:nth-child(4) > table > tbody > tr > td > font > p:nth-child(3) > table:nth-child(1) > tbody > tr:nth-child(2) > td > span > a:nth-child(3)";
        var linkElement = document.querySelector(selector) as HTMLAnchorElement;

        if (linkElement == undefined) {
            return undefined;
        }

        var content = linkElement.innerText;

        var match = content.match(/(Log out|Logg ut) \[ (.*) \]$/);
        if (match == null) {
            return undefined;
        }
        return match[2];
    }
}