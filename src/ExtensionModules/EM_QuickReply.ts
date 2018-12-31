import { ExtensionModule } from "./ExtensionModule";
import { RBKwebPageType } from "../Context/RBKwebPageType";
import { ConfigBuilder } from "../Configuration/ConfigBuilder";
import { ModuleConfiguration } from "../Configuration/ModuleConfiguration";
import { PageContext } from "../Context/PageContext";
import { PostInfo } from "../Utility/PostInfo";

/**
 * EM_QuickReply - Extension modul for å kunne skrive svarinnlegg rett i tråd-siden på RBKweb.
 */

export class QuickReply implements ExtensionModule {
    readonly name: string = "QuickReply";
    cfg: ModuleConfiguration;

    pageTypesToRunOn: Array<RBKwebPageType> = [
        RBKwebPageType.RBKweb_FORUM_POSTLIST
    ];

    runBefore: Array<string> = ['late-extmod'];
    runAfter: Array<string> = ['early-extmod'];

    configSpec = () =>
        ConfigBuilder
            .Define()
            .WithExtensionModuleName(this.name)
            .EnabledByDefault()
            .WithDisplayName(this.name)
            .WithDescription('Adds the possibility to write posts directly in the thread page.')
            .Build();

    init = (config: ModuleConfiguration) => {
        this.cfg = config;
    }

    i18n_no = {}

    i18n = {}

    tr = (text: string): string => {
        return this.i18n[text] || text;
    }

    posts: Array<PostInfo>;

    preprocess = (context: PageContext) => {
        this.posts = context.RUSKPage.items as Array<PostInfo>;
        if (context.Language == "norwegian") this.i18n = this.i18n_no;
    }

    execute = (context: PageContext) => {
        // console.log('QuickReply.execute');
        this.posts.forEach(function(post: PostInfo, idx, posts) {
            var menu = post.getContextMenu();
            if (context.Username != "") {
                menu.addAction(this.tr("Quick reply"), true, function() {
                    var text = "";
                    var sel = window.getSelection();
                    if (sel && sel.toString() != "") {
                        text = '[quote="' + post.posterNickname + '"]' + sel.toString() + '[/quote]';
                    }
                    post.rowElement.nextElementSibling.insertAdjacentHTML('afterend',
                        '<tr>' +
                        '<td class="row1">controls</td>' + // 
                        '<td class="row2"><textarea name="edit" rows="6" cols="80">' + text + '</textarea><br>' +
                        '<div align="right">' +
                        '<input type="button" value="Abort"/>&nbsp;' +
                        '<input type="button" value="Post"/>' +
                        '</div>' +
                        '</td>' +
                        '</tr>');
                }.bind(this));
            }
        }.bind(this));
    }
}
