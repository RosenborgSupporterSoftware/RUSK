import { ThreadType } from "../Context/ThreadType";
import { ThreadAttributes } from "../Context/ThreadAttributes";
import { ContextMenu } from "./ContextMenu";
import { IRUSKPageItem } from "../PageHandler/IRUSKPageItem";
import { Log } from "./Log";

/**
 * ThreadInfo - utility class used to extract information from a thread list
 */

export class ThreadInfo implements IRUSKPageItem {

    /**
     * Extracts ThreadInfo objects from the passed-in document
     * @param {Document} document - The document (DOM) to query for thread objects, substitutable for testing purposes
     */
    static GetThreadsFromDocument(document: Document): Array<ThreadInfo> {
        let threads = new Array<ThreadInfo>();

        document.querySelectorAll('table.forumline tbody tr > td.row3Right').forEach((element) => {
            threads.push(new ThreadInfo(element.parentElement as HTMLTableRowElement, false));
        });
        if (!threads.length) {
            document.querySelectorAll('table.forumline tbody tr > td span.topictitle').forEach((element) => {
                threads.push(new ThreadInfo(element.parentElement.parentElement as HTMLTableRowElement, true));
            });
        }
        return threads;
    }

    /**
     * If we're on a "full" thread list, i.e. enter a forum, this is true.
     * If not, we're on the "newposts" view.
     */
    private _isFullThreadList: boolean;

    // IRUSKPageItem start

    get itemId(): number {
        return this.threadid;
    }

    get url(): string {
        return this.latestPageUrl;  // FIXME: Vi burde ha en property som er link til "den fornuftige" siden å gå til når vi tracker uleste
    }

    isHidden: boolean;

    // IRUSKPageItem end

    /** The row element from the DOM */
    readonly rowElement: HTMLTableRowElement;

    /** The id of the thread */
    private _threadId: number;
    public get threadid(): number {
        return this._threadId || (this._threadId = this.getThreadId());
    }

    private _forumId: number = -1;

    /** Gets the forum id that the thread belongs to */
    public get forumId(): number {
        if (this._forumId == -1) {
            this._forumId = this.getForumId();
        }
        return this._forumId;
    }

    private _forumName: string;

    /** Gets the name of the forum that the thread belongs to */
    public get forumName(): string {
        return this._forumName || (this._forumName = this.getForumName());
    }

    private _title: string;
    
    /** The title of the thread */
    public get title(): string {
        return this._title || (this._title = this.getTitle());
    }
    
    private _baseUrl: string;

    /** The url of the first page of the thread */
    public get baseUrl(): string {
        return this._baseUrl || (this._baseUrl = this.getBaseUrl());
    }

    private _latestPageUrl: string;

    /** The url of the last page of the thread */
    public get latestPageUrl(): string {
        return this._latestPageUrl || (this._latestPageUrl = this.getLatestPageUrl());
    }

    private _lastPostUrl: string;

    /** The url of the last post of the thread */
    public get lastPostUrl(): string {
        return this._lastPostUrl || (this._lastPostUrl = this.getLastPostUrl());
    }

    private _hasParsedUnread = false;
    private _isUnread: boolean;

    /** Gets a value that indicates if the thread contains unread messages */
    public get isUnread(): boolean {
        if(!this._hasParsedUnread) {
            this._isUnread = this.determineUnreadState();
            this._hasParsedUnread = true;
        }
        return this._isUnread;
    }

    private _threadType: ThreadType;

    /** Gets the type of thread */
    public get threadType(): ThreadType {
        return this._threadType || (this._threadType = this.determineThreadType());
    }

    private _hasParsedLocked: boolean = false;
    private _isLocked: boolean;

    /** Gets a value that indicates if the thread is locked */
    public get isLocked(): boolean {
        if(!this._hasParsedLocked) {
            this._isLocked = this.determineLockedState();
            this._hasParsedLocked = true;
        }
        return this._isLocked;
    }

    private _threadStarter: string;

    /** Gets the name of the user that started the thread */
    public get threadStarter(): string {
        return this._threadStarter || (this._threadStarter = this.getThreadStarter());
    }

    private _latestPoster: string;

    /** Gets the name of the user that posted to the thread most recently */
    public get latestPoster(): string {
        return this._latestPoster || (this._latestPoster = this.getLatestPoster());
    }

    private _replies: number = -1;

