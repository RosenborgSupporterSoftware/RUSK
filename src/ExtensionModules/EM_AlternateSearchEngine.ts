import { ExtensionModule } from "./ExtensionModule";
import { RBKwebPageType } from "../Context/RBKwebPageType";
import { ConfigBuilder } from "../Configuration/ConfigBuilder";
import { ModuleConfiguration } from "../Configuration/ModuleConfiguration";

/**
 * EM_Empowerment - Extension module for RBKweb.
 */

export class AlternateSearchEngine implements ExtensionModule {
    readonly name: string = "AlternateSearchEngine";
    cfg: ModuleConfiguration;

    pageTypesToRunOn: Array<RBKwebPageType> = [
        RBKwebPageType.RBKweb_FORUM_SEARCH_FORM
    ];

    runBefore: Array<string> = ['late-extmod'];
    runAfter: Array<string> = ['early-extmod'];

    configSpec = () =>
        ConfigBuilder
            .Define()
            .WithExtensionModuleName(this.name)
            .EnabledByDefault()
            .WithDisplayName(this.name)
            .WithDescription('Denne modulen legger til ekstra søkemuligheter på Search-siden')
            .InvisibleToConfig()
            .Build();

    init = (config: ModuleConfiguration) => {
        this.cfg = config;
    }

    preprocess = () => {
    }

    execute = () => {
        var searchbtn = document.body.querySelector('input.liteoption[value="Search"]') as HTMLInputElement;
        searchbtn.insertAdjacentHTML('afterend',
            '&nbsp;' +
            '<input type="button" name="Google" value="Google"/>' +
            '&nbsp;' +
            '<input type="button" name="DuckDuckGo" value="DuckDuckGo"/>' +
            '');
        var google = searchbtn.parentElement.querySelector('input[name="Google"]') as HTMLInputElement;
        var duckduckgo = searchbtn.parentElement.querySelector('input[name="DuckDuckGo"]') as HTMLInputElement;
        google.addEventListener('click', function(ev) {
            var form = searchbtn.closest('form') as HTMLFormElement;
            var keywords = form.querySelector('input[name="search_keywords"]') as HTMLInputElement;
            window.location.href = 'https://www.google.com/search?q='+encodeURIComponent(keywords.value)+'+site:rbkweb.no';
        }.bind(this));
        duckduckgo.addEventListener('click', function(ev) {
            var form = searchbtn.closest('form') as HTMLFormElement;
            var keywords = form.querySelector('input[name="search_keywords"]') as HTMLInputElement;
            window.location.href = 'https://www.duckduckgo.com/?q='+encodeURIComponent(keywords.value)+'+site:rbkweb.no';
        }.bind(this));
    }
};



