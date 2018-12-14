import { IRUSKPage } from "./IRUSKPage";
import { IRUSKPageItem } from "./IRUSKPageItem";

/**
 * Base class for IRUSKPage
 */

 export abstract class RUSKPage implements IRUSKPage {
     
    public items: Array<IRUSKPageItem>;
    public selectedItem: IRUSKPageItem;
    
    GoToNextItem(): void {
        this.moveSelection(1);
    }

    GoToPreviousItem(): void {
        this.moveSelection(-1);
    }

    abstract EnterSelectedItem(): void;

    abstract GoUp(): void;

    private moveSelection(offset: number): void {
        let curidx = this.items.indexOf(this.selectedItem);
        let originalIndex = curidx;
        let numItems = this.items.length;
        let happy = false;
        while(!happy) {
            curidx += offset;
            if(curidx == originalIndex) {
                // Vi har loopet rundt. Det er ingenting som gjør oss lykkelig. Vi har ikke noe annet valg enn å baile.
                return;
            }
            if(curidx >= numItems) {
                curidx = 0;
            } else if(curidx == -1) {
                curidx = numItems-1;
            }
            if(!this.items[curidx].isHidden) {
                happy = true;
            }
        }
        this.selectNewItem(this.items[curidx]);
    }

    private selectNewItem(newSelectedItem: IRUSKPageItem): void {
        if(this.selectedItem != null) {
            this.selectedItem.rowElement.classList.remove("RUSKSelectedItem");
        }
        newSelectedItem.rowElement.classList.add("RUSKSelectedItem");
        this.selectedItem = newSelectedItem;
        this.scrollToElement(this.selectedItem.rowElement);
    }
    
    scrollToElement(element: HTMLElement): void {
        // FIXME: Dette er langt fra perfekt. 
        // Chrome har en element.scrollIntoViewIfNeeded() - typescript er grinete på den. Må ev. gjøre om til object og kjøre.
        // https://www.npmjs.com/package/scroll-into-view-if-needed burde ikke være nødvendig.        
        //this.selectedItem.rowElement.scrollIntoView({behavior: "instant", block: "nearest", inline: "nearest"});

        let obj = element as any;
        obj.scrollIntoViewIfNeeded();
    }
 }
