import { PageContext } from "../Context/PageContext";
import { RBKwebPageType } from "../Context/RBKwebPageType";
import { ConfigBuilder } from "../Configuration/ConfigBuilder";
import { ModuleBase } from "./ModuleBase";

/**
 * EM_Brukertips - Extension module for displaying "tooltips" on RBKweb.
 * Actually just a simple first module for testing purposes.
 * Should evolve to an actual tooltips module eventually.
 */

export class Usertips extends ModuleBase {

  public get name(): string {
    return "Brukertips";
  }

  pageTypesToRunOn: Array<RBKwebPageType> = [
    RBKwebPageType.RBKweb_FORUM_ALL
  ];

  configSpec = () =>
    ConfigBuilder
      .Define()
      .EnabledByDefault()
      .WithExtensionModuleName(this.name)
      .WithDisplayName(this.name)
      .WithDescription("Denne modulen viser enkle brukertips oppe til høyre på RBKweb-siden, rett under sitatene.")
      .Build();

  execute = (context: PageContext) => {

    fetch(chrome.runtime.getURL('data/usertips.json'))
      .then(function(result) {
        return result.json();
      })
      .then(function(json) {
        let numberOfTips = json.tips.length;
        let tipNumber = Math.floor(Math.random() * numberOfTips);

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
        var contentrow = tabell.insertRow(-1);
        var contentcell = contentrow.insertCell(0);
        contentcell.innerHTML = "<font face=\"Verdana,Arial,Helvetica\" size=\"1\" color=\"#000000\">" + json.tips[tipNumber] + "</font>";
      });
  }
}
