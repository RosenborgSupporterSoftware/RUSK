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

    init = (config: ModuleConfiguration) => {
        this.cfg = config;

        return null;
    }

    preprocess = async () => {
        let request = await fetch(chrome.runtime.getURL("/data/highlightColor.css"));
        let text = await request.text();
        let css = this.hydrateTemplate(text);
        chrome.runtime.sendMessage({ css: css, from: this.name });
    }

    execute = () => {
        var highlights = document.body.querySelectorAll('b[style="color:#FFFFFF"]');
        highlights.forEach(function(elt: HTMLElement, key, parent) {
            elt.style.color = "";
            elt.classList.add("RUSKHighlightColor");
        }.bind(this));
    };

    invoke = function (cmd: string): boolean {
        return false;
    }

    private hydrateTemplate(template: string): string {
        let keys = [], values = [];
        keys.push("$RUSKHighlightColor$");
        values.push(this.cfg.GetSetting('HighlightColor'));

        for (let i = 0; i < keys.length; i++) {
            template = template.replace(keys[i], values[i]);
        }

        return template;
    }
};