    /** Gets the number of replies to the thread */
    public get replies(): number {
        if (this._replies == -1) {
            this._replies = this.getReplies();
        }
        return this._replies;
    }

    private _views: number;
    /** Gets the number of views the thread has */
    public get views(): number {
        return this._views || (this._views = this.getViews());
    }

    private _numberOfPages: number = -1;
    /** Gets the number of pages the thread has */
    public get numberOfPages(): number {
        if (this._numberOfPages == -1) {
            this._numberOfPages = this.getNumberOfPages();
        }
        return this._numberOfPages;
    }

    private _lastUpdate: Date;

    /** Gets a Date object representing the time when the thread was last updated */
    public get lastUpdate(): Date {
        return this._lastUpdate || (this._lastUpdate = this.getLastUpdate());
    }

    /** Gets a value indicating if the thread contains a poll or not */
    readonly hasPoll: boolean;

    private _threadAttributes: ThreadAttributes;

    private get threadAttributes(): ThreadAttributes {
        if(this._threadAttributes == null) {
            this._threadAttributes = this.getThreadAttributes();
        }
        return this._threadAttributes;
    }

    /** Create a new ThreadInfo object based on parsing of a passed HTMLTableRowElement */
    constructor(row: HTMLTableRowElement, alt: boolean) {
        this.rowElement = row;

        /*
         * The below is used to differentiate between full forum lists
         * and the "new posts" view. Either we're in the full thread list
         * or we're not. 
         * 
         * If we're going to support more page types in the future, this
         * is probably the central mechanism that needs to grow in
         * complexity to support that.
        */
        this._isFullThreadList = (row.querySelectorAll('td').length == 6);

        if (!alt) {
            // FIXME: make these work on the alternative topic list views (some might work already)

            this.hasPoll = this.determinePollState();
        }
    }

    public getContextMenu(): ContextMenu {
        try {
            var menu = new ContextMenu(this.rowElement, "thread");
            return menu;
        } catch (e) {
            console.error("exception: " + e.message);
        }
        return null;
    }

    private getThreadId(): number {
        var link = (this.rowElement.querySelector('a.topictitle') as HTMLAnchorElement).href;
        var id = link.match(/viewtopic\.php\?t=([0-9]*)/);
        if (id) return +(id[1]);
        return -1;
    }

    private getTitle(): string {
        return (this.rowElement.querySelector('span.topictitle a.topictitle') as HTMLAnchorElement).textContent;
    }

    private getBaseUrl(): string {
        let anchor = this.rowElement.querySelector<HTMLAnchorElement>('td span.topictitle a');

        return anchor.href;
    }

    private getLatestPageUrl(): string {
        var subPages = this.rowElement.querySelectorAll<HTMLAnchorElement>('td > span.gensmall > a');
        if (subPages.length > 0) {
            // Vi har undersider
            return subPages[subPages.length - 1].href;
        }
        return this.getBaseUrl();
    }

    private getLastPostUrl(): string {
        var lastanchor = this.rowElement.querySelector<HTMLAnchorElement>('td > span.postdetails > a[href^="viewtopic.php?p="]');
        return lastanchor.href;
    }

    private determineUnreadState(): boolean {
        return (this.threadAttributes & ThreadAttributes.isUnread) == ThreadAttributes.isUnread;
    }

    private determineThreadType(): ThreadType {
        if (this.threadAttributes & ThreadAttributes.isAnnouncementThread)
            return ThreadType.Announcement;
        else if (this.threadAttributes & ThreadAttributes.isStickyThread)
            return ThreadType.Sticky;
        else
            return ThreadType.Normal;
    }

    private determineLockedState(): boolean {
        return (this.threadAttributes & ThreadAttributes.isLocked) > 0;
    }

    private getThreadStarter(): string {
        return (this.rowElement.querySelector('td span.name') as HTMLSpanElement).textContent;
    }

    private getLatestPoster(): string {
        let author = this.rowElement.querySelector('td.row3Right span a') as HTMLAnchorElement;
        if (author == null) {
            author = this.rowElement.querySelector('td.row2 span.postdetails a');
        }
        return author.textContent;
    }

    private getReplies(): number {
        if (this._isFullThreadList) {
            return +(this.rowElement.children[2] as HTMLTableCellElement).textContent;
        } else {
            return +this.rowElement.querySelector<HTMLTableCellElement>('td:nth-child(5)').textContent;
        }
    }

