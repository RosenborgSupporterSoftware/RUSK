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
        throw new Error("Method not implemented.");
    }

    GoUp(): void {
        window.location.href = (document.querySelector('form > table > tbody > tr:nth-child(2) > td:nth-child(2) > span.nav > a.nav') as HTMLAnchorElement).href;
    }
}
