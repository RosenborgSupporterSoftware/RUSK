import { ExtensionModule } from "./ExtensionModule";
import { PageContext } from "../Context/PageContext";
import { RBKwebPageType } from "../Context/RBKwebPageType";
import { ConfigBuilder } from "../Configuration/ConfigBuilder";
import { ModuleConfiguration } from "../Configuration/ModuleConfiguration";

/**
 * EM_Brukertips - Extension module for displaying "tooltips" on RBKweb.
 * Actually just a simple first module for testing purposes.
 * Should evolve to an actual tooltips module eventually.
 */

export class Usertips implements ExtensionModule {

    readonly name: string = "Brukertips";
    cfg: ModuleConfiguration;

    pageTypesToRunOn: Array<RBKwebPageType> = [
        RBKwebPageType.RBKweb_FORUM_ALL
    ];

    runBefore: Array<string> = ['late-extmod'];
    runAfter: Array<string> = ['early-extmod'];

    configSpec = () =>
        ConfigBuilder
            .Define()
            .EnabledByDefault()
            .WithExtensionModuleName(this.name)
            .WithDisplayName(this.name)
            .WithDescription("Denne modulen viser enkle brukertips oppe til høyre på RBKweb-siden, rett under sitatene.")
            .Build();

    init = (config: ModuleConfiguration) => {
        this.cfg = config;
    }

    preprocess = () => {
    }

    execute = async (context: PageContext) => {

        let tabell = document.querySelectorAll('body > table:nth-child(3) > tbody > tr:nth-child(2) > td:nth-child(6) > font > table:nth-child(2) > tbody')[0] as HTMLTableElement;
        if (tabell == undefined) {
            return; // Nothing to do here.
        }

        // Spacer
        tabell.appendChild(tabell.firstChild.cloneNode(true));

        // Header
        var headerrow = tabell.insertRow(-1);
        var headercell = headerrow.insertCell(0);
        headercell.setAttribute("bgcolor", "#f1f1f1");
        headercell.innerHTML = "<font face=\"Verdana,Arial,Helvetica\" size=\"1\" color=\"#000000\"><strong>BRUKERTIPS</strong></font>";

        // Spacer
        tabell.appendChild(tabell.firstChild.cloneNode(true));

        // Innhold
        let userTip = await this.getUserTip();
        var contentrow = tabell.insertRow(-1);
        var contentcell = contentrow.insertCell(0);
        contentcell.innerHTML = "<font face=\"Verdana,Arial,Helvetica\" size=\"1\" color=\"#000000\">" + userTip + "</font>";
    }

    private async getUserTip(): Promise<string> {
        let request = await fetch(chrome.runtime.getURL("data/usertips.json"));
        let text = await request.text();
        let data = JSON.parse(text);

        let numberOfTips = data.tips.length;
        let tipNumber = Math.floor(Math.random() * numberOfTips);

        return data.tips[tipNumber];
    }
}
