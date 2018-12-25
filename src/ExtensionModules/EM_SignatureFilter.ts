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
        var pbutton = document.body.querySelector('span.mainmenu a.mainmenu[href^="profile.php?mode=editprofile"]') as HTMLAnchorElement;
        if (pbutton.textContent == "Profil")
            this.i18n = this.i18n_no;
    }

    i18n_no = {
        "Hide signature": "Skjul signatur",
        "Show signature": "Vis signatur",
    }

    i18n = {}

    tr = (text: string): string => {
        return this.i18n[text] || text;
    }

    HIDE_SIGNATURE: string = "Hide signature";
    SHOW_SIGNATURE: string = "Show signature";

    execute = () => {
        // restructure post body to manipulate signature easier
        this.posts.forEach(function(post: PostInfo, idx, posts) {
            try {
                var body: HTMLTableDataCellElement = post.postBodyElement;
                var elt: HTMLElement = body.firstElementChild as HTMLElement;
                while (elt) {
                    var index = elt.textContent.indexOf("_________________");
                    if (index != -1) {
                        var charidx = elt.outerHTML.indexOf("_________________");
                        var signature = '<span class="postbody">' + elt.outerHTML.substring(charidx + 17);
                        var textbody = elt.outerHTML.substring(0, charidx) + '</span>';
                        var delimiter = '<span class="RUSKSignature postbody">' +
                            '<br>' +
                            '________________' +
                            '</span>';
                        elt.outerHTML = textbody + delimiter + signature;
                        break;
                    }
                    elt = elt.nextElementSibling as HTMLElement;
                }
                var inSignature = false;
                elt = body.firstElementChild as HTMLElement;
                while (elt) {
                    if (inSignature)
                        elt.classList.add('RUSKSignature');
                    else if (elt.classList.contains('RUSKSignature'))
                        inSignature = true;
                    elt = elt.nextElementSibling as HTMLElement;
                }
            } catch (e) {
                console.error("exception " + e.message + " - " + e.stack);
            }
        }.bind(this));

        // hide all signatures we should hide
        this.posts.forEach(function(post: PostInfo, idx, posts) {
            var posterid = post.posterid;
            var hideSignature = this.hideSignatures || (this.hideUserSignatures.indexOf(posterid) != -1);
            if (!hideSignature) return;
            post.postBodyElement.querySelectorAll('.RUSKSignature').forEach(function(elt: HTMLElement, idx, parent) {
                elt.classList.add('RUSKHiddenItem');
            }.bind(this));
        }.bind(this));

        // add context menu actions
        this.posts.forEach(function(post: PostInfo, idx, posts) {
            if (this.hideSignatures) return; // no need for context menu options when hiding all
            var cmenu = post.getContextMenu();
            var posterid = post.posterid;
            var hideSignature = this.hideUserSignatures.indexOf(posterid) != -1;
            var hasSignature = post.rowElement.querySelector(".RUSKSignature") as HTMLSpanElement;
            if (!hasSignature) return;
            cmenu.addAction(this.tr(this.HIDE_SIGNATURE), !hideSignature, function() {
                this.posts.forEach(function(thepost: PostInfo, idx, posts) {
                    if (thepost.posterid != posterid) return;
                    cmenu.getAction(this.tr(this.HIDE_SIGNATURE)).hide(); // FIXME: make checkboxed menu option instead
                    cmenu.getAction(this.tr(this.SHOW_SIGNATURE)).show();
                    thepost.postBodyElement.querySelectorAll('.RUSKSignature').forEach(function(elt: HTMLElement, idx, parent) {
                        elt.classList.add('RUSKHiddenItem');
                    }.bind(this));
                    this.hideUserSignatures.push(posterid);
                    this.saveHideUserSignatures();
                }.bind(this));
            }.bind(this));
            cmenu.addAction(this.tr(this.SHOW_SIGNATURE), hideSignature, function() {
                this.posts.forEach(function(thepost: PostInfo, idx, posts) {
                    if (thepost.posterid != posterid) return;
                    cmenu.getAction(this.tr(this.HIDE_SIGNATURE)).show();
                    cmenu.getAction(this.tr(this.SHOW_SIGNATURE)).hide();
                    thepost.postBodyElement.querySelectorAll('.RUSKSignature').forEach(function(elt: HTMLElement, idx, parent) {
                        elt.classList.remove('RUSKHiddenItem');
                    }.bind(this));
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