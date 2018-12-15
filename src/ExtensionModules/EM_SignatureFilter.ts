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

 // http://www.rbkweb.no/forum/viewtopic.php?t=5976&postdays=0&postorder=asc&start=8525

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
            .Build();

    //posts: Array<PostInfo>;

    hideSignatures: boolean;

    init = (config: ModuleConfiguration) => {
        this.cfg = config;
        this.hideSignatures = this.getConfigBool("HideSignatures");
    }

    preprocess = () => {
        //this.posts = PostInfo.GetPostsFromDocument(document);
    }

    execute = () => {
        // FIXME: rewrite to use this.posts
        //this.posts.forEach(function(post, idx, posts) {
        //}.bind(this));

        var elts = document.body.querySelectorAll("table.forumline tbody tr td table tbody tr td");
        elts.forEach(function (elt, key, parent) {
            try {
                var sub = elt as HTMLTableCellElement;
                var index = sub.textContent.indexOf("_________________");
                if (index != -1) {
                    var remove = false;
                    sub.childNodes.forEach(function(node, key, parent) {
                        try {
                         var n = node as HTMLElement;
                         var idx = n.outerHTML.indexOf("_________________");
                         if (idx != -1) { // we have a .signature
                             var belement = ((node as Element).closest("table").closest("tr") as HTMLTableRowElement).firstElementChild;
                             var username = belement.querySelector("b").textContent;
                             var postid = belement.querySelector("a").getAttribute("name");
                             var trelement = belement.nextElementSibling as Element;
                             trelement = belement.closest("tr").nextElementSibling as Element;
                             var link = trelement.querySelectorAll('a[href*="profile.php"').item(0) as Element;
                             var userid = parseInt(link.getAttribute("href").match(/u=([0-9]*)/)[1]);
                             remove = this.hideSignatures;
                             var signature = '<span class="RUSKSignatureBegin postbody">' + n.outerHTML.substring(idx + 17);
                             if (remove) {
                                 signature = '<span class="RUSKSignatureBegin RUSKHiddenItem postbody">' + n.outerHTML.substring(idx + 17);
                             }
                             var body = n.outerHTML.substring(0, idx) + '</span>';
                             var delimiter = '<span class="RUSKSignatureDelimiter postbody">' +
                                 '<br>' +
                                 '________________' +
                                 '</span>';
                             n.outerHTML = body + delimiter + signature;
                             var hide = false;
                             n.childNodes.forEach(function(node, idx, children) {
                                 try {
                                     var nod = node as HTMLElement;
                                     if (nod && node.classList && nod.classList.contains("RUSKSignatureDelimiter")) {
                                         hide = true;
                                     }
                                     else if (hide == true) {
                                         nod.classList.add("RUSKHiddenItem");
                                     }
                                 } catch (e) {
                                     console.log("exception: " + e.message);
                                 }
                             }.bind(this));
                         } else if (remove) {
                             n.classList.add("RUSKHiddenItem");
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
    }
};