    private getViews(): number {
        if (this._isFullThreadList) {
            return +(this.rowElement.children[4] as HTMLTableCellElement).textContent;
        } else {
            return +this.rowElement.querySelector<HTMLTableCellElement>('td:nth-child(6)').textContent;
        }
    }

    private getForumId(): number {
        let forumlink = this._isFullThreadList ?
            document.querySelector<HTMLAnchorElement>('td.nav span.nav a.nav[href^=viewforum]').href :
            this.rowElement.querySelector<HTMLAnchorElement>('td:nth-child(2) a.forumlink').href;
        return +forumlink.substr(forumlink.lastIndexOf('f=') + 2);
    }

    private getForumName(): string {
        if(this._isFullThreadList) {
            return document.querySelector<HTMLAnchorElement>('td.nav span.nav a.nav[href^=viewforum]').textContent;
        } else {
            return this.rowElement.querySelector<HTMLAnchorElement>('td:nth-child(2) a.forumlink').textContent;
        }
    }

    private getNumberOfPages(): number {
        var subPages = this.rowElement.querySelectorAll('td > span.gensmall > a');
        if (subPages.length > 0) {
            // Vi har undersider
            return +(subPages[subPages.length - 1] as HTMLAnchorElement).textContent;
        }
        return 1;
    }

    private getLastUpdate(): Date {
        let span = this.rowElement.querySelector('td.row3Right span.postdetails') as HTMLSpanElement;
        if (span == null) {
            span = this.rowElement.querySelector('td:nth-child(7) span.postdetails');
        }
        var date = (span.childNodes[0]).textContent;
        var match = date.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4}) (\d{1,2}):(\d{1,2})/);
        if (match) {
            return new Date(+match[3], +match[2] - 1, +match[1], +match[4], +match[5]);
        }
        return new Date();
    }

    private determinePollState(): boolean {
        if (this.rowElement.children[1].children[0].children[0].innerHTML == "[ Poll ]") {
            return true;
        }
        return false;
    }

    private getThreadAttributes(): ThreadAttributes {
        let img = this.rowElement.querySelector('td > img') as HTMLImageElement;
        let imageName = img.src.match(/\/(images|img)\/([\w_]+)\.gif/)[2];
        let fileAttrs = this.getAttributesFromFilename(imageName);
        if (fileAttrs == ThreadAttributes.None) {
            console.error('ThreadInfo.getThreadAttributes håndterer ikke ' + imageName + ' ennå');
        }
        let altAttrs = this.getAttributesFromAltText(img.alt);
        
        return fileAttrs | altAttrs;
    }

    private getAttributesFromAltText(altText: string): ThreadAttributes {
        if (altText.startsWith('Dette emnet er stengt')) {
            return ThreadAttributes.isLocked;
        }
        if (altText.startsWith('This topic is locked')) {
            return ThreadAttributes.isLocked;
        }

        return ThreadAttributes.None;
    }

    private getAttributesFromFilename(filename: string): ThreadAttributes {
        switch (filename) {
            case 'folder':
                return ThreadAttributes.isNormalThread;
            case 'folder_hot':
                return ThreadAttributes.isHot | ThreadAttributes.isNormalThread;
            case 'folder_new':
                return ThreadAttributes.isUnread | ThreadAttributes.isNormalThread;
            case 'folder_new_hot':
                return ThreadAttributes.isUnread | ThreadAttributes.isHot | ThreadAttributes.isNormalThread;
            case 'folder_announce':
                return ThreadAttributes.isAnnouncementThread;
            case 'folder_announce_new':
                return ThreadAttributes.isAnnouncementThread | ThreadAttributes.isUnread;
            case 'folder_sticky':
                return ThreadAttributes.isStickyThread;
            case 'folder_sticky_new':
                return ThreadAttributes.isStickyThread | ThreadAttributes.isUnread;
            case 'folder_lock':
                return ThreadAttributes.isLocked | ThreadAttributes.isNormalThread;
            default:
                return ThreadAttributes.None;
        }
    }

    public markAsRead(): void {
        var url = this.latestPageUrl;
        fetch(url, { mode: 'cors', credentials: 'include' })
            .then(function (response) { return response.text(); }.bind(this))
            .then(function (text) {
                // Log.Debug('marked thread ' + this.threadid + ' as read.');
            }.bind(this))
            .catch(function (err) {
                // Log.Warning('failed on request to mark thread ' + this.threadid + ' as read.');
            }.bind(this));
    }
}
