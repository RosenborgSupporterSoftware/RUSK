/**
 * ForumInfo - utility class used to extract information from a forum list
 */

export class ForumInfo {

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

    /** The title of the forum */
    readonly title: string;

    /* The description of the forum */
    readonly description: string;

    /** The url of the first page of the forum */
    readonly baseUrl: string;

    /** Gets a value that indicates if the forum contains unread messages */
    readonly isUnread: boolean;

    /** Gets the name of the user that posted to the forum most recently */
    readonly latestPoster: string;

    /** Gets the number of topics in the forum */
    readonly topics: number;

    /** Gets the number of posts the forum has */
    readonly posts: number;

    /** Gets a Date object representing the time when the forum was last updated */
    readonly lastUpdate: Date;

    /** Create a new ThreadInfo object based on parsing of a passed HTMLTableRowElement */
    constructor(row: HTMLTableRowElement) {
        this.rowElement = row;

        this.title = this.getTitle(row);
        this.description = this.getDescription(row);
        this.baseUrl = this.getBaseUrl(row);
        this.isUnread = this.determineUnreadState(row);
        this.latestPoster = this.getLatestPoster(row);
        this.topics = this.getTopics(row);
        this.posts = this.getPosts(row);
        this.lastUpdate = this.getLastUpdate(row);
    }

    private getTitle(row: HTMLTableRowElement): string {
        return (row.querySelector('td.row1 span.forumlink a.forumlink') as HTMLAnchorElement).textContent;
    }

    private getDescription(row: HTMLTableRowElement): string {
        return (row.querySelector('td.row1 span.genmed') as HTMLSpanElement).textContent.trim(); // ekstra junk
    }

    private getBaseUrl(row: HTMLTableRowElement): string {
        return (row.querySelector('td.row1 span.forumlink a.forumlink') as HTMLAnchorElement).href;
    }

    private determineUnreadState(row: HTMLTableRowElement): boolean {
        let imgUrl = (row.querySelector('td:first-of-type.row1 img') as HTMLImageElement).src;
        return imgUrl.endsWith('folder_new_big.gif');
    }

    private getLatestPoster(row: HTMLTableRowElement): string {
        return (row.querySelector('td.row2 span.gensmall a:first-of-type') as HTMLAnchorElement).textContent;
    }

    private getTopics(row: HTMLTableRowElement): number {
        return +(row.children[2] as HTMLTableCellElement).textContent;
    }

    private getPosts(row: HTMLTableRowElement): number {
        return +(row.children[3] as HTMLTableCellElement).textContent;
    }

    private getLastUpdate(row: HTMLTableRowElement): Date {
        var date = ((row.querySelector('td:last-of-type.row2 span.gensmall') as HTMLSpanElement).childNodes[0]).textContent;
        var match = date.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4}) (\d{1,2}):(\d{1,2})/);
        if (match) {
            return new Date(+match[3], +match[2] - 1, +match[1], +match[4], +match[5]);
        }
        return new Date();
    }
}
