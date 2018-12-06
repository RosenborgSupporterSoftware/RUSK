import { ThreadType } from "../Context/ThreadType";
import { ThreadAttributes } from "../Context/ThreadAttributes";

/**
 * ThreadInfo - utility class used to extract information from a thread list
 */

export class ThreadInfo {

    /**
     * Extracts ThreadInfo objects from the passed-in document
     * @param {Document} document - The document (DOM) to query for thread objects, substitutable for testing purposes
     */
    static GetThreadsFromDocument(document: Document): Array<ThreadInfo> {
        let threads = new Array<ThreadInfo>();

        document.querySelectorAll('table.forumline tbody tr > td.row3Right').forEach((element) => {
            threads.push(new ThreadInfo(element.parentElement as HTMLTableRowElement));
        });
        return threads;
    }

    /** The row element from the DOM */
    readonly rowElement: HTMLTableRowElement;

    /** The title of the thread */
    readonly title: string;

    /** The url of the first page of the thread */
    readonly baseUrl: string;

    /** The url of the last page of the thread */
    readonly latestUrl: string;

    /** Gets a value that indicates if the thread contains unread messages */
    readonly isUnread: boolean;

    /** Gets the type of thread */
    readonly threadType: ThreadType;

    /** Gets a value that indicates if the thread is locked */
    readonly isLocked: boolean;

    /** Gets the name of the user that started the thread */
    readonly threadStarter: string;

    /** Gets the name of the user that posted to the thread most recently */
    readonly latestPoster: string;

    /** Gets the number of replies to the thread */
    readonly replies: number;

    /** Gets the number of views the thread has */
    readonly views: number;

    /** Gets the number of pages the thread has */
    readonly numberOfPages: number;

    /** Gets a Date object representing the time when the thread was last updated */
    readonly lastUpdate: Date;

    /** Gets a value indicating if the thread contains a poll or not */
    readonly hasPoll: boolean;

    private threadAttributes: ThreadAttributes;

    /** Create a new ThreadInfo object based on parsing of a passed HTMLTableRowElement */
    constructor(row: HTMLTableRowElement) {
        this.rowElement = row;
        this.threadAttributes = this.getThreadAttributes(row);

        this.title = this.getTitle(row);
        this.baseUrl = this.getBaseUrl(row);
        this.latestUrl = this.getLatestUrl(row);
        this.isUnread = this.determineUnreadState(row);
        this.threadType = this.determineThreadType(row);
        this.isLocked = this.determineLockedState(row);
        this.threadStarter = this.getThreadStarter(row);
        this.latestPoster = this.getLatestPoster(row);
        this.replies = this.getReplies(row);
        this.views = this.getViews(row);
        this.numberOfPages = this.getNumberOfPages(row);
        this.lastUpdate = this.getLastUpdate(row);
        this.hasPoll = this.determinePollState(row);
    }

    private getTitle(row: HTMLTableRowElement): string {
        return (row.querySelector('td.row1 span.topictitle a.topictitle') as HTMLAnchorElement).innerText;
    }

    private getBaseUrl(row: HTMLTableRowElement): string {
        let anchor = row.querySelector('td span.topictitle a') as HTMLAnchorElement;

        return anchor.href;
    }

    private getLatestUrl(row: HTMLTableRowElement): string {
        var subPages = row.querySelectorAll('td > span.gensmall > a');
        if (subPages.length > 0) {
            // Vi har undersider
            return (subPages[subPages.length - 1] as HTMLAnchorElement).href;
        }
        return this.getBaseUrl(row);
    }

    private determineUnreadState(row: HTMLTableRowElement): boolean {
        return (this.threadAttributes & ThreadAttributes.isUnread) == ThreadAttributes.isUnread;
    }

    private determineThreadType(row: HTMLTableRowElement): ThreadType {
        if (this.threadAttributes & ThreadAttributes.isAnnouncementThread)
            return ThreadType.Announcement;
        else if (this.threadAttributes & ThreadAttributes.isStickyThread)
            return ThreadType.Sticky;
        else
            return ThreadType.Normal;
    }

    private determineLockedState(row: HTMLTableRowElement): boolean {
        return (this.threadAttributes & ThreadAttributes.isLocked) > 0;
    }

    private getThreadStarter(row: HTMLTableRowElement): string {
        return (row.querySelector('td span.name') as HTMLSpanElement).textContent;
    }

    private getLatestPoster(row: HTMLTableRowElement): string {
        return (row.querySelector('td.row3Right span a') as HTMLAnchorElement).textContent;
    }

    private getReplies(row: HTMLTableRowElement): number {
        return +(row.children[2] as HTMLTableCellElement).innerText;
    }

    private getViews(row: HTMLTableRowElement): number {
        return +(row.children[4] as HTMLTableCellElement).innerText;
    }

    private getNumberOfPages(row: HTMLTableRowElement): number {
        var subPages = row.querySelectorAll('td > span.gensmall > a');
        if (subPages.length > 0) {
            // Vi har undersider
            return +(subPages[subPages.length - 1] as HTMLAnchorElement).innerText;
        }
        return 1;
    }

    private getLastUpdate(row: HTMLTableRowElement): Date {
        var date = ((row.querySelector('td.row3Right span.postdetails') as HTMLSpanElement).childNodes[0]).textContent;
        var match = date.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4}) (\d{1,2}):(\d{1,2})/);
        if (match) {
            return new Date(+match[3], +match[2] - 1, +match[1], +match[4], +match[5]);
        }
        return new Date();
    }

    private determinePollState(row: HTMLTableRowElement): boolean {
        if (row.children[1].children[0].children[0].innerHTML == "[ Poll ]") {
            return true;
        }
        return false;
    }

    private getThreadAttributes(row: HTMLTableRowElement): ThreadAttributes {

        let td = row.children[0] as HTMLTableCellElement;
        let img = td.children[0] as HTMLImageElement;
        let imageName = img.src.match(/templates\/subSilver\/images\/([\w_]+)\.gif/)[1];
        //console.log(imageName + this.getTitle(row));
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
}
