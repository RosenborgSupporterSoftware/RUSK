import { RBKwebPageType } from "../Context/RBKwebPageType";
import { ConfigBuilder } from "../Configuration/ConfigBuilder";
import { PageContext } from "../Context/PageContext";
import { PostInfo } from "../Utility/PostInfo";
import { ModuleBase } from "./ModuleBase";

/**
 * EM_QuickReply - Extension modul for å kunne skrive svarinnlegg rett i tråd-siden på RBKweb.
 */

export class QuickReply extends ModuleBase {
    readonly name: string = "QuickReply";

    pageTypesToRunOn: Array<RBKwebPageType> = [
        RBKwebPageType.RBKweb_FORUM_POSTLIST
    ];

    configSpec = () =>
        ConfigBuilder
            .Define()
            .WithExtensionModuleName(this.name)
            .EnabledByDefault()
            .WithDisplayName(this.name)
            .WithDescription('Gjør det mulig å skrive innlegg direkte på lesesiden i en tråd.')
            .Build();

    i18n_no = {
        'Quick Reply': 'Hurtigsvar',
        'Use HTML': 'Tillat HTML',
        'Use BBcode': 'Bruk BBcode',
        'Use Smileys': 'Bruk smileys',
        'Attach Signature': 'Inkludér signatur',
        'Quote Selection': 'Siter musseleksjon',
        'Abort': 'Avbryt',
        'Full Editor': 'Editor',
        'Post': 'Post'
    }

    i18n = {}

    tr = (text: string): string => {
        return this.i18n[text] || text;
    }

    posts: Array<PostInfo>;

    lastSelectionPost: PostInfo;
    lastSelectionText: string;
    selectionPost: PostInfo;
    selectionText: string;

    quickreplyPNG: string;

    preprocess = (context: PageContext) => {
        this.posts = context.RUSKPage.items as Array<PostInfo>;
        if (context.Language == "norwegian") this.i18n = this.i18n_no;
        this.quickreplyPNG = chrome.runtime.getURL('/img/' + context.Language + '/icon_quickreply.png');
    }

