import { RBKwebPageType } from "./RBKwebPageType";
import { UrlParser } from "./UrlParser";

/**
 * PageContext - Object that gets passed to each plugin at execution time
 */

export class PageContext {

    /** Gets the username of the logged in user, or undefined if user is not logged in or unknown */
    public readonly username: string;

    /** Gets the web page type we're on */
    public readonly pageType: RBKwebPageType;

    constructor() {
        this.username = this.tryGetUsername();
        this.pageType = this.getPageType(document.URL);
    }

    getPageType(url: string): RBKwebPageType {
        return new UrlParser().ParsePageType(url);
    }

    tryGetUsername(): string {

        let selector = "body > table:nth-child(3) > tbody > tr:nth-child(2) > td:nth-child(4) > table > tbody > tr > td > font > p:nth-child(3) > table:nth-child(1) > tbody > tr:nth-child(2) > td > span > a:nth-child(3)";
        var linkElement = document.querySelectorAll(selector)[0] as HTMLAnchorElement;

        var content = linkElement.innerText;

        var match = content.match(/Log out \[ (.*) \]$/);
        if (match == null) {
            return undefined;
        }
        return match[1];
    }
}