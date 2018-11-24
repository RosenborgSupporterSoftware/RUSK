import { ExtensionModule } from "./ExtensionModule";
import { ConfigOptions } from "../Configuration/ConfigOptions";
import { SettingType } from "../Configuration/SettingType";

/**
 * EM_SignatureFilter - Extension module for RBKweb.
 */

export class SignatureFilter implements ExtensionModule {
    readonly name : string = "Signaturfilter";

    urlsToRunOn: Array<RegExp> = [/./];

    runBefore: Array<string> = ['late-extmod'];
    runAfter: Array<string> = ['early-extmod'];

    getConfigOptions = (): ConfigOptions => {
        return {
            displayName: "SignatureFilter",
            options: [
                {
                    setting: "signatureFilterUsers",
                    type: SettingType.text,
                    label: "Fjern signatur for brukere"
                }
            ]
        }
    };

    execute = () => {
        chrome.runtime.sendMessage({logMessage: "SignatureFilter"});
        var elts = document.body.querySelectorAll("table.forumline tbody tr td table tbody tr td");
        elts.forEach(function(elt, key, parent) {
            try {
            var sub = elt as HTMLTableCellElement;
            var index = sub.textContent.indexOf("_________________");
            if (index != -1) {
                var remove = false;
                sub.childNodes.forEach(function(node, key, parent) {
                    var n = node as HTMLElement;
                    var idx = n.innerHTML.indexOf("_________________");
                    if (idx != -1) {
                        // we have a .signature
                        var belement = ((node as Element).closest("table").closest("tr") as HTMLTableRowElement).firstElementChild;
                        var username = belement.querySelector("b").textContent;
                        var postid = belement.querySelector("a").getAttribute("name");
                        var trelement = belement.nextElementSibling as Element;
                        trelement = belement.closest("tr").nextElementSibling as Element;
                        var link = trelement.querySelectorAll('a[href*="profile.php"').item(0) as Element;
                        var userid = parseInt(link.getAttribute("href").match(/u=([0-9]*)/)[1]);
                        //chrome.runtime.sendMessage({logMessage: "removing signature for " + username + " (user " + userid + ")"});
                        if (userid == 6289 /* larsarus - /* userid should be filtered */) {
                            remove = true;
                            n.innerHTML = n.innerHTML.substring(0, idx);
                        }
                    } else if (remove) {
                        n.innerHTML = "";
                    }
                });
            }
        } catch (e) {
            chrome.runtime.sendMessage({message: e.message, exception: e});
        }
        });
    };
};