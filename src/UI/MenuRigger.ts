import { MainMenuItem } from "./MainMenuItem";
import { PageContext } from "../Context/PageContext";

/**
 * A class that inserts the RUSK menu structure into RBKweb
 */

export class MenuRigger {

    public RigMenus(menuItems: Array<MainMenuItem>, ctx: PageContext) {
        if (menuItems == null || menuItems.length == 0) return;

        let sorted = menuItems.sort((a, b) => b.SortOrder - a.SortOrder);

        // Sett inn HTML
        let table = document.querySelector<HTMLAnchorElement>('a[href$="om.php"]').closest('table') as HTMLTableElement;
        let allRows = Array.from(table.querySelectorAll('tr'));
        let headerRow = (allRows[0].cloneNode(true)) as HTMLTableRowElement;
        let linkRow = (allRows[1].cloneNode(true)) as HTMLTableRowElement;
        let link = linkRow.querySelector('a') as HTMLAnchorElement;
        let attachRow = table.querySelector<HTMLTableRowElement>('a[href="http://www.rbkweb.no/kontakt.php"]').closest('tr');

        // Sett inn RUSK header
        headerRow.querySelector('strong').textContent = "RUSK";
        attachRow.parentNode.insertBefore(headerRow, attachRow.nextSibling);
        attachRow = headerRow;

        // Sett inn alle items
        sorted.forEach(menuItem => {
            let menuItemRow = (allRows[1].cloneNode(true)) as HTMLTableRowElement;
            let anchor = menuItemRow.querySelector<HTMLAnchorElement>('a');
            anchor.textContent = menuItem.Label;
            anchor.href = "RUSK/" + menuItem.Label;
            anchor.addEventListener('click', function(ev) {
                ev.preventDefault();
                let action = menuItem.Context == null ? menuItem.Action : menuItem.Action.bind(menuItem.Context);
                action(ctx);
            });
            attachRow.parentNode.insertBefore(menuItemRow, attachRow.nextSibling);

            menuItem.SetElements(menuItemRow, anchor);
        });

    }

}