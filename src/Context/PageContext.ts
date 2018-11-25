/**
 * PageContext - Object that gets passed to each plugin at execution time
 */

export class PageContext {

    /** Gets the username of the logged in user, or undefined if user is not logged in or unknown */
    public readonly username: string;

    constructor() {
        this.username = this.tryGetUsername();
    }

    tryGetUsername(): string {

        let selector = "body > table:nth-child(3) > tbody > tr:nth-child(2) > td:nth-child(4) > table > tbody > tr > td > font > p:nth-child(3) > table:nth-child(1) > tbody > tr:nth-child(2) > td > span > a:nth-child(3)";
        var linkElement = document.querySelectorAll(selector)[0] as HTMLAnchorElement;

        var content = linkElement.innerText;
        // Log out [ OrionPax ]
        var match = content.match(/Log out \[ (.*) \]$/);
        if (match == null) {
            return undefined;
        }
        return match[1];
    }
}