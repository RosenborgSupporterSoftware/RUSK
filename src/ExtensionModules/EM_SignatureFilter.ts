import { ExtensionModule } from "./ExtensionModule";
import { RBKwebPageType } from "../Context/RBKwebPageType";
import { ConfigBuilder } from "../Configuration/ConfigBuilder";
import { ModuleConfiguration } from "../Configuration/ModuleConfiguration";
import { PostInfo } from "../Utility/PostInfo";
import { SettingType } from "../Configuration/SettingType";
import { ConfigurationOptionVisibility } from "../Configuration/ConfigurationOptionVisibility";

/**
 * EM_SignatureFilter - Extension module for RBKweb.
 */

export class SignatureFilter implements ExtensionModule {
    readonly name: string = "Signaturfilter";
    cfg: ModuleConfiguration;

    pageTypesToRunOn: Array<RBKwebPageType> = [
        RBKwebPageType.RBKweb_FORUM_POSTLIST
    ];

    runBefore: Array<string> = ['late-extmod'];
    runAfter: Array<string> = ['early-extmod'];

    configSpec = () =>
        ConfigBuilder
            .Define()
            .EnabledByDefault()
            .WithExtensionModuleName(this.name)
            .WithDisplayName(this.name)
            .WithDescription("En modul som lar deg fjerne signaturer fra brukerinnlegg.")
            .WithConfigOption(opt =>
                opt
                    .WithSettingName("HideSignatures")
                    .WithSettingType(SettingType.bool)
                    .WithLabel("Skjul signaturene fra poster")
                    .WithVisibility(ConfigurationOptionVisibility.Always)
                    .WithDefaultValue(false)
            )
            .WithConfigOption(opt =>
                opt
                    .WithSettingName("HideSignatureUsers")
                    .WithSettingType(SettingType.text)
                    .WithLabel("Skjul signaturene fra visse postere")
                    .WithVisibility(ConfigurationOptionVisibility.Never)
                    .WithDefaultValue("[]")
            )
            .Build();

    //posts: Array<PostInfo>;

    hideSignatures: boolean;
    hideUserSignatures: Array<number>;

    init = (config: ModuleConfiguration) => {
        this.cfg = config;
        this.hideSignatures = this.getConfigBool("HideSignatures");
        this.hideUserSignatures = JSON.parse(this.getConfigString("HideSignatureUsers"));
    }

    posts: Array<PostInfo>;

    preprocess = () => {
        this.posts = PostInfo.GetPostsFromDocument(document);
    }

    HIDE_SIGNATURE: string = "Hide signature";
    SHOW_SIGNATURE: string = "Show signature";

