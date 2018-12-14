/**
 * This interface represents a single item (forum, thread, post) on a forum page of items
 */
export interface IRUSKPageItem {
    rowElement: HTMLTableRowElement;
    
    itemId: number;
    isUnread: boolean;
    isHidden: boolean;
    url: string;
}
