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

    lastSelectionPost: PostInfo;
    lastSelectionText: string;
    selectionPost: PostInfo;
    selectionText: string;

    preprocess = (context: PageContext) => {
        this.posts = context.RUSKPage.items as Array<PostInfo>;
        if (context.Language == "norwegian") this.i18n = this.i18n_no;
    }

    execute = (context: PageContext) => {
        addEventListener('mouseup', function(ev) {
            console.log("mouseup");
            this.lastSelectionPost = this.selectionPost;
            this.lastSelectionText = this.selectionText;
            var post = this.getSelPost();
            if (post) {
                var text = this.getSelText();
                this.selectionPost = post;
                this.selectionText = text;
                console.log("text: " + text);
            }
            else {
                this.selectionPost = null;
                this.selectionText = null;
            }
            var enable = (this.selectionText != null);
            document.body.querySelectorAll('input.RUSKQuoteSelection').forEach(function(elt: HTMLInputElement, idx, parent) {
                elt.disabled = enable ? false : true;
            }.bind(this));
        }.bind(this));

        this.posts.forEach(function(post: PostInfo, idx, posts) {
            var menu = post.getContextMenu();
            console.log("user: " + context.Username);
            if (true || (context.Username && context.Username != "")) {
                menu.addAction(this.tr("Quick reply"), true, function() {
                    var text = "";
                    if (this.lastSelectionText) {
                        text = '[quote="' + this.lastSelectionPost.posterNickname + '"]' + this.lastSelectionText + '[/quote]\n';
                    }
                    var probe = post.rowElement.nextElementSibling.nextElementSibling as HTMLTableRowElement;
                    if (probe && probe.classList.contains('quickeditor')) {
                        // nada
                        console.log('editor already open');
                    }
                    else {
                        post.rowElement.nextElementSibling.insertAdjacentHTML('afterend',
                            '<tr class="quickeditor">' +
                            '<td class="row1">' +
                            '<span class="gensmall">' +
                            '<input type="checkbox" name="html_on" value="true">HTML</input><br>' +
                            '<input type="checkbox" name="bbcode_on" value="on">BBcode</input><br>' +
                            '<input type="checkbox" name="signature_on" value="on">Signature</input><br>' +
                            '<input type="checkbox" name="smileys_on" value="on">Smileys</input><br>' +
                            '</span>' +
                            '</td>' +
                            '<td class="row2">' +
                            '<textarea name="editor" rows="6" cols="80">' + text + '</textarea>' +
                            '<form style="display:none;" id="RUSKQuickEditor" action="posting.php?mode=quote&p=' + post.postid + '" method="post">' +
                            '<input type="hidden" name="subject" value="">' +
                            '<input type="hidden" name="disable_html" value="off">' +
                            '<input type="hidden" name="attach_sig" value="on">' +
                            '<input type="hidden" name="mode" value="reply">' +
                            '<input type="hidden" name="t" value="' + post.threadId + '">' +
                            '<input type="hidden" name="preview" value="Preview">' +
                            '<input type="hidden" name="addbbcode18" value="#000000">' +
                            '<input type="hidden" name="addbbcode20" value="12">' +
                            '<input type="hidden" name="helpbox" value="">' +
                            '<input type="hidden" name="message" value="">' +
                            '</form>' +
                            '<div width="100%">' +
                            '<span>' +
                            '<input name="quote" disabled="true" type="button" class="RUSKQuoteSelection" value="Quote selection"/>&nbsp;' +
                            '</span>' +
                            '<span style="float:right;">' +
                            '<input name="cancel" type="button" value="Abort"/>&nbsp;' +
                            '<input name="editor" type="button" value="Full Editor"/>&nbsp;' +
                            '<input name="submit" type="button" value="Post"/>' +
                            '</span>' +
                            '</div>' +
                            '</td>' +
                            '</tr>');
                        var quickeditor = post.rowElement.nextElementSibling.nextElementSibling as HTMLTableRowElement;
                        var editarea = quickeditor.querySelector('textarea') as HTMLTextAreaElement;
                        quickeditor.querySelector('input[name="quote"]').addEventListener('click',
                            function(ev) {
                                if (this.selectionPost) {
                                    editarea.insertAdjacentHTML('beforeend',
                                         '\n[quote="' + this.selectionPost.posterNickname + '"]' + this.selectionText + '[/quote]\n');
                                }
                            }.bind(this));
                        quickeditor.querySelector('input[name="cancel"]').addEventListener('click',
                            function(ev) {
                                quickeditor.remove();
                            }.bind(this));
                        quickeditor.querySelector('input[name="editor"]').addEventListener('click',
                            function(ev) {
                                var form = quickeditor.querySelector('form') as HTMLFormElement;
                                var textarea = quickeditor.querySelector('textarea') as HTMLTextAreaElement;
                                var messageelt = quickeditor.querySelector('input[name="message"]') as HTMLInputElement;
                                messageelt.value = textarea.textContent;
                                form.submit();
                            }.bind(this));
                        quickeditor.querySelector('input[name="submit"]').addEventListener('click',
                            function(ev) {
                                console.log('not implemented yet, and will not be implemented before all else works 100%');
                            }.bind(this));
                    }
                }.bind(this));
            }
        }.bind(this));
    }

    private getSelPost(): PostInfo {
        var found: PostInfo = null;
        if (window.getSelection) {
            var sel = window.getSelection();
            var node = sel.focusNode;
            if (node) var row = node.parentElement.closest('tr') as HTMLTableRowElement;
            while (row && !found) {
                this.posts.forEach(function(post: PostInfo, idx, posts) {
                    if (post.rowElement.isSameNode(row)) found = post;
                }.bind(this));
                row = row.parentElement.closest('tr') as HTMLTableRowElement;
            }
        }
        return found;
    }

    private getSelText(): string {
        if (window.getSelection) {
            return '' + window.getSelection();
        }
        else if (document.getSelection) {
            return '' + document.getSelection();
        }
        else if ((document as any).selection) {
            return '' + (document as any).selection.createRange().text;
        }
        return '';
    }
}
