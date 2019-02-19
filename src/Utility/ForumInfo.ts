import { IRUSKPageItem } from "../PageHandler/IRUSKPageItem";

/**
 * ForumInfo - utility class used to extract information from a forum list
 */

export class ForumInfo implements IRUSKPageItem {

    get url(): string {
        return this.baseUrl;
    }

    /**
     * Extracts ForumInfo objects from the passed-in document
     * @param {Document} document - The document (DOM) to query for forum objects, substitutable for testing purposes
     */
    static GetForumsFromDocument(document: Document): Array<ForumInfo> {
        let forums = new Array<ForumInfo>();

        document.querySelectorAll('table.forumline > tbody > tr > td:first-child:nth-last-child(5)').forEach((element) => {
            forums.push(new ForumInfo(element.parentElement as HTMLTableRowElement));
        });
        return forums;
    }

    /** The row element from the DOM */
    readonly rowElement: HTMLTableRowElement;

    private _itemId: number = -1;

    /** Gets the ID of the forum */
    public get itemId(): number {
        if (this._itemId == -1) {
            this._itemId = this.getForumId();
        }
        return this._itemId;
    }

    /** Gets a value that indicates if the item should be hidden or not */
    isHidden: boolean;

    private _title: string;

    /** The title of the forum */
    public get title(): string {
        return this._title || (this._title = this.getTitle());
    }

    private _description: string;

    /* The description of the forum */
    public get description(): string {
        return this._description || (this._description = this.getDescription());
    }

    private _baseUrl: string;

    /** The url of the first page of the forum */
    public get baseUrl(): string {
        return this._baseUrl || (this._baseUrl = this.getBaseUrl());
    }

    private _hasParsedUnread = false;
    private _isUnread: boolean;

    /** Gets a value that indicates if the forum contains unread messages */
    public get isUnread(): boolean {
        if (!this._hasParsedUnread) {
            this._isUnread = this.determineUnreadState();
            this._hasParsedUnread = true;
        }
        return this._isUnread;
    }

    private _latestPoster: string;

    /** Gets the name of the user that posted to the forum most recently */
    public get latestPoster(): string {
        return this._latestPoster || (this._latestPoster = this.getLatestPoster());
    }

    private _topics = -1;

    /** Gets the number of topics in the forum */
    public get topics(): number {
        if (this._topics == -1) {
            this._topics = this.getTopics();
        }
        return this._topics;
    }

    private _posts: number = -1;

    /** Gets the number of posts the forum has */
    public get posts(): number {
        if (this._posts == -1) {
            this._posts = this.getPosts();
        }
        return this._posts;
    }

    private _lastUpdate: Date;

    /** Gets a Date object representing the time when the forum was last updated */
    public get lastUpdate(): Date {
        return this._lastUpdate || (this._lastUpdate = this.getLastUpdate());
    }

    /** Create a new ThreadInfo object based on parsing of a passed HTMLTableRowElement */
    constructor(row: HTMLTableRowElement) {
        this.rowElement = row;
    }

    private getForumId(): number {
        let href = this.rowElement
            .querySelector<HTMLAnchorElement>('a.forumlink')
            .href;
        return +href.substr(href.lastIndexOf('=') + 1);
    }

    private getTitle(): string {
        return this.rowElement
            .querySelector<HTMLAnchorElement>('td.row1 span.forumlink a.forumlink')
            .textContent;
    }

    private getDescription(): string {
        return this.rowElement
            .querySelector<HTMLSpanElement>('td.row1 span.genmed')
            .textContent
            .trim(); // ekstra junk
    }

    private getBaseUrl(): string {
        return this.rowElement
            .querySelector<HTMLAnchorElement>('td.row1 span.forumlink a.forumlink')
            .href;
    }

    private determineUnreadState(): boolean {
        let imgUrl = this.rowElement
            .querySelector<HTMLImageElement>('td:first-of-type.row1 img')
            .src;
        return imgUrl.endsWith('folder_new_big.gif');
    }

    private getLatestPoster(): string {
        return this.rowElement
            .querySelector<HTMLAnchorElement>('td.row2 span.gensmall a:first-of-type')
            .textContent;
    }

    private getTopics(): number {
        return +(this.rowElement.children[2] as HTMLTableCellElement).textContent;
    }

    private getPosts(): number {
        return +(this.rowElement.children[3] as HTMLTableCellElement).textContent;
    }

    private getLastUpdate(): Date {
        var date = (this.rowElement.querySelector<HTMLSpanElement>('td:last-of-type.row2 span.gensmall').childNodes[0]).textContent;
        var match = date.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4}) (\d{1,2}):(\d{1,2})/);
        if (match) {
            return new Date(+match[3], +match[2] - 1, +match[1], +match[4], +match[5]);
        }
        return new Date();
    }
}
