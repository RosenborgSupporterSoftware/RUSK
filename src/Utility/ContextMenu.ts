import { MenuItem } from "./MenuItem"

export class ContextMenu {
    readonly rowElement: HTMLTableRowElement;

    readonly menuElement: HTMLDivElement;
    readonly contentElement: HTMLDivElement;

    readonly dotdotdotURL: string;
    readonly menuType: string;

    constructor(postElement: HTMLElement, menuType: string) {
        this.menuType = menuType;
        this.dotdotdotURL = chrome.runtime.getURL('/img/dotdotdot.png');
        if (postElement instanceof HTMLTableRowElement) {
            this.rowElement = postElement as HTMLTableRowElement;
            this.menuElement = this.getMenuElement() || this.createMenuElement();
        }
        else if (postElement instanceof HTMLDivElement) {
            this.rowElement = null;
            this.menuElement = postElement as HTMLDivElement;
            this.createMenuElement();
        }
        this.contentElement = this.menuElement.querySelector('div.dropdown-content') as HTMLDivElement;
    }

    public async injectCSS() {
        /*
        try {
            let request = await fetch(chrome.runtime.getURL("/data/contextMenu.css"));
            let text = await request.text();
            if (text && text.length > 1) {
                let css = this.hydrateTemplate(text);
                chrome.runtime.sendMessage({ css: css });
            }
        } catch (e) {
            console.error("error: " + e.message);
        }
        */
    }

    public addAction(name: string, visible: boolean, callback): MenuItem {
        this.contentElement.insertAdjacentHTML('beforeend',
           '<a name="' + name + '">' + name + '</a>');
        var anchor = this.contentElement.querySelector('a[name="' + name + '"]') as HTMLAnchorElement;
        if (!visible) {
            anchor.style.display = "none";
        }
        anchor.addEventListener('click', callback);
        this.contentElement.style.display = "";
        return new MenuItem(name, visible, anchor);
    }

    public getAction(name: string): MenuItem {
        var anchor = this.menuElement.querySelector('a[name="'+name+'"]') as HTMLAnchorElement;
        if (anchor) {
            return new MenuItem(name, anchor.style.display != "none", anchor);
        }
        return null;
    }

    private getMenuElement(): HTMLDivElement {
        if (this.menuElement != null)
            return this.menuElement;
        if (this.menuType == "post") {
            var nameelt = this.rowElement.querySelector('span.name') as HTMLSpanElement;
            var nextSibling = nameelt.nextElementSibling;
            if (nextSibling && nextSibling instanceof HTMLDivElement)
                return nextSibling as HTMLDivElement;
        }
        else if (this.menuType == "forumline") {
            if (this.rowElement) {
                var forumtitle = this.rowElement.firstElementChild;
                var siblingCell = forumtitle.nextElementSibling as HTMLTableDataCellElement;
                if (siblingCell && siblingCell.children.length == 1) {
                    return siblingCell.firstElementChild as HTMLDivElement;
                }
            }
        }
        else {
            var titleelt = this.rowElement.querySelector('span.topictitle') as HTMLSpanElement;
            var prevSibling = titleelt.previousElementSibling;
            if (prevSibling && prevSibling instanceof HTMLDivElement)
                return prevSibling as HTMLDivElement;
        }
        return null;
    }

    private createMenuElement(): HTMLDivElement {
        if (this.menuType == "post") {
            var nameelt = this.rowElement.querySelector('span.name') as HTMLSpanElement;
            nameelt.insertAdjacentHTML('afterend',
                '<div class="RUSKContextMenu" style="float:right;" align="right">' +
                '<ul>' +
                '<li class="dropdown">' +
                '<a id="dotdotdot" class="dropbtn"><img src="' + this.dotdotdotURL + '" width="20" height="20"/></a>' +
                '<div class="dropdown-content" style="display:none;">' +
                '</div>' +
                '</li>' +
                '</ul>' +
                '</div>');
            return nameelt.nextElementSibling as HTMLDivElement;
        }
        else if (this.menuType == "forumline") {
            if (this.rowElement) {
                this.rowElement.insertAdjacentHTML('beforeend',
                    '<td align="right" valign="bottom">' +
                    '<div class="RUSKContextMenu" style="float:right;" align="right">' +
                    '<ul>' +
                    '<li class="dropdown">' +
                    '<a id="dotdotdot" class="dropbtn"><img src="' + this.dotdotdotURL + '" width="14" height="14"/></a>' +
                    '<div class="dropdown-content" style="display:none;">' +
                    '</div>' +
                    '</li>' +
                    '</ul>' +
                    '</div>' +
                    '</td>');
                return this.rowElement.lastElementChild.firstElementChild as HTMLDivElement;
            } else if (this.menuElement) {
                this.menuElement.classList.add('RUSKContextMenu');
                this.menuElement.style.alignContent = "right";
                this.menuElement.style.cssFloat = "right";
                this.menuElement.insertAdjacentHTML('afterbegin', 
                    '<ul>' +
                    '<li class="dropdown">' +
                    '<a id="dotdotdot" class="dropbtn"><img src="' + this.dotdotdotURL + '" width="14" height="14"/></a>' +
                    '<div class="dropdown-content" style="display:none;">' +
                    '</div>' +
                    '</li>' +
                    '</ul>');
                return this.menuElement;
            }
        }
        else {
            var topicelt = this.rowElement.querySelector('span.topictitle') as HTMLSpanElement;
            topicelt.insertAdjacentHTML('beforebegin',
                '<div class="RUSKContextMenu" style="float:right;" align="right">' +
                '<ul>' +
                '<li class="dropdown">' +
                '<a id="dotdotdot" class="dropbtn"><img src="' + this.dotdotdotURL + '" width="13" height="13"/></a>' +
                '<div class="dropdown-content" style="display:none;">' +
                '</div>' +
                '</li>' +
                '</ul>' +
                '</div>');
            return topicelt.previousElementSibling as HTMLDivElement;
        }
        return null;
    }

    //private hydrateTemplate(template: string): string {
    //    let keys = [], values = [];
    //    // keys.push("$RUSKMatchLoss$");
    //    // values.push(this.cfg.GetSetting('MatchLossColor'));

    //    for (let i = 0; i < keys.length; i++) {
    //        template = template.replace(keys[i], values[i]);
    //    }
    //    return template;
    //}
}