    execute = () => {
        // restructure post body to manipulate signature easier
        var elts = document.body.querySelectorAll("table.forumline tbody tr td table tbody tr td");
        elts.forEach(function (elt, key, parent) {
            try {
                var sub = elt as HTMLTableCellElement;
                var index = sub.textContent.indexOf("_________________");
                if (index != -1) {
                    sub.childNodes.forEach(function(node, key, parent) {
                        try {
                            var n = node as HTMLElement;
                            var idx = n.outerHTML.indexOf("_________________");
                            if (idx != -1) { // we have a .signature
                                var signature = '<span class="RUSKSignatureBegin postbody">' + n.outerHTML.substring(idx + 17);
                                var body = n.outerHTML.substring(0, idx) + '</span>';
                                var delimiter = '<span class="RUSKSignatureDelimiter postbody">' +
                                    '<br>' +
                                    '________________' +
                                    '</span>';
                                n.outerHTML = body + delimiter + signature;
                            }
                        } catch (e) {
                            console.log("exception: " + e.message);
                        }
                    }.bind(this));
                }
            } catch (e) {
                chrome.runtime.sendMessage({ message: e.message, exception: e });
            }
        }.bind(this));

        // hide all signatures we should hide
        this.posts.forEach(function(post: PostInfo, idx, posts) {
            var posterid = post.posterid;
            var hideSignature = this.hideUserSignatures.indexOf(posterid) != -1 || this.hideSignatures;
            var hasSignature = post.rowElement.querySelector("span.RUSKSignatureDelimiter") as HTMLSpanElement;
            if (!hasSignature || !hideSignature) return;
            var elt = post.rowElement.querySelector('span.RUSKSignatureDelimiter') as HTMLElement;
            while (elt) {
                elt.classList.add('RUSKHiddenItem');
                elt = elt.nextElementSibling as HTMLElement;
            }
        }.bind(this));

        // add context menu actions
        this.posts.forEach(function(post: PostInfo, idx, posts) {
            if (this.hideSignatures) return; // no need for context menu options when hiding all
            var cmenu = post.getContextMenu();
            var posterid = post.posterid;
            var hideSignature = this.hideUserSignatures.indexOf(posterid) != -1;
            var hasSignature = post.rowElement.querySelector("span.RUSKSignatureDelimiter") as HTMLSpanElement;
            if (!hasSignature) return;
            cmenu.addAction(this.HIDE_SIGNATURE, !hideSignature, function() {
                this.posts.forEach(function(thepost: PostInfo, idx, posts) {
                    if (thepost.posterid != posterid) return;
                    cmenu.getAction(this.HIDE_SIGNATURE).hide(); // FIXME: make checkboxed menu option instead
                    cmenu.getAction(this.SHOW_SIGNATURE).show();
                    var elt = thepost.rowElement.querySelector('span.RUSKSignatureDelimiter') as HTMLElement;
                    while (elt) {
                        elt.classList.add('RUSKHiddenItem');
                        elt = elt.nextElementSibling as HTMLElement;
                    }
                    this.hideUserSignatures.push(posterid);
                    this.saveHideUserSignatures();
                }.bind(this));
            }.bind(this));
            cmenu.addAction(this.SHOW_SIGNATURE, hideSignature, function() {
                this.posts.forEach(function(thepost: PostInfo, idx, posts) {
                    if (thepost.posterid != posterid) return;
                    cmenu.getAction(this.HIDE_SIGNATURE).show();
                    cmenu.getAction(this.SHOW_SIGNATURE).hide();
                    var elt = thepost.rowElement.querySelector('span.RUSKSignatureDelimiter') as HTMLElement;
                    while (elt) {
                        elt.classList.remove('RUSKHiddenItem');
                        elt = elt.nextElementSibling as HTMLElement;
                    }
                    var idx = this.hideUserSignatures.indexOf(posterid);
                    this.hideUserSignatures[idx] = this.hideUserSignatures[this.hideUserSignatures.length-1];
                    this.hideUserSignatures.pop();
                    this.saveHideUserSignatures();
                }.bind(this));
            }.bind(this));
        }.bind(this));
    }

    private getConfigBool(setting: string): boolean {
        try {
            for (let i = 0; i < this.cfg.settings.length; i++) {
                if (this.cfg.settings[i].setting == setting) {
                    return this.cfg.settings[i].value as boolean;
                }
            }
            console.log("did not find setting '" + setting);
        } catch (e) {
            console.error("getConfigItem exception: " + e.message);
        }
        return false;
    }

    private getConfigString(setting: string): string {
        try {
            for (let i = 0; i < this.cfg.settings.length; i++) {
                if (this.cfg.settings[i].setting == setting) {
                    return this.cfg.settings[i].value as string;
                }
            }
            console.log("did not find setting '" + setting);
        } catch (e) {
            console.error("getConfigItem exception: " + e.message);
        }
        return null;
    }

    private saveHideUserSignatures(): void {
        var arraystr = JSON.stringify(this.hideUserSignatures);
        //console.log("storing signature-hidden users: '" + arraystr + "'");
        this.cfg.ChangeSetting("HideSignatureUsers", arraystr);
    }
}