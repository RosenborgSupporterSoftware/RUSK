import { ExtensionModule } from "./ExtensionModule";
import { ConfigOptions } from "../Configuration/ConfigOptions";
import { SettingType } from "../Configuration/SettingType";
import { RBKwebPageType } from "../Context/RBKwebPageType";

/**
 * EM_MatchView - Extension module for RBKweb.
 */

export class SeasonViews implements ExtensionModule {
    readonly name : string = "Kampoversikt";

    pageTypesToRunOn: Array<RBKwebPageType> = [
        RBKwebPageType.RBKweb_MATCH_OVERVIEW
    ];

    runBefore: Array<string> = ['late-extmod'];
    runAfter: Array<string> = ['early-extmod'];

    getConfigOptions = (): ConfigOptions => {
        return {
            displayName: "Kampoversikt",
            options: [
                {
                    setting: "displayWeekday",
                    type: SettingType.bool,
                    label: "Vis ukedag for kampdato"
                },
                {
                    setting: "colorizeResult",
                    type: SettingType.bool,
                    label: "Farvelegg kampresultat"
                }
            ]
        }
    };

    execute = () => {
        var dag = ['Søn', 'Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];
        var maaned = ['jan', 'feb', 'mar', 'apr', 'mai', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des'];
        var urlmatch = document.URL.match(/\/kamper([0-9]{4})(.php|.shtml|\/)$/);
        if (urlmatch) {
            var year = parseInt(urlmatch[1]);
            var tbody = document.body.querySelector("center table tbody");
            if (true /* weekday */) {
                tbody.childNodes.forEach(function(node, idx, parent) {
                    if (node.hasChildNodes && node.firstChild && node.firstChild.textContent) {
                        var matchdate = node.firstChild.textContent.match(/^([0-9]*)\/([0-9]*)$/);
                        if (matchdate) {
                            var day = parseInt(matchdate[1]);
                            var month = parseInt(matchdate[2])-1;
                            var date = new Date(year, month, day);
                            var datestring = dag[date.getDay()] + "&nbsp;" + date.getDate() + ".&nbsp;" + maaned[date.getMonth()];
                            var td = node.firstChild as HTMLTableCellElement
                            td.innerHTML = datestring;
                        }
                    }
                });
            }

            if (true /* colorize */) {
                tbody.childNodes.forEach(function(node, idx, parent) {
                    if (node.hasChildNodes && node.childNodes.length > 3) {
                        var matchnode = node.childNodes.item(1) as HTMLTableCellElement;
                        var resultnode = node.childNodes.item(3) as HTMLTableCellElement;
                        var match = matchnode ? matchnode.textContent : "";
                        var result = resultnode ? resultnode.textContent : "";
                        var homegame = match.startsWith("Rosenborg");
                        var goals = result.match(/^([0-9]*)-([0-9]*)(\*| eeo)?$/);
                        if (goals) {
                            var goaldiff = (homegame ? 1 : -1) * (parseInt(goals[1]) - parseInt(goals[2]));
                            if (goaldiff > 0)
                                resultnode.setAttribute("class", resultnode.getAttribute("class") + " win");
                            else if (goaldiff == 0)
                                resultnode.setAttribute("class", resultnode.getAttribute("class") + " draw");
                            else if (goaldiff < 0)
                                resultnode.setAttribute("class", resultnode.getAttribute("class") + " loss");
                        }
                    }
                });
            }
        }
    }
};