import { ExtensionModule } from "./ExtensionModule";
import { ConfigOptions } from "../Configuration/ConfigOptions";
import { SettingType } from "../Configuration/SettingType";
import { RBKwebPageType } from "../Context/RBKwebPageType";

/**
 * EM_Empowerment - Extension module for RBKweb.
 */

export class Empowerment implements ExtensionModule {
    readonly name : string = "Empowerment";

    pageTypesToRunOn: Array<RBKwebPageType> = [
        RBKwebPageType.RBKweb_ALL
    ];

    runBefore: Array<string> = ['late-extmod'];
    runAfter: Array<string> = ['early-extmod'];

    getConfigOptions = (): ConfigOptions => {
        return {
            displayName: "Empowerment",
            options: [
            ]
        };
    };

    execute = () => {
        var copyright = document.body.querySelector('a[href="http://www.rbkweb.no/copyright.shtml"]') as HTMLAnchorElement;
        if (copyright) {
            var tablecell = copyright.closest("td") as HTMLTableCellElement;
            var span = parseInt(tablecell.getAttribute("colspan") || "1");
            var color = tablecell.getAttribute("bgcolor");
            tablecell.setAttribute("width", "");
            if (span > 3) {
                tablecell.setAttribute("colspan", "" + (span-2));
                var html = 
                    '<td colspan="2" align="right" bgcolor="'+color+'">' +
                    '<font face="verdana,arial,helvtica" size="1">' +
                    '<a href="http://www.github.com/RosenborgSupporterSoftware/RUSK" style="text-decoration:none;color:#000;">Empowered by RUSK 👊</a>' +
                    '</font></td>';
                tablecell.insertAdjacentHTML("afterend", html);
            }
        }
    };
};



