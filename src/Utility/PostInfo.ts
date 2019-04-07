import { IRUSKPageItem } from "../PageHandler/IRUSKPageItem";
import { ContextMenu } from "./ContextMenu";
import { Log } from "./Log";

/**
 * PostInfo.ts - utility class used to extract information from individual posts
 */

export class PostInfo implements IRUSKPageItem {
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

    // IRUSKPageItem start

    get itemId(): number {
        return this.postid;
    }

    get url(): string {
        return this.baseUrl;
    }

    isHidden: boolean;

    get lastUpdate(): Date {
        return this.postedDate;
    }

    // IRUSKPageItem end

    /** The row element from the DOM */
    private readonly _rowElement: HTMLTableRowElement;
    public get rowElement(): HTMLTableRowElement {
        return this._rowElement;
    }

    /** The subsequent rown with buttons/actions from the DOM */
    private readonly _buttonRowElement: HTMLTableRowElement;
    public get buttonRowElement(): HTMLTableRowElement {
        return this._buttonRowElement;
    }

    /** The title of the post (if any) */
    private _postTitle: string;
    public get postTitle(): string {
        return this._postTitle || (this._postTitle = this.getTitle());
    }

    /** Whether or not the post is unread */
    private _isUnread: boolean;
    public get isUnread(): boolean {
        return this._isUnread || (this._isUnread = this.getUnreadState());
    }

    /** The url of the post */
    private _baseUrl: string;
    public get baseUrl(): string {
        return this._baseUrl || (this._baseUrl = this.getPostUrl());
    }

    private _quoteUrl: string;
    public get quoteUrl(): string {
        return this._quoteUrl || (this._quoteUrl = this.getQuoteUrl());
    }

    private _editUrl: string;
    public get editUrl(): string {
        return this._editUrl || (this._editUrl = this.getEditUrl());
    }

    private _deleteUrl: string;
    public get deleteUrl(): string {
        return this._deleteUrl || (this._deleteUrl = this.getDeleteUrl());
    }

    private _ipInfoUrl: string;
    public get ipInfoUrl(): string {
        return this._ipInfoUrl || (this._ipInfoUrl = this.getIpInfoUrl());
    }

    private _postid: number;
    public get postid(): number {
        return this._postid || (this._postid = this.getPostId());
    }

    private _postedDate: Date;
    public get postedDate(): Date {
        return this._postedDate || (this._postedDate = this.getPostedDate());
    }

    private _posterNickname: string;
    public get posterNickname(): string {
        return this._posterNickname || (this._posterNickname = this.getPosterNickname());
    }

    private _posterId: number;
    public get posterid(): number {
        return this._posterId || (this._posterId = this.getPosterId());
    }

    private _posterLevel: string;
    public get posterLevel(): string {
        return this._posterLevel || (this._posterLevel = this.getPosterLevel());
    }

    private _postTextBody: string;
    public get postTextBody(): string {
        return this._postTextBody || (this._postTextBody = this.getPostTextBody());
    }

    private _postBodyElement: HTMLTableDataCellElement;
    public get postBodyElement(): HTMLTableDataCellElement {
        return this._postBodyElement || (this._postBodyElement = this.getPostBodyElement());
    }

    private _posterRegistered: Date;
    public get posterRegistered(): Date {
        return this._posterRegistered || (this._posterRegistered = this.getPosterRegistered());
    }

    private _posterPosts: number;
    public get posterPosts(): number {
        return this._posterPosts || (this._posterPosts = this.getPosterPosts());
    }

    private _posterLocation: string;
    public get posterLocation(): string {
        return this._posterLocation || (this._posterLocation = this.getPosterLocation());
    }

    private _threadId: number;
    public get threadId(): number {
        return this._threadId || (this._threadId = this.getThreadId());
    }

    /** Create a new PostInfo object based on parsing of a passed HTMLTableRowElement */
    constructor(row: HTMLTableRowElement) {
        this._rowElement = row;
        this._buttonRowElement = row.nextElementSibling as HTMLTableRowElement;
    }

    public getContextMenu(): ContextMenu {
        try {
            var menu = new ContextMenu(this._rowElement, "post");
            return menu;
        } catch (e) {
            console.error("exception: " + e.message);
        }
        return null;
    }

    private getTitle(): string {
        let textContent = this._rowElement.querySelector('td:nth-child(2) table tbody tr td span.postdetails').textContent;
        if (textContent == null) return "";
        return textContent.match(/^.*(Post subject|Tittel): (.*)$/)[2];
    }

    private getUnreadState(): boolean {
        let image = (this._rowElement.querySelector('td:nth-child(2) > table > tbody > tr:nth-child(1) > td:nth-child(1) > a > img') as HTMLImageElement);
        if (image == null) return false;
        return (image.alt == "Nytt innlegg" || image.alt == "New post");
    }

    private getPostUrl(): string {
        let link = (this._rowElement.querySelector('td:nth-child(2) > table > tbody > tr:nth-child(1) > td:nth-child(1) > a') as HTMLAnchorElement);
        return link == null ? "" : link.href;
    }

