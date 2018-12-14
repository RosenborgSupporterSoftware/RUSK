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
        window.location.href = (document
            .querySelector(
                'body > table:nth-child(3) > tbody > tr:nth-child(2) > td:nth-child(4) > table > tbody > tr > td > font > p:nth-child(3) > table:nth-child(3) > tbody > tr > td:nth-child(2) > span > a:nth-child(2)'
            ) as HTMLAnchorElement).href;
    }
}
