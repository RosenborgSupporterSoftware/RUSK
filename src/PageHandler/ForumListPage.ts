import { ForumInfo } from "../Utility/ForumInfo";
import { RUSKPage } from "./RUSKPage";
import { IRUSKPageItem } from "./IRUSKPageItem";

/**
 * IRUSKPage implementation for forum lists
 */
export class ForumListPage extends RUSKPage {

    private readonly _forums: Array<ForumInfo>;

    public get items(): IRUSKPageItem[] {
        return this._forums;
    }

    constructor() {
        super();

        this._forums = ForumInfo.GetForumsFromDocument(document);
    }

    EnterSelectedItem(): void {
        if (this.selectedItem == null) return;

        window.location.href = this.selectedItem.url;
    }

    GoUp(): void {
        // Gir ingen mening når man står på forumlista
        // FIXME: Kan allikevel gjøre det om man står på de "underlistene" med forumseksjoner.
    }

    GoToNextPage(): void {
        // No-op
    }
    GoToPreviousPage(): void {
        // No-op
    }

}
