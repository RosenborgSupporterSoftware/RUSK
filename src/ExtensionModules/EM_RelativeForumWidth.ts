import { ExtensionModule } from "./ExtensionModule";
import { SettingType } from "../Configuration/SettingType";
import { RBKwebPageType } from "../Context/RBKwebPageType";
import { ConfigBuilder } from "../Configuration/ConfigBuilder";
import { ConfigurationOptionVisibility } from "../Configuration/ConfigurationOptionVisibility";
import { ModuleConfiguration } from "../Configuration/ModuleConfiguration";
import { PageContext } from "../Context/PageContext";

/**
 * EM_RelativeForumWidth - Extension module for RBKweb.
 */

export class RelativeForumWidth implements ExtensionModule {
    readonly name: string = "RelativeForumWidth";
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
            .WithDisplayName("Relativ sidevidde")
            .WithDescription("Denne modulen gjør sidebredden relativ til browservinduet.")
            .WithConfigOption(opt =>
                opt
                    .WithSettingName("RUSKForumWidth")
                    .WithSettingType(SettingType.text)
                    .WithLabel("Sidebredde")
                    .WithDefaultValue("90%")
                    .WithVisibility(ConfigurationOptionVisibility.Always)
            )
            .Build();

    init = (config: ModuleConfiguration) => {
        this.cfg = config;
    }

    preprocess = async (context: PageContext) => {
        let request = await fetch(chrome.runtime.getURL("/data/forumWidth.css"));
        let text = await request.text();
        let css = this.hydrateTemplate(text);
        chrome.runtime.sendMessage({ css: css });
    }

    execute = (context: PageContext) => {
        // Banner and content tables
        document.querySelectorAll('html > body > table').forEach(function(table: HTMLTableElement, ky, parent) {
            table.align = "center";
            table.style.minWidth = table.width;
            table.removeAttribute('width');
            table.classList.add("RUSKForumWidth");
        }.bind(this));

        // Forum table 
        const forumTable = document.querySelectorAll('html > body > table > tbody > tr  > td > table')[1] as HTMLTableElement;
        forumTable.parentElement.removeAttribute('width');
        forumTable.setAttribute('width', '100%');

        // Banner image
        const bannerImg = document.querySelector(' html  > body > table > tbody > tr > td > a > img') as HTMLImageElement;
        bannerImg.setAttribute('width', '100%');

        // Input fields
        const subjectInput = document.getElementsByName('subject')[0] as HTMLInputElement;
        if (subjectInput) subjectInput.style.width = "100%";
        const textareaTable = document.querySelectorAll('tbody > tr > td > font > form > table > tbody > tr > td > span > table')[0] as HTMLTableElement;
        if (textareaTable) textareaTable.style.width = "100%";
        const textArea =  document.getElementsByName('message')[0] as HTMLTextAreaElement;
        if (textArea) textArea.style.width = "100%";
    };

    private hydrateTemplate(template: string): string {
        let keys = [], values = [];
        keys.push("$RUSKForumWidth$");
        values.push(this.cfg.GetSetting('RUSKForumWidth'));

        for (let i = 0; i < keys.length; i++) {
            template = template.replace(keys[i], values[i]);
        }

        return template;
    }

};



