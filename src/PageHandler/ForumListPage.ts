import { ForumInfo } from "../Utility/ForumInfo";
import { RUSKPage } from "./RUSKPage";

/**
 * IRUSKPage implementation for forum lists
 */
export class ForumListPage extends RUSKPage {

    constructor() {
        super();
        this.items = ForumInfo.GetForumsFromDocument(document);
    }

    EnterSelectedItem(): void {
        if (this.selectedItem == null) return;

        window.location.href = this.selectedItem.url;
    }

    GoUp(): void {
        // Gir ingen mening når man står på forumlista
        // FIXME: Kan allikevel gjøre det om man står på de "underlistene" med forumseksjoner.
    }
}
