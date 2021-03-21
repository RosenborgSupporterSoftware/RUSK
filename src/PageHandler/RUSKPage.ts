import { IRUSKPage } from "./IRUSKPage";
import { IRUSKPageItem } from "./IRUSKPageItem";

/**
 * Base class for IRUSKPage
 */

export abstract class RUSKPage implements IRUSKPage {

    protected readonly SCROLLDIRECTION_KEY: string = "RUSK-ThreadPage-ScrollDirection";

    public abstract get items(): Array<IRUSKPageItem>;
    public selectedItem: IRUSKPageItem;

    GoToNextItem(): void {
        this.moveSelection(1);
    }

    GoToPreviousItem(): void {
        this.moveSelection(-1);
    }

    abstract GoToNextPage(): void;

    abstract GoToPreviousPage(): void;

    abstract EnterSelectedItem(): void;

    abstract GoUp(): void;

    public DetermineInitiallySelectedItem(): void {
        // Implementation for forum and thread list. Overridden for post list.        
        if (this.items.length == 0) return;

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

        let bestCandidate: IRUSKPageItem = null;

        let getWinner = (first: IRUSKPageItem, second: IRUSKPageItem) => {
            if (first == null) {
                return second;
            } else if (second == null) {
                return first;
            }

            if (first.isUnread != second.isUnread) {
                if (first.isUnread) {
                    return first;
                }
                return second;
            }

            if (first.lastUpdate >= second.lastUpdate) {
                return first;
            }
            return second;
        }

        for (let i = 0; i < this.items.length; i++) {
            bestCandidate = getWinner(bestCandidate, this.items[i]);
        }

        this.selectNewItem(bestCandidate);
    }

    private moveSelection(offset: number): void {
        let curidx = this.items.indexOf(this.selectedItem);
        let originalIndex = curidx;
        let numItems = this.items.length;
        let happy = false;
        while (!happy) {
            curidx += offset;
            if (curidx == originalIndex) {
                // Vi har loopet rundt. Det er ingenting som gjør oss lykkelig. Vi har ikke noe annet valg enn å baile.
                return;
            }
            if (curidx >= numItems) {
                curidx = 0;
            } else if (curidx == -1) {
                curidx = numItems - 1;
            }
            if (!this.items[curidx].isHidden) {
                happy = true;
            }
        }
        this.selectNewItem(this.items[curidx]);
    }

    protected selectNewItem(newItem: IRUSKPageItem, skipScrolling: boolean = false) {
        if (this.selectedItem != null) {
            this.selectedItem.rowElement.classList.remove("RUSKSelectedItem");
        }

        newItem.rowElement.classList.add("RUSKSelectedItem");
        this.selectedItem = newItem;

        if (skipScrolling) return;

        this.scrollToElement(newItem.rowElement);
    }

    protected scrollToElement(element: any): void {
        // FIXME: Dette er langt fra perfekt. 
        // Chrome har en element.scrollIntoViewIfNeeded() - typescript er grinete på den. Må ev. gjøre om til object og kjøre.
        // https://www.npmjs.com/package/scroll-into-view-if-needed burde ikke være nødvendig.        
        //this.selectedItem.rowElement.scrollIntoView({behavior: "instant", block: "nearest", inline: "nearest"});

        if (element == null) return;

        if (element.scrollIntoViewIfNeeded) {
            element.scrollIntoViewIfNeeded();
        } else {
            element.scrollIntoView({
                behavior: "auto",  // Blir dette riktig?
                block: "nearest",
                inline: "nearest"
            });
        }
    }
}
