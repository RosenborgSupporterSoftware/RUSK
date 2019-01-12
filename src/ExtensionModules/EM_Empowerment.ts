import { ExtensionModule } from "./ExtensionModule";
import { RBKwebPageType } from "../Context/RBKwebPageType";
import { ConfigBuilder } from "../Configuration/ConfigBuilder";
import { ModuleConfiguration } from "../Configuration/ModuleConfiguration";
import { PageContext } from "../Context/PageContext";

/**
 * EM_Empowerment - Extension module for RBKweb.
 */

export class Empowerment implements ExtensionModule {
    readonly name: string = "Empowerment";
    cfg: ModuleConfiguration;

    pageTypesToRunOn: Array<RBKwebPageType> = [
        RBKwebPageType.RBKweb_ALL
    ];

    runBefore: Array<string> = ['late-extmod'];
    runAfter: Array<string> = ['early-extmod'];

    configSpec = () =>
        ConfigBuilder
            .Define()
            .WithExtensionModuleName(this.name)
            .EnabledByDefault()
            .WithDisplayName(this.name)
            .WithDescription('Denne modulen viser på RBKweb at RUSK er aktiv')
            .InvisibleToConfig()
            .Build();

    init = (config: ModuleConfiguration) => {
        this.cfg = config;

        return null;
    }

    preprocess = (context: PageContext) => {
    }

    execute = (context: PageContext) => {
        if (context.Username) {
            var ital = document.body.querySelector('font p font i') as HTMLElement;
            if (ital.textContent.startsWith('Everyone can read')) {
                var info = ital.closest('p') as HTMLParagraphElement;
                info.classList.add('RUSKHiddenItem');
            }
        }
        var copyright = document.body.querySelector('a[href="http://www.rbkweb.no/copyright.shtml"]') as HTMLAnchorElement;
        if (copyright) {
            function brighten(color, amount) {
                function print2x(num) { return ("0" + num.toString(16)).slice(-2); }
                var r = Math.min(parseInt(color.substring(1,3), 16) + amount, 255);
                var g = Math.min(parseInt(color.substring(3,5), 16) + amount, 255);
                var b = Math.min(parseInt(color.substring(5,7), 16) + amount, 255);
                return "#" + print2x(r) + print2x(g) + print2x(b);
            }
            function darken(color, amount) {
                function print2x(num) { return ("0" + num.toString(16)).slice(-2); }
                var r = Math.max(parseInt(color.substring(1,3), 16) - amount, 0);
                var g = Math.max(parseInt(color.substring(3,5), 16) - amount, 0);
                var b = Math.max(parseInt(color.substring(5,7), 16) - amount, 0);
                return "#" + print2x(r) + print2x(g) + print2x(b);
            }
            var tablecell = copyright.closest("td") as HTMLTableCellElement;
            var span = parseInt(tablecell.getAttribute("colspan") || "1");
            var color = tablecell.getAttribute("bgcolor");
            var diffuse = brighten(color, 14);
            tablecell.setAttribute("width", "");
            if (span > 3) {
                tablecell.setAttribute("colspan", "" + (span - 2));
                var html =
                    '<td colspan="2" align="right" bgcolor="' + color + '">' +
                    '<font face="verdana,arial,helvetica" size="1">' +
                    '<a href="http://www.github.com/RosenborgSupporterSoftware/RUSK" style="text-decoration:none;color:' + diffuse + ';">Empowered by </a>' +
                    '<a href="http://www.github.com/RosenborgSupporterSoftware/RUSK" style="text-decoration:none;color:#000;">RUSK</a> 👊' +
                    '</font></td>';
                tablecell.insertAdjacentHTML("afterend", html);
            }
        }
    }

    invoke = function (cmd: string): boolean {
        return false;
    }

};



