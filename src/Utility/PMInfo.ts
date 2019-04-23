import { IRUSKPageItem } from "../PageHandler/IRUSKPageItem";

export class PMInfo implements IRUSKPageItem {

    /**
     * Parses PMs from a message list into PMInfo objects
     * @param document - The Document instance to parse for PMs
     * @returns An array of parsed PMInfo elements
     */
    public static GetPMsFromDocument(document: Document): Array<PMInfo> {
        let pms = new Array<PMInfo>();

        document.querySelectorAll('table.forumline > tbody > tr:not(:first-child):not(:last-child)')
            .forEach((rowElement: HTMLTableRowElement) => {
                pms.push(new PMInfo(rowElement));
            });
        
        return pms;
    }

    private readonly _rowElement: HTMLTableRowElement;

    /** Gets the row element representing the PM in the DOM */
    public get rowElement(): HTMLTableRowElement {
        return this._rowElement;
    }

    private _postedDate: Date;

    private getPostedDate(): Date {
        let text = this._rowElement.querySelector('td:nth-child(4)').textContent;
        let dateInfo = text.match(/(\d{2})\.(\d{2}).(\d{4}) (\d{2}):(\d{2})/);
        return new Date(+dateInfo[3], +dateInfo[2], +dateInfo[1], +dateInfo[4], +dateInfo[5]);
    }

    public get lastUpdate(): Date {
        return this._postedDate || (this._postedDate = this.getPostedDate());
    }

    private _subject: string;

    private getSubject(): string {
        return this._rowElement.querySelector('td:nth-child(2)').textContent.trim();
    }

    public get subject(): string {
        return this._subject || (this._subject = this.getSubject());
    }

    private getItemId(): number {
        return +this._rowElement
            .querySelector<HTMLInputElement>('td:last-child input')
            .value;
    }

    private _pmId: number;

    public get itemId(): number {
        return this._pmId;
    }

    public get isMarked(): boolean {
        return this._rowElement
            .querySelector<HTMLInputElement>('td:last-child input')
            .checked;
    }

    private _isUnread: boolean;

    public get isUnread(): boolean {
        return this._isUnread;
    }

    private getUnreadState(): boolean {
        return this._rowElement
            .querySelector<HTMLImageElement>('td:first-child img')
            .src
            .endsWith('folder_new.gif');
    }

    public get isHidden(): boolean {
        return false; 
        // No concept of hidden PMs at the moment. Should it even be a thing?
    }

    private _url: string;

    public get url(): string {
        return this._url || (this._url = this.getUrl());
    }

    private getUrl(): string {
        return this._rowElement
            .querySelector<HTMLAnchorElement>('td:nth-child(2) a.topictitle')
            .href;
    }

    constructor(rowElement: HTMLTableRowElement) {
        this._rowElement = rowElement;
        this._pmId = this.getItemId();
        this._isUnread = this.getUnreadState();
    }
}
