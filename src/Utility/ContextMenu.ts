import { MenuItem } from "./MenuItem"

export class ContextMenu {
    readonly rowElement: HTMLTableRowElement;

    readonly menuElement: HTMLDivElement;
    readonly contentElement: HTMLDivElement;

    readonly dotdotdotURL: string;

    constructor(postElement: HTMLTableRowElement) {
        this.rowElement = postElement;
        this.dotdotdotURL = chrome.runtime.getURL('/img/dotdotdot.png');
        this.menuElement = this.getMenuElement() || this.createMenuElement();
        this.contentElement = this.menuElement.querySelector('div.dropdown-content') as HTMLDivElement;
    }

    public async injectCSS() {
        try {
            console.log("context menu injecting css");
            let request = await fetch(chrome.runtime.getURL("/data/contextMenu.css"));
            let text = await request.text();
            let css = this.hydrateTemplate(text);
            chrome.runtime.sendMessage({ css: css });
        } catch (e) {
            console.error("error: " + e.message);
        }
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
        try {
            var nameelt = this.rowElement.querySelector('span.name') as HTMLSpanElement;
            var nextSibling = nameelt.nextElementSibling;
            if (nextSibling && nextSibling instanceof HTMLDivElement)
                return nextSibling as HTMLDivElement;
        } catch (e) {
            console.error("exception: " + e.message);
        }
        return null;
    }

    private createMenuElement(): HTMLDivElement {
        try {
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
        } catch (e) {
            console.error("error: " + e.message);
        }
        return null;
    }

    private hydrateTemplate(template: string): string {
        let keys = [], values = [];
        // keys.push("$RUSKMatchWin$");
        // values.push(this.cfg.GetSetting('MatchWinColor'));
        // keys.push("$RUSKMatchDraw$");
        // values.push(this.cfg.GetSetting('MatchDrawColor'));
        // keys.push("$RUSKMatchLoss$");
        // values.push(this.cfg.GetSetting('MatchLossColor'));

        for (let i = 0; i < keys.length; i++) {
            template = template.replace(keys[i], values[i]);
        }
        return template;
    }
 
}