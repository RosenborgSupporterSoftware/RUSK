import { RUSKPage } from "./RUSKPage";
import { PMInfo } from "../Utility/PMInfo";
import { IRUSKPageItem } from "./IRUSKPageItem";

export class PMListPage extends RUSKPage {

    public get items(): IRUSKPageItem[] {
        return PMInfo.GetPMsFromDocument(document);
    }
    constructor() {
        super();
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