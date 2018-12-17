import { ExtensionModule } from "./ExtensionModule";
import { SettingType } from "../Configuration/SettingType";
import { RBKwebPageType } from "../Context/RBKwebPageType";
import { ConfigBuilder } from "../Configuration/ConfigBuilder";
import { ModuleConfiguration } from "../Configuration/ModuleConfiguration";

/**
 * EM_MatchView - Extension module for RBKweb.
 */

export class SeasonViews implements ExtensionModule {
    readonly name: string = "Kampoversikt";
    cfg: ModuleConfiguration;

    pageTypesToRunOn: Array<RBKwebPageType> = [
        RBKwebPageType.RBKweb_MATCH_OVERVIEW
    ];

    runBefore: Array<string> = ['late-extmod'];
    runAfter: Array<string> = ['early-extmod'];

    configSpec = () =>
        ConfigBuilder
            .Define()
            .EnabledByDefault()
            .WithExtensionModuleName(this.name)
            .WithDisplayName(this.name)
            .WithDescription("Denne modulen forbedrer kampoversikten på RBKweb.")
            .WithConfigOption(opt =>
                opt
                    .WithSettingName('displayWeekday')
                    .WithSettingType(SettingType.bool)
                    .WithLabel('Vis ukedag for kampdato')
                    .WithDefaultValue(true)
            )
            .WithConfigOption(opt =>
                opt
                    .WithSettingName('colorizeResult')
                    .WithSettingType(SettingType.bool)
                    .WithLabel('Farvelegg kampresultat')
                    .WithDefaultValue(true)
            )
            .WithConfigOption(opt =>
                opt
                    .WithSettingName('MatchWinColor')
                    .WithSettingType(SettingType.color)
                    .WithLabel('Farve for vunnede kamper')
                    .WithDefaultValue("limegreen")
            )
            .WithConfigOption(opt =>
                opt
                    .WithSettingName('MatchDrawColor')
                    .WithSettingType(SettingType.color)
                    .WithLabel('Farve for uavgjorte kamper')
                    .WithDefaultValue("yellow")
            )
            .WithConfigOption(opt =>
                opt
                    .WithSettingName('MatchLossColor')
                    .WithSettingType(SettingType.color)
                    .WithLabel('Farve for tapte kamper')
                    .WithDefaultValue("tomato")
            )
            .Build();

    colorize: boolean;

    init = (config: ModuleConfiguration) => {
        this.cfg = config;
        this.colorize = this.getConfigBool("colorizeResult")
    }

    preprocess = async () => {
        let request = await fetch(chrome.runtime.getURL("/data/matchView.css"));
        let text = await request.text();
        let css = this.hydrateTemplate(text);
        chrome.runtime.sendMessage({ css: css });
    }

    execute = () => {
        var dag = ['Søn', 'Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];
        var maaned = ['jan', 'feb', 'mar', 'apr', 'mai', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des'];
        var urlmatch = document.URL.match(/\/kamper([0-9]{4})(.php|.shtml|\/)$/);
        if (urlmatch) {
            var year = parseInt(urlmatch[1]);
            var tbody = document.body.querySelector("center table tbody");
            if (true /* weekday */) {
                tbody.childNodes.forEach(function (node, idx, parent) {
                    if (node.hasChildNodes && node.firstChild && node.firstChild.textContent) {
                        var matchdate = node.firstChild.textContent.match(/^([0-9]*)\/([0-9]*)$/);
                        if (matchdate) {
                            var day = parseInt(matchdate[1]);
                            var month = parseInt(matchdate[2]) - 1;
                            var date = new Date(year, month, day);
                            var datestring = dag[date.getDay()] + "&nbsp;" + date.getDate() + ".&nbsp;" + maaned[date.getMonth()];
                            var td = node.firstChild as HTMLTableCellElement
                            td.innerHTML = datestring;
                        }
                    }
                });
            }

            if (this.colorize) {
                tbody.childNodes.forEach(function (node, idx, parent) {
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
                                resultnode.classList.add("RUSKMatchWin");
                            else if (goaldiff == 0)
                                resultnode.classList.add("RUSKMatchDraw");
                            else if (goaldiff < 0)
                                resultnode.classList.add("RUSKMatchLoss");
                        }
                    }
                });
            }
        }
    }

    private hydrateTemplate(template: string): string {
        let keys = [], values = [];
        keys.push("$RUSKMatchWin$");
        values.push(this.cfg.GetSetting('MatchWinColor'));
        keys.push("$RUSKMatchDraw$");
        values.push(this.cfg.GetSetting('MatchDrawColor'));
        keys.push("$RUSKMatchLoss$");
        values.push(this.cfg.GetSetting('MatchLossColor'));

        for (let i = 0; i < keys.length; i++) {
            template = template.replace(keys[i], values[i]);
        }

        return template;
    }
 
    private getConfigBool(setting: string): boolean {
        try {
            for (let i = 0; i < this.cfg.settings.length; i++) {
                if (this.cfg.settings[i].setting == setting) {
                    return this.cfg.settings[i].value as boolean;
                }
            }
            console.log("did not find setting '" + setting + "'");
        } catch (e) {
            console.error("getConfigItem exception: " + e.message);
        }
    }

};