    private getQuoteUrl(): string {
        let image = this._rowElement.querySelector('td:nth-child(2) > table > tbody > tr:nth-child(1) > td:nth-child(2) > a > img[src$="icon_quote.gif"]') as HTMLImageElement;
        if (image == null) return "";
        let link = image.parentElement as HTMLAnchorElement;
        if (link == null) return "";
        return link.href;
    }

    private getEditUrl(): string {
        let image = this._rowElement.querySelector('td:nth-child(2) > table > tbody > tr:nth-child(1) > td:nth-child(2) > a > img[src$="icon_edit.gif"]') as HTMLImageElement;
        if (image == null) return "";
        let link = image.parentElement as HTMLAnchorElement;
        if (link == null) return "";
        return link.href;
    }

    private getDeleteUrl(): string {
        let image = this._rowElement.querySelector('td:nth-child(2) > table > tbody > tr:nth-child(1) > td:nth-child(2) > a > img[src$="icon_delete.gif"]') as HTMLImageElement;
        if (image == null) return "";
        let link = image.parentElement as HTMLAnchorElement;
        if (link == null) return "";
        return link.href;
    }

    private getIpInfoUrl(): string {
        let image = this._rowElement.querySelector('td:nth-child(2) > table > tbody > tr:nth-child(1) > td:nth-child(2) > a > img[src$="icon_ip.gif"]') as HTMLImageElement;
        if (image == null) return "";
        let link = image.parentElement as HTMLAnchorElement;
        if (link == null) return "";
        return link.href;
    }

    private getPostId(): number {
        let bnode = this._rowElement.querySelector('td span.name a');
        return +bnode.getAttribute("name");
    }

    private getPostedDate(): Date {
        let text = this._rowElement.querySelector('td > table > tbody > tr > td > span.postdetails').textContent;
        let dateInfo = text.match(/(Posted|Skrevet): (\d{2})\.(\d{2}).(\d{4}) (\d{2}):(\d{2})/);
        return new Date(+dateInfo[4], +dateInfo[3] - 1, +dateInfo[2], +dateInfo[5], +dateInfo[6]);
    }

    private getPosterNickname(): string {
        return this._rowElement.querySelector('td span.name b').textContent;
    }

    private getPosterId(): number {
        let profileAnchor = this.buttonRowElement.querySelector('td > table > tbody > tr > td > a:first-child') as HTMLAnchorElement;
        if (profileAnchor) {
            let match = profileAnchor.href.match(/.*\/profile\.php\?mode=viewprofile&u=(\d+)$/);
            return match ? +match[1] : -1;
        }
        return -1; // "Guest" (deleted account)
    }

    private getPosterLevel(): string {
        return this._rowElement.querySelector('td span.postdetails').childNodes[0].textContent;
    }

    private getPostTextBody(): string {
        return this.getPostBodyElement().textContent;
    }

    private getPostBodyElement(): HTMLTableDataCellElement {
        var ruler = this._rowElement.querySelector('tr td hr').closest('tr');
        return ruler.nextElementSibling.firstElementChild as HTMLTableDataCellElement; // next row, first (only) cell
    }

    private getPosterRegistered(): Date {
        let span = this._rowElement.querySelector('td > span.postdetails') as HTMLSpanElement;
        for (let i = 0; i < span.childNodes.length; i++) {
            let match = span.childNodes[i].textContent.match(/^(Registrert|Registered): (\d{2})\.(\d{2}).(\d{4})$/);
            if (match) {
                return new Date(match[4]+'-'+match[3]+'-'+match[2]);
            }
        }
        return null;
    }

    private getPosterPosts(): number {
        let span = this._rowElement.querySelector('td > span.postdetails') as HTMLSpanElement;
        for (let i = 0; i < span.childNodes.length; i++) {
            let match = span.childNodes[i].textContent.match(/^(Innlegg|Posts): (\d*)$/);
            if (match) {
                return +match[2];
            }
        }
        return 0;
    }

    private getPosterLocation(): string {
        let span = this._rowElement.querySelector('td > span.postdetails') as HTMLSpanElement;
        for (let i = 0; i < span.childNodes.length; i++) {
            let match = span.childNodes[i].textContent.match(/^(Bosted|Location): (.*)$/);
            if (match) {
                return match[2];
            }
        }
        return "";
    }

    private getThreadId(): number {
        var link = this._rowElement.parentElement.parentElement.parentElement.querySelector('a[href*="posting.php?mode=reply"]') as HTMLAnchorElement;
        var topicmatch = link.href.match(/.*&t=([0-9]+)/);
        if (topicmatch) return +topicmatch[1];
        return 0;
    }

    public isFullyInView(): boolean {
        var rect = this.rowElement.getBoundingClientRect();
        var elemTop = rect.top;
        var elemBottom = rect.bottom;
        return (elemTop >= 0) && (elemBottom <= window.innerHeight);
    }

    public isPartiallyInView(): boolean {
        var rect = this.rowElement.getBoundingClientRect();
        var elemTop = rect.top;
        var elemBottom = rect.bottom;
        return elemTop < window.innerHeight && elemBottom >= 0;
    }
}
