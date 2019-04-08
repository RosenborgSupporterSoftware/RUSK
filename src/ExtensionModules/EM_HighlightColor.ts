import { SettingType } from "../Configuration/SettingType";
import { RBKwebPageType } from "../Context/RBKwebPageType";
import { ConfigBuilder } from "../Configuration/ConfigBuilder";
import { ConfigurationOptionVisibility } from "../Configuration/ConfigurationOptionVisibility";
import { ModuleConfiguration } from "../Configuration/ModuleConfiguration";
import { ModuleBase } from "./ModuleBase";
import { RUSKUI } from "../UI/RUSKUI";

/**
 * EM_HighlightColor - Extension module for RBKweb.
 */

export class HighlightColor extends ModuleBase {
    readonly name: string = "HighlightColor";

    pageTypesToRunOn: Array<RBKwebPageType> = [
        RBKwebPageType.RBKweb_ALL
    ];

    configSpec = () =>
        ConfigBuilder
            .Define()
            .EnabledByDefault()
            .WithExtensionModuleName(this.name)
            .WithDisplayName("Uthevingsfarge")
            .WithDescription("Denne modulen endrer farge for utheving av f.eks. søkeresultater.")
            .WithConfigOption(opt =>
                opt
                    .WithSettingName("HighlightColor")
                    .WithSettingType(SettingType.color)
                    .WithLabel("Farge for highlighting")
                    .WithDefaultValue('#ff6666')
                    .WithVisibility(ConfigurationOptionVisibility.Always)
            )
            .Build();

    init = (cfg:ModuleConfiguration) => {
        super.init(cfg);

        let ui = new RUSKUI();
        ui.FetchCSS('highlightColor.css', new Map<string, string>([
            ['--RUSKHighlightColor', cfg.GetSetting('HighlightColor') as string]
        ]));
        return ui;
    }

    execute = () => {
        var highlights = document.body.querySelectorAll('b[style="color:#FFFFFF"]');
        highlights.forEach(function(elt: HTMLElement) {
            elt.style.color = "";
            elt.classList.add("RUSKHighlightColor");
        }.bind(this));
    };
};
