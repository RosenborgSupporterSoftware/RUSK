
import { ExtensionModule } from "./ExtensionModule";
import { RBKwebPageType } from "../Context/RBKwebPageType";
import { ConfigBuilder } from "../Configuration/ConfigBuilder";
import { ModuleConfiguration } from "../Configuration/ModuleConfiguration";
import { PageContext } from "../Context/PageContext";
import { PostInfo } from "../Utility/PostInfo";

/**
 * EM_SpawnWindow - Extension module for RBKweb.
 */

export class SpawnWindow implements ExtensionModule {
    readonly name: string = "SpawnWindow";
    cfg: ModuleConfiguration;

    pageTypesToRunOn: Array<RBKwebPageType> = [
        RBKwebPageType.RBKweb_FORUM_POSTLIST,
    ];

    runBefore: Array<string> = ['late-extmod'];
    runAfter: Array<string> = ['early-extmod'];

    configSpec = () =>
        ConfigBuilder
            .Define()
            .WithExtensionModuleName(this.name)
            .EnabledByDefault()
            .WithDisplayName(this.name)
            .WithDescription('Splitte ut post i eget vindu')
            .Build();

    i18n_no = {
        "Open in window": "Åpne i eget vindu",
    }

    i18n = {}

    tr = (text: string): string => {
        return this.i18n[text] || text;
    }

    init = (config: ModuleConfiguration) => {
        this.cfg = config;
    }

    posts: Array<PostInfo>;

    preprocess = (context: PageContext) => {
        this.posts = context.RUSKPage.items as Array<PostInfo>;
        if (context.Language == "norwegian") this.i18n = this.i18n_no;
    }

    execute = (context: PageContext) => {
        this.posts.forEach(function(post: PostInfo, idx, posts) {
            var cmenu = post.getContextMenu();
            cmenu.addAction(this.tr("Open in window"), true, function() {
                var header = document.body.querySelector('table.forumline tbody tr th.thLeft').closest('tr') as HTMLTableRowElement;
                var title = (document.body.querySelector('a.maintitle') as HTMLAnchorElement).textContent;
                var win = window.open("", "", "width=622,height=400,location=no,menubar=no,status=no,toolbar=no");
                win.document.write('<html>' +
                                   '<head>' + document.head.innerHTML + '</head>' +
                                   '<body><table class="forumline" width="100%"><tbody>' +
                                   header.outerHTML +
                                   post.rowElement.outerHTML +
                                   '</tbody></table></body>' +
                                   '</html>');
                // some manual removals
                (win.document.body.querySelector('div.RUSKContextMenu') as HTMLDivElement).remove();
                var quote = win.document.body.querySelector('a[href^="posting.php?mode=quote"]') as HTMLAnchorElement;
                if (quote) quote.remove();
                var edit = win.document.body.querySelector('a[href^="posting.php?mode=editpost"]') as HTMLAnchorElement;
                if (edit) edit.remove();
                var quickr = win.document.body.querySelector('a[name="quickreply"]') as HTMLAnchorElement;
                if (quickr) quickr.remove();
                // some manual adjustments
                (win.document.body.querySelector('td[width="100%"]') as HTMLTableDataCellElement).width = "";
                win.document.body.querySelectorAll('span.postdetails').forEach(function(elt: HTMLSpanElement, idx, parent) {
                    if (elt.textContent.endsWith('Post subject: ') || elt.textContent.endsWith('Tittel: '))
                        elt.insertAdjacentHTML('beforeend', title);
                }.bind(this));
            }.bind(this));
        }.bind(this));
    }
}
