import { ThreadInfo } from "../Utility/ThreadInfo";
import { IRUSKPageItem } from "./IRUSKPageItem";
import { RUSKPage } from "./RUSKPage";

/**
 * IRUSKPage implementation for thread lists
 */

export class ThreadListPage extends RUSKPage {
    private _threads: Array<ThreadInfo>;

    get items(): Array<IRUSKPageItem> {
        return this._threads;
    }

    constructor() {
        super();

        this._threads = ThreadInfo.GetThreadsFromDocument(document);
    }

    EnterSelectedItem(): void {
        // FIXME: Denne settes kun når man går inn via tastatur, ikke via musklikk. Kan vi fikse det?
        localStorage.setItem('ruskLastEnterThreadSource', window.location.href);
        if (this.selectedItem == null) return;

        window.location.href = this.selectedItem.url; // Må endres ved egen tracking av uleste.
    }

    GoUp(): void {
        window.location.href = (document.querySelector('form > table > tbody > tr:nth-child(2) > td:nth-child(2) > span.nav > a.nav') as HTMLAnchorElement).href;
    }

    GoToNextPage(): void {
        let links = (document.querySelectorAll('span.gensmall b a') as NodeListOf<HTMLAnchorElement>);
        links.forEach(el => {
            if (el.textContent == 'Next' || el.textContent == 'Neste') {
                localStorage.setItem(this.SCROLLDIRECTION_KEY, "FromNewer");
                window.location.href = el.href;
            }
        });
    }

    GoToPreviousPage(): void {
        let links = (document.querySelectorAll('span.gensmall b a') as NodeListOf<HTMLAnchorElement>);
        links.forEach(el => {
            if (el.textContent == 'Previous' || el.textContent == 'Forrige') {
                localStorage.setItem(this.SCROLLDIRECTION_KEY, "FromOlder");
                window.location.href = el.href;
            }
        });
    }
}
