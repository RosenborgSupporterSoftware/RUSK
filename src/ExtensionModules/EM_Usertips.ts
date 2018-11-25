import { ExtensionModule } from "./ExtensionModule";
import { ConfigOptions } from "../Configuration/ConfigOptions";
import { SettingType } from "../Configuration/SettingType";
import { PageContext } from "../Context/PageContext";

/**
 * EM_Brukertips - Extension module for displaying "tooltips" on RBKweb.
 * Actually just a simple first module for testing purposes.
 * Should evolve to an actual tooltips module eventually.
 */

export class Usertips implements ExtensionModule {

    readonly name : string = "Brukertips";
    urlsToRunOn: Array<RegExp> = [/./];

    runBefore: Array<string> = ['late-extmod'];
    runAfter: Array<string> = ['early-extmod'];

    getConfigOptions = (): ConfigOptions => {
        return {
            displayName: "Vis brukertips",
            options: [
                {
                    setting: "displayTooltips",
                    type: SettingType.bool,
                    label: "Vis brukertips under sitater på RBKweb"
                }
            ]
        }
    };

    execute = (context: PageContext) => {

        let tabell = document.querySelectorAll('body > table:nth-child(3) > tbody > tr:nth-child(2) > td:nth-child(6) > font > table:nth-child(2) > tbody')[0] as HTMLTableElement;

        // Header
        var headerrow = tabell.insertRow(-1);
        var headercell = headerrow.insertCell(0);
        headercell.setAttribute("bgcolor", "#f1f1f1");
        headercell.innerHTML = "<font face=\"Verdana,Arial,Helvetica\" size=\"1\" color=\"#000000\"><strong>BRUKERTIPS</strong></font>";

        // Spacer
        tabell.appendChild(tabell.firstChild.cloneNode(true));

        // Innhold
        var contentrow = tabell.insertRow(-1);
        var contentcell = contentrow.insertCell(0);
        contentcell.innerHTML = "<font face=\"Verdana,Arial,Helvetica\" size=\"1\" color=\"#000000\">Dette er ett tips til hvordan du bruker Chrome ext.</font>";
    }
}
