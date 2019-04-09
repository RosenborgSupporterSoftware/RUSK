import { PostInfo } from "../Utility/PostInfo";
import { RUSKPage } from "./RUSKPage";

/**
 * IRUSKPage implementation for post lists
 */
export class PostListPage extends RUSKPage {

    constructor() {
        super();
        this.items = PostInfo.GetPostsFromDocument(document);
    }

    EnterSelectedItem(): void {
        // No-op: Å "gå inn i" et innlegg gir ingen mening.
    }

    GoUp(): void {
        window.location.href = document
            .querySelector<HTMLAnchorElement>(
                'a[href^="viewforum"]'
            ).href;
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

    DetermineInitiallySelectedItem(): void {
        if (this.items.length == 0) return;

        let urlMatch = window.location.href.match(/^.*\/forum\/viewtopic\.php\?p=(\d+)(&highlight=)?#\1$/);
        if (urlMatch) {
            let target = +urlMatch[1];
            for (let i = 0; i < this.items.length; i++) {
                if (this.items[i].itemId == target) {
                    this.selectNewItem(this.items[i], true);
                    return;
                }
            }
        }

        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].isUnread) {
                this.selectNewItem(this.items[i]);
                return;
            }
        }

        let scrollDirection = localStorage.getItem(this.SCROLLDIRECTION_KEY);
        if (scrollDirection) {
            if (scrollDirection == "FromOlder") {
                this.selectNewItem(this.items[this.items.length - 1]);
            } else if (scrollDirection == "FromNewer") {
                this.selectNewItem(this.items[0]);
            }
            localStorage.removeItem(this.SCROLLDIRECTION_KEY);
            return;
        }

        this.selectNewItem(this.items[this.items.length - 1]);
    }
}
