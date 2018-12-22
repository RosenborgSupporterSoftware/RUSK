

export class MenuItem {
    readonly name: string;
    readonly anchorElement: HTMLAnchorElement;
    visible: boolean;

    constructor(name: string, visible: boolean, element: HTMLAnchorElement) {
        this.name = name;
        this.visible = visible;
        this.anchorElement = element;
    }

    public hide(): void {
        this.visible = false;
        this.anchorElement.style.display = "none";
    }

    public show(): void {
        this.visible = true;
        this.anchorElement.style.display = "";
    }
};