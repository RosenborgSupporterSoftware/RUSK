import { PageContext } from "../Context/PageContext";

/**
 * A class that represents a menu item in the main menu of RBKweb - on the left
 */

export class MainMenuItem {

    private _label: string;
    private _context: any;
    private _sortOrder: number;
    private _action: (ctx: PageContext) => void;
    private _rowElement: HTMLTableRowElement;
    private _anchorElement: HTMLAnchorElement;

    public get Label(): string {
        return this._label;
    }

    public set Label(newText: string) {
        this._label = newText;
        if (this._anchorElement != null) {
            this._anchorElement.textContent = newText;
        }
    }

    public get RowElement(): HTMLTableRowElement {
        return this._rowElement;
    }

    public get AnchorElement(): HTMLAnchorElement {
        return this._anchorElement;
    }

    public SetElements(rowElement: HTMLTableRowElement, anchorElement: HTMLAnchorElement) {
        this._rowElement = rowElement;
        this._anchorElement = anchorElement;
    }

    public get Context(): any {
        return this._context;
    }

    public get SortOrder(): number {
        return this._sortOrder;
    }

    public get Action(): (ctx: PageContext) => void {
        return this._action;
    }

    /**
     * Create a new instance of the MenuItem class
     * @param label - The label for the MenuItem
     * @param sortOrder - The sort order of the MenuItem
     * @param action - The action to execute when the user clicks the MenuItem
     * @param context - The execution context for the action if it needs to be bound to an object
     */
    constructor(label: string, sortOrder: number, action: (ctx: PageContext) => void, context: any = null) {
        this._label = label;
        this._context = context;
        this._sortOrder = sortOrder;
        this._action = action;
    }
}
