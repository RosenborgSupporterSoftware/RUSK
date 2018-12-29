import { RBKwebPageType } from "./RBKwebPageType";
import { UrlParser } from "./UrlParser";
import { IRUSKPage } from "../PageHandler/IRUSKPage";
import { PostListPage } from "../PageHandler/PostListPage";
import { ThreadListPage } from "../PageHandler/ThreadListPage";
import { ForumListPage } from "../PageHandler/ForumListPage";

/**
 * PageContext - Object that gets passed to each plugin at execution time
 */

export class PageContext {

    private _username: string;

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
        // Verdens verste metodeimplementasjon - bytt til en switch eller noe, husk å få med ekstra sider på threadlist når vi får implementert for de
        if(this.PageType == RBKwebPageType.RBKweb_FORUM_FORUMLIST) {
            return new ForumListPage();
        } else if(this.PageType == RBKwebPageType.RBKweb_FORUM_TOPICLIST) {
            return new ThreadListPage();
        } else if(this.PageType == RBKwebPageType.RBKweb_FORUM_POSTLIST) {
            return new PostListPage();
        } else {
            return null;
        }
    }

    private _language: string;

    public get Language(): string {
        return this._language || (this._language = this.getLanguage());
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