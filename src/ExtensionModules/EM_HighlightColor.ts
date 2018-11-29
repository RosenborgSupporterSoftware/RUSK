import { ExtensionModule } from "./ExtensionModule";
import { SettingType } from "../Configuration/SettingType";
import { RBKwebPageType } from "../Context/RBKwebPageType";
import { ConfigBuilder } from "../Configuration/ConfigBuilder";
import { ConfigurationOptionVisibility } from "../Configuration/ConfigurationOptionVisibility";
import { ModuleConfiguration } from "../Configuration/ModuleConfiguration";

/**
 * EM_HighlightColor - Extension module for RBKweb.
 */

export class HighlightColor implements ExtensionModule {
    readonly name: string = "HighlightColor";
    cfg: ModuleConfiguration;

    pageTypesToRunOn: Array<RBKwebPageType> = [
        RBKwebPageType.RBKweb_ALL
    ];

    runBefore: Array<string> = ['late-extmod'];
    runAfter: Array<string> = ['early-extmod'];

    configSpec = () =>
        ConfigBuilder
            .Define()
            .EnabledByDefault()
            .WithExtensionModuleName(this.name)
            .WithDescription("Denne modulen endrer farge for utheving av f.eks. søkeresultater.")
            .WithConfigOption(opt =>
                opt
                    .WithSettingName("color")
                    .WithSettingType(SettingType.color)
                    .WithLabel("Farge for highlighting")
                    .WithDefaultValue('888888')
                    .WithVisibility(ConfigurationOptionVisibility.Always)
            )
            .Build();

    init = (config: ModuleConfiguration) => {
        this.cfg = config;
    }

    preprocess = () => {
    }

    execute = () => {
        var highlights = document.body.querySelectorAll('b[style="color:#FFFFFF"]');
        if (highlights) {
            for (var c = 0; c < highlights.length; ++c) {
                var highlight = highlights.item(c) as HTMLElement;
                var style = highlight.style;
                style.color = "";
                highlight.setAttribute("class", highlight.getAttribute("class") + " highlighted");
            }
        }
    };
};



