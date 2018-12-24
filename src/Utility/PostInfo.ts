import { ContextMenu } from "./ContextMenu";

/**
 * PostInfo.ts - utility class used to extract information from individual posts
 */

export class PostInfo {
    /**
    * Extracts PostInfo objects from the passed-in document
    * @param {Document} document - The document (DOM) to query for post objects, substitutable for testing purposes
    */
    public static GetPostsFromDocument(document: Document): Array<PostInfo> {
        let posts = new Array<PostInfo>();

        document.querySelectorAll('table.forumline > tbody > tr > td:last-child:nth-child(2)').forEach((element: HTMLTableCellElement) => {
            if (element.querySelector('span.postbody')) {
                posts.push(new PostInfo(element.parentElement as HTMLTableRowElement));
            }
        });
        return posts;
    }

    /** The row element from the DOM */
    readonly rowElement: HTMLTableRowElement;

    /** The subsequent rown with buttons/actions from the DOM */
    readonly buttonRowElement: HTMLTableRowElement;

    /** The title of the post (if any) */
    readonly postTitle: string;

    /** Whether or not the post is unread */
    readonly isUnread: boolean;

    /** The url of the post */
    readonly baseUrl: string;

    readonly quoteUrl: string;

    readonly editUrl: string;

    readonly deleteUrl: string;

    readonly ipInfoUrl: string;

    readonly postid: number;

    readonly postedDate: Date;

    readonly posterNickname: string;

    readonly posterid: number;

    readonly posterLevel: string;

    readonly postTextBody: string;

    readonly postBodyElement: HTMLSpanElement;

    readonly posterRegistered: Date;

    readonly posterPosts: number;

    readonly posterLocation: string;

    readonly threadId: number;

    /** Create a new PostInfo object based on parsing of a passed HTMLTableRowElement */
    constructor(row: HTMLTableRowElement) {
        this.rowElement = row;
        this.buttonRowElement = row.nextElementSibling as HTMLTableRowElement;

        try {
            this.postTitle = this.getTitle(row);
            this.isUnread = this.getUnreadState(row);
            this.baseUrl = this.getPostUrl(row);
            this.quoteUrl = this.getQuoteUrl(row);
            this.editUrl = this.getEditUrl(row);
            this.deleteUrl = this.getDeleteUrl(row);
            this.ipInfoUrl = this.getIpInfoUrl(row);
            this.postid = this.getPostId(row);
            this.postedDate = this.getPostedDate(row);
            this.posterNickname = this.getPosterNickname(row);
            this.posterid = this.getPosterId(row);
            this.posterLevel = this.getPosterLevel(row);
            this.postTextBody = this.getPostTextBody(row);
            this.postBodyElement = this.getPostBodyElement(row);
            this.posterRegistered = this.getPosterRegistered(row);
            this.posterPosts = this.getPosterPosts(row);
            this.posterLocation = this.getPosterLocation(row);
            this.threadId = this.getThreadId(row);
        } catch (e) {
            chrome.runtime.sendMessage({ module: "PostInfo", message: e.message, exception: e });
        }
    }

    public getContextMenu(): ContextMenu {
        try {
            var menu = new ContextMenu(this.rowElement, "post");
            return menu;
        } catch (e) {
            console.error("exception: " + e.message);
        }
        return null;
    }

    private getTitle(row: HTMLTableRowElement): string {
        let textContent = row.querySelector('td:nth-child(2) table tbody tr td span.postdetails').textContent;
        if (textContent == null) return "";
        return textContent.match(/^.*(Post subject|Tittel): (.*)$/)[2];
    }

    private getUnreadState(row: HTMLTableRowElement): boolean {
        let image = (row.querySelector('td:nth-child(2) > table > tbody > tr:nth-child(1) > td:nth-child(1) > a > img') as HTMLImageElement);
        if (image == null) return false;
        return (image.alt == "Nytt innlegg" || image.alt == "New post");
    }

    private getPostUrl(row: HTMLTableRowElement): string {
        let link = (row.querySelector('td:nth-child(2) > table > tbody > tr:nth-child(1) > td:nth-child(1) > a') as HTMLAnchorElement);
        return link == null ? "" : link.href;
    }

    private getQuoteUrl(row: HTMLTableRowElement): string {
        let image = row.querySelector('td:nth-child(2) > table > tbody > tr:nth-child(1) > td:nth-child(2) > a > img[src$="icon_quote.gif"]') as HTMLImageElement;
        if (image == null) return "";
        let link = image.parentElement as HTMLAnchorElement;
        if (link == null) return "";
        return link.href;
    }

