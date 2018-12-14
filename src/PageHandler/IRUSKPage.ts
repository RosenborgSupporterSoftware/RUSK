import { IRUSKPageItem } from "./IRUSKPageItem";

/**
 * This interface represents a page of items on RBKweb (forum list, thread list, posts)
 */

export interface IRUSKPage {
    items: Array<IRUSKPageItem>;
    selectedItem: IRUSKPageItem;

    /**
     * GoToNextItem will move the current selection to the next item in the list, going to the first item if we move from the last item.
     */
    GoToNextItem(): void;

    /**
     * GoToPreviousItem will move the current selection to the previous item in the list, going to the last item if we move from the first item.
    */
    GoToPreviousItem(): void;

    /**
     * Enter the selected forum or thread. No-op for posts.
     */
    EnterSelectedItem(): void;

    /**
     * Go up to a higher level in the hierarchy. No-op for forums.
     */
    GoUp(): void;
}
