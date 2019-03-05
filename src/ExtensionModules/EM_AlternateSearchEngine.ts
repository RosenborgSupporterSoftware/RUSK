import { RBKwebPageType } from "../Context/RBKwebPageType";
import { ConfigBuilder } from "../Configuration/ConfigBuilder";
import { ModuleConfiguration } from "../Configuration/ModuleConfiguration";
import { PageContext } from "../Context/PageContext";
import { SettingType } from "../Configuration/SettingType";
import { ConfigurationOptionVisibility } from "../Configuration/ConfigurationOptionVisibility";
import { ModuleBase } from "./ModuleBase";

/**
 * EM_Empowerment - Extension module for RBKweb.
 */

export class AlternateSearchEngine extends ModuleBase {
    readonly name: string = "AlternateSearchEngine";

    pageTypesToRunOn: Array<RBKwebPageType> = [
        RBKwebPageType.RBKweb_FORUM_SEARCH_FORM
    ];

    configSpec = () =>
        ConfigBuilder
            .Define()
            .WithExtensionModuleName(this.name)
            .EnabledByDefault()
            .WithDisplayName(this.name)
            .WithDescription('Denne modulen legger til ekstra søkemuligheter på Search-siden')
            .InvisibleToConfig()
            .WithConfigOption(opt =>
                opt
                    .WithSettingName("UseGoogle")
                    .WithSettingType(SettingType.bool)
                    .WithLabel("Google")
                    .WithVisibility(ConfigurationOptionVisibility.Always)
                    .WithDefaultValue(true)
            )
            .WithConfigOption(opt =>
                opt
                    .WithSettingName("UseDuckDuckGo")
                    .WithSettingType(SettingType.bool)
                    .WithLabel("DuckDuckGo")
                    .WithVisibility(ConfigurationOptionVisibility.Always)
                    .WithDefaultValue(true)
            )
            .Build();

    useGoogle: boolean;
    useDuckDuckGo: boolean;

    init = (config: ModuleConfiguration) => {
        super.init(config);

        this.useGoogle = this._cfg.GetSetting("UseGoogle") as boolean;
        this.useDuckDuckGo = this._cfg.GetSetting("UseDuckDuckGo") as boolean;

        return null;
    }

    execute = (context: PageContext) => {
        var searchbtn = document.body.querySelector('input.liteoption[value="Search"]') as HTMLInputElement;
        if (this.useDuckDuckGo) {
            searchbtn.insertAdjacentHTML('afterend',
                '&nbsp;' +
                '<input type="button" name="DuckDuckGo" value="DuckDuckGo"/>' +
                '');
            var duckduckgo = searchbtn.parentElement.querySelector('input[name="DuckDuckGo"]') as HTMLInputElement;
            duckduckgo.addEventListener('click', function(ev) {
                var form = searchbtn.closest('form') as HTMLFormElement;
                var keywords = form.querySelector('input[name="search_keywords"]') as HTMLInputElement;
                window.location.href = 'https://www.duckduckgo.com/?q='+encodeURIComponent(keywords.value)+'+site:rbkweb.no';
            }.bind(this));
        }
        if (this.useGoogle) {
            searchbtn.insertAdjacentHTML('afterend',
                '&nbsp;' +
                '<input type="button" name="Google" value="Google"/>' +
                '');
            var google = searchbtn.parentElement.querySelector('input[name="Google"]') as HTMLInputElement;
            google.addEventListener('click', function(ev) {
                var form = searchbtn.closest('form') as HTMLFormElement;
                var keywords = form.querySelector('input[name="search_keywords"]') as HTMLInputElement;
                window.location.href = 'https://www.google.com/search?q='+encodeURIComponent(keywords.value)+'+site:rbkweb.no';
            }.bind(this));
        }
    }
}
