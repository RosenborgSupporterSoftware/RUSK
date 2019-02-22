import { ExtensionModule } from "./ExtensionModule";
import { RBKwebPageType } from "../Context/RBKwebPageType";
import { ConfigBuilder } from "../Configuration/ConfigBuilder";
import { ModuleConfiguration } from "../Configuration/ModuleConfiguration";
import { PostInfo } from "../Utility/PostInfo";
import { PageContext } from "../Context/PageContext";
import { RUSKUI } from "../UI/RUSKUI";
import { throws } from "assert";

/**
 * EM_ModPostTools - Extension module for RBKweb.
 * Adds moderator functionality to posts if user is a moderator.
 */

export class ModPostTools implements ExtensionModule {
    readonly name: string = "ModPostTools";
    cfg: ModuleConfiguration;

    pageTypesToRunOn: Array<RBKwebPageType> = [
        RBKwebPageType.RBKweb_FORUM_POSTLIST
    ];

    runBefore: Array<string> = [];
    runAfter: Array<string> = [];

    configSpec = () =>
        ConfigBuilder
            .Define()
            .EnabledByDefault()
            .WithExtensionModuleName(this.name)
            .WithDisplayName("Moderatorverktøy")
            .WithDescription("Legger til nyttige verktøy for moderatorer i context-menyen på innlegg.")
            .InvisibleToConfig()
            .WithHotkey(
                hk => 
                    hk
                        .WithHotkeyName('CopyIPInfo')
                        .WithKeyCombos(['C'])
                        .WithPageTypes([RBKwebPageType.RBKweb_FORUM_POSTLIST])
                        .WithLabel('Kopiér IP-info til clipboard')
            )
            .Build();

    userIsModerator: boolean = false;

    init = (config: ModuleConfiguration): RUSKUI => {
        this.cfg = config;

        let ruskUI = new RUSKUI();
        ruskUI.ExtractHotkeys(config);

        return ruskUI;
    }

    posts: Array<PostInfo>;
    _ctx: PageContext;

    preprocess = (ctx: PageContext) => {
        let modOnlyElement = document.querySelector('a img[src$="topic_delete.gif"]');
        this.userIsModerator = modOnlyElement != null;
        this.posts = ctx.RUSKPage.items as Array<PostInfo>;
    }

    execute = (ctx: PageContext) => {
        if (!this.userIsModerator) return;

        this._ctx = ctx;

        let menuLabel = ctx.Language == "norwegian" ? "Flytt innlegg" : "Move post";

        this.posts.forEach(function (post: PostInfo, key, parent) {
            let cmenu = post.getContextMenu();
            cmenu.addAction(menuLabel, true, function () {
                window.location.href = "movet.php?id=" + post.postid;
            });

            post.rowElement
                .querySelector<HTMLAnchorElement>('a[href^=\"modcp\"]')
                .addEventListener('click', ev => {
                    this.toggleIPInfo(post);
                    ev.preventDefault();
                });
        }.bind(this));
    }

    invoke = function (cmd: string): boolean {
        if (!this.userIsModerator) return false;

        if (cmd == 'InlineIPInfo') {

            let post = this._ctx.RUSKPage.selectedItem as PostInfo;
            if (post == null) return false;
            if (!post.ipInfoUrl || post.ipInfoUrl.length == 0) return false;

            this.toggleIPInfo(post);

            return true;
        }

        if(cmd == 'CopyIPInfo') {
            let ypos = document.body.scrollTop;
            let xpos = document.body.scrollLeft;

            let post = this._ctx.RUSKPage.selectedItem as PostInfo;
            if(post==null) return false;
            let divId = "ipinfo-div-" + post.itemId;
            let div = document.getElementById(divId);

            let lines = (this.selectElementContents(div) as string).split('\n');
            let text = "";
            for(let i=1;i<lines.length;i++) {
                let line = lines[i].replace(/\s*\[ (Look up IP address|Søk frem IP) \]\s*$/, '\r\n');
                if(!line.endsWith('\r\n')) line += '\r\n';
                text += line;
            }

            this.copyTextToClipboard(text);
            document.body.scrollTop = ypos;
            document.body.scrollLeft = xpos;

            let sel = window.getSelection();
            sel.removeAllRanges();
        }
        return false;
    }

    toggleIPInfo = function(post: PostInfo) {
        let divId = "ipinfo-div-" + post.itemId;
        let div = document.getElementById(divId);
        if (div == null) {
            // Finnes ikke - opprett!

            let tr = document.createElement('tr');
            tr.innerHTML = "<td colspan=2><div id=\"" + divId + "\" width=\"100%\" height=\"400\"></div></td>"

            fetch(post.ipInfoUrl)
                .then(function (response) {
                    return response.arrayBuffer();
                })
                .then(function (arrayBuffer) {
                    let text = new Buffer(arrayBuffer).toString('binary');
                    let template = document.createElement('template');
                    template.innerHTML = text.trim();

                    let table = template.content.querySelector<HTMLTableElement>('table.forumline');

                    post.rowElement.insertAdjacentElement('afterend', tr);
                    div = document.getElementById(divId);
                    div.innerHTML = table.outerHTML;
                    div.style.maxHeight = "450px";
                    div.style.overflowY = "scroll";

                    div.scrollIntoView({block: "nearest"});
                });

        } else {
            // Finnes - ta bort!
            div.parentElement.parentElement.remove();
        }
    }

    selectElementContents = function(el): string {
        var body = document.body, range, sel;
        range = document.createRange();
        sel = window.getSelection();
        sel.removeAllRanges();
        try {
            range.selectNodeContents(el);
            sel.addRange(range);
        } catch (e) {
            range.selectNode(el);
            sel.addRange(range);
        }
        return sel.toString();
    }

    copyTextToClipboard = function(text: string) {
        var input = document.createElement('textarea');
        document.body.appendChild(input);
        input.value = text;
        input.focus();
        input.select();
        document.execCommand('Copy');
        input.remove();
    }
}