    private getEditUrl(row: HTMLTableRowElement): string {
        let image = row.querySelector('td:nth-child(2) > table > tbody > tr:nth-child(1) > td:nth-child(2) > a > img[src$="icon_edit.gif"]') as HTMLImageElement;
        if (image == null) return "";
        let link = image.parentElement as HTMLAnchorElement;
        if (link == null) return "";
        return link.href;
    }

    private getDeleteUrl(row: HTMLTableRowElement): string {
        let image = row.querySelector('td:nth-child(2) > table > tbody > tr:nth-child(1) > td:nth-child(2) > a > img[src$="icon_delete.gif"]') as HTMLImageElement;
        if (image == null) return "";
        let link = image.parentElement as HTMLAnchorElement;
        if (link == null) return "";
        return link.href;
    }

    private getIpInfoUrl(row: HTMLTableRowElement): string {
        let image = row.querySelector('td:nth-child(2) > table > tbody > tr:nth-child(1) > td:nth-child(2) > a > img[src$="icon_ip.gif"]') as HTMLImageElement;
        if (image == null) return "";
        let link = image.parentElement as HTMLAnchorElement;
        if (link == null) return "";
        return link.href;
    }

    private getPostId(row: HTMLTableRowElement): number {
        let bnode = row.querySelector('td span.name a');
        return +bnode.getAttribute("name");
    }

    private getPostedDate(row: HTMLTableRowElement): Date {
        let text = row.querySelector('td > table > tbody > tr > td > span.postdetails').textContent;
        let dateInfo = text.match(/Posted|Skrevet: (\d{2})\.(\d{2}).(\d{4}) (\d{2}):(\d{2})/);
        return new Date(+dateInfo[3], +dateInfo[2] - 1, +dateInfo[1], +dateInfo[4], +dateInfo[5]);
    }

    private getPosterNickname(row: HTMLTableRowElement): string {
        return row.querySelector('td span.name b').textContent;
    }

    private getPosterId(row: HTMLTableRowElement): number {
        let profileLink = (this.buttonRowElement.querySelector('td > table > tbody > tr > td > a:first-child') as HTMLAnchorElement).href;
        let match = profileLink.match(/.*\/profile\.php\?mode=viewprofile&u=(\d+)$/);
        return match ? +match[1] : -1;
    }

    private getPosterLevel(row: HTMLTableRowElement): string {
        return row.querySelector('td span.postdetails').childNodes[0].textContent;
    }

    private getPostTextBody(row: HTMLTableRowElement): string {
        return this.getPostBodyElement(row).textContent;
    }

    private getPostBodyElement(row: HTMLTableRowElement): HTMLSpanElement {
        return row.querySelector('td > table > tbody > tr > td > span.postbody');
    }

    private getPosterRegistered(row: HTMLTableRowElement): Date {
        let span = row.querySelector('td > span.postdetails') as HTMLSpanElement;
        for (let i = 0; i < span.childNodes.length; i++) {
            let match = span.childNodes[i].textContent.match(/^(Registrert|Registered): (\d{2})\.(\d{2}).(\d{4})$/);
            if (match) {
                return new Date(+match[4], +match[3] - 1, +match[2]);
            }
        }
        return null;
    }

    private getPosterPosts(row: HTMLTableRowElement): number {
        let span = row.querySelector('td > span.postdetails') as HTMLSpanElement;
        for (let i = 0; i < span.childNodes.length; i++) {
            let match = span.childNodes[i].textContent.match(/^(Innlegg|Posts): (\d*)$/);
            if (match) {
                return +match[2];
            }
        }
        return 0;
    }

    private getPosterLocation(row: HTMLTableRowElement): string {
        let span = row.querySelector('td > span.postdetails') as HTMLSpanElement;
        for (let i = 0; i < span.childNodes.length; i++) {
            let match = span.childNodes[i].textContent.match(/^(Bosted|Location): (.*)$/);
            if (match) {
                return match[2];
            }
        }
        return "";
    }

    private getThreadId(row: HTMLTableRowElement): number {
        var link = row.parentElement.parentElement.parentElement.querySelector('a[href*="posting.php?mode=reply"]') as HTMLAnchorElement;
        var topicmatch = link.href.match(/.*&t=([0-9]+)/);
        if (topicmatch) return +topicmatch[1];
        return 0;
    }
}
