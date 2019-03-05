import { ExtensionModule } from "./ExtensionModule";
import { SettingType } from "../Configuration/SettingType";
import { RBKwebPageType } from "../Context/RBKwebPageType";
import { ConfigBuilder } from "../Configuration/ConfigBuilder";
import { ConfigurationOptionVisibility } from "../Configuration/ConfigurationOptionVisibility";
import { ModuleConfiguration } from "../Configuration/ModuleConfiguration";
import { Log } from "../Utility/Log";
import { ModuleBase } from "./ModuleBase";

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

    preprocess = () => {
        fetch(chrome.runtime.getURL("/data/highlightColor.css"))
        .then(function (result) {
            return result.text();
        }.bind(this))
        .then(function (text) {
            let css = this.hydrateTemplate(text);
            chrome.runtime.sendMessage({ css: css, from: this.name });
        }.bind(this))
        .catch(function (err) {
            Log.Error("Colorize css error: " + err.message + " - " + err.stack);
        }.bind(this));
    }

    execute = () => {
        var highlights = document.body.querySelectorAll('b[style="color:#FFFFFF"]');
        highlights.forEach(function(elt: HTMLElement, key, parent) {
            elt.style.color = "";
            elt.classList.add("RUSKHighlightColor");
        }.bind(this));
    };

    private hydrateTemplate(template: string): string {
        let keys = [], values = [];
        keys.push("$RUSKHighlightColor$");
        values.push(this._cfg.GetSetting('HighlightColor'));

        for (let i = 0; i < keys.length; i++) {
            template = template.replace(keys[i], values[i]);
        }

        return template;
    }
};