    execute = (context: PageContext) => {
        addEventListener('mouseup', function (ev) {
            this.lastSelectionPost = this.selectionPost;
            this.lastSelectionText = this.selectionText;
            var post = this.getSelPost();
            if (post) {
                var text = this.getSelText();
                this.selectionPost = post;
                this.selectionText = text;
            }
            else {
                this.selectionPost = null;
                this.selectionText = null;
            }
            var enable = (this.selectionText != null && this.selectionText.trim() != "");
            document.body.querySelectorAll('input.RUSKQuoteSelection').forEach(function (elt: HTMLInputElement, idx, parent) {
                elt.disabled = enable ? false : true;
            }.bind(this));
        }.bind(this));

        this.posts.forEach(function (post: PostInfo, idx, posts) {
            var menu = post.getContextMenu();
            if (context.Username && context.Username != "") {
                var quote = post.rowElement.querySelector('a[href^="posting.php?mode=quote"]') as HTMLAnchorElement;
                quote.insertAdjacentHTML('afterend', '&nbsp;' +
                    '<a name="quickreply" title="' + this.tr('Quick Reply') + '"><img src="' + this.quickreplyPNG + '"/></a>');
                var quick = post.rowElement.querySelector('a[name="quickreply"]') as HTMLAnchorElement;
                //menu.addAction(this.tr("Quick reply"), true, function() {
                quick.addEventListener('click', function (ev) {
                    var text = "";
                    if (this.lastSelectionText) {
                        text = '[quote="' + this.lastSelectionPost.posterNickname + '"]' + this.lastSelectionText + '[/quote]\n';
                    }
                    var editor = document.getElementById('RUSKQuickEditor') as HTMLTableRowElement;
                    if (editor) {
                        editor.remove();
                        post.buttonRowElement.insertAdjacentElement('afterend', editor);
                        if (this.selectionPost) {
                            var quickeditor = post.rowElement.nextElementSibling.nextElementSibling as HTMLTableRowElement;
                            var editarea = quickeditor.querySelector('div[name="editor"]') as HTMLDivElement;
                            editarea.insertAdjacentHTML('beforeend',
                                '\n[quote="' + this.selectionPost.posterNickname + '"]' + this.selectionText + '[/quote]\n');
                        }
                    }
                    else {
                        post.rowElement.nextElementSibling.insertAdjacentHTML('afterend',
                            '<tr id="RUSKQuickEditor" class="quickeditor">' +
                            '<td class="row1">' +
                            '<span class="gensmall">' +
                            '<input type="checkbox" name="html_on" checked>' + this.tr('Use HTML') + '</input><br>' +
                            '<input type="checkbox" name="bbcode_on" checked>' + this.tr('Use BBcode') + '</input><br>' +
                            '<input type="checkbox" name="smileys_on" checked>' + this.tr('Use Smileys') + '</input><br>' +
                            '<input type="checkbox" name="signature_on" checked>' + this.tr('Attach Signature') + '</input><br>' +
                            '</span>' +
                            '</td>' +
                            '<td class="row2">' +
                            '<div name="editor" height="60px" border="1" class="gensmall RUSKDivTextArea" contenteditable="true">' + text + '</div>' +
                            '<form style="display:none;" id="RUSKQuickEditor" action="posting.php?mode=quote&p=' + post.postid + '" method="post">' +
                            '<input type="hidden" name="subject" value="">' +
                            '<input type="hidden" name="disable_html" value="on">' +
                            '<input type="hidden" name="disable_smilies" value="on">' +
                            '<input type="hidden" name="disable_bbcode" value="on">' +
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
                            '<input name="quote" disabled="true" type="button" class="RUSKQuoteSelection RUSKQuickReplyButton" value="' + this.tr('Quote Selection') + '"/>&nbsp;' +
                            '</span>' +
                            '<span style="float:right;">' +
                            '<input name="cancel" type="button" class="RUSKQuickReplyButton" value="' + this.tr('Abort') + '"/>&nbsp;' +
                            '<input name="editor" type="button" class="RUSKQuickReplyButton" value="' + this.tr('Full Editor') + '"/>&nbsp;' +
                            '<input name="submit" type="button" class="RUSKQuickReplyButton" value="' + this.tr('Post') + '"/>' +
                            '</span>' +
                            '</div>' +
                            '</td>' +
                            '</tr>');
                        var quickeditor = post.rowElement.nextElementSibling.nextElementSibling as HTMLTableRowElement;
                        var editarea = quickeditor.querySelector('div[name="editor"]') as HTMLDivElement;
                        quickeditor.querySelector('input[name="quote"]').addEventListener('click',
                            function (ev) {
                                if (this.selectionPost) {
                                    editarea.insertAdjacentHTML('beforeend',
                                        '\n[quote="' + this.selectionPost.posterNickname + '"]' + this.selectionText + '[/quote]\n');
                                }
                            }.bind(this));
                        quickeditor.querySelector('input[name="cancel"]').addEventListener('click',
                            function (ev) {
                                quickeditor.remove();
                            }.bind(this));
                        quickeditor.querySelector('input[name="editor"]').addEventListener('click',
                            function (ev) {
                                var form = quickeditor.querySelector('form') as HTMLFormElement;
                                var htmlon = quickeditor.querySelector('input[name="html_on"]') as HTMLInputElement;
                                if (htmlon.checked)
                                    form.querySelector('input[name="disable_html"]').remove();
                                var bbcodeon = quickeditor.querySelector('input[name="bbcode_on"]') as HTMLInputElement;
                                if (bbcodeon.checked)
                                    form.querySelector('input[name="disable_bbcode"]').remove();
                                var smileyson = quickeditor.querySelector('input[name="smileys_on"]') as HTMLInputElement;
                                if (smileyson.checked)
                                    form.querySelector('input[name="disable_smilies"]').remove();
                                var signatureon = quickeditor.querySelector('input[name="signature_on"]') as HTMLInputElement;
                                if (!signatureon.checked)
                                    form.querySelector('input[name="attach_sig"]').remove();
                                var messageelt = quickeditor.querySelector('input[name="message"]') as HTMLInputElement;
                                messageelt.value = editarea.innerText.replace(/\r?\n/g, "\r\n");
                                form.submit();
                            }.bind(this));
                        quickeditor.querySelector('input[name="submit"]').addEventListener('click',
                            function (ev) {
                                var form = quickeditor.querySelector('form') as HTMLFormElement;
                                var htmlon = quickeditor.querySelector('input[name="html_on"]') as HTMLInputElement;
                                if (htmlon.checked)
                                    form.querySelector('input[name="disable_html"]').remove();
                                var bbcodeon = quickeditor.querySelector('input[name="bbcode_on"]') as HTMLInputElement;
                                if (bbcodeon.checked)
                                    form.querySelector('input[name="disable_bbcode"]').remove();
                                var smileyson = quickeditor.querySelector('input[name="smileys_on"]') as HTMLInputElement;
                                if (smileyson.checked)
                                    form.querySelector('input[name="disable_smilies"]').remove();
                                var signatureon = quickeditor.querySelector('input[name="signature_on"]') as HTMLInputElement;
                                if (!signatureon.checked)
                                    form.querySelector('input[name="attach_sig"]').remove();
                                var messageelt = quickeditor.querySelector('input[name="message"]') as HTMLInputElement;
                                messageelt.value = editarea.innerText.replace(/\r?\n/g, "\r\n");
                                var command = form.querySelector('input[name="preview"]') as HTMLInputElement;
                                command.name = "post";
                                command.value = "Submit";
                                form.action = "posting.php";
                                form.submit();
                            }.bind(this));
                        quickeditor.addEventListener('keyup', ev => {
                            if (ev.code == "Enter" && ev.ctrlKey) {
                                (quickeditor.querySelector('input[name="submit"]') as HTMLInputElement).click();
                            }
                        });
                    }
                    // Set fokus!
                    (document.querySelector('div[name=editor]') as HTMLDivElement).focus();
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
                this.posts.forEach(function (post: PostInfo, idx, posts) {
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
