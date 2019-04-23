import { RUSKPage } from "./RUSKPage";
import { PMInfo } from "../Utility/PMInfo";

export class PMListPage extends RUSKPage {
    constructor() {
        super();

        this.items = PMInfo.GetPMsFromDocument(document);
    }

    EnterSelectedItem(): void {
        if(this.selectedItem == null) return;

        window.location.href = this.selectedItem.url;
    }

    GoUp(): void {
        // Ingen steder å gå?
    }

    GoToNextPage(): void {
        let links = [...document.querySelectorAll<HTMLAnchorElement>('table.forumline + table td:nth-child(3) span.nav a')];
        if(links) {
            let nextLink = links[links.length-1];
            window.location.href = nextLink.href;
        }
    }

    GoToPreviousPage(): void {
        let links = [...document.querySelectorAll<HTMLAnchorElement>('table.forumline + table td:nth-child(3) span.nav a')];
        if(links) {
            let prevLink = links[0];
            window.location.href = prevLink.href;
        }
    }
}