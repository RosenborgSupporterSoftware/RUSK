import { RBKwebPageType } from "../Context/RBKwebPageType";
import { ConfigBuilder } from "../Configuration/ConfigBuilder";
import { ModuleBase } from "./ModuleBase";

/**
 * EM_TabTitle - Extension module for RBKweb.
 */

export class TabTitles extends ModuleBase {
    readonly name: string = "Fanetittel";

    pageTypesToRunOn: Array<RBKwebPageType> = [
        RBKwebPageType.RBKweb_ALL
    ];

    configSpec = () =>
        ConfigBuilder
            .Define()
            .EnabledByDefault()
            .WithExtensionModuleName(this.name)
            .WithDisplayName(this.name)
            .WithDescription("Denne modulen fjerner fanetittel-prefix fra RBKweb-sider.")
            .Build();

    execute = () => {
        var titleelt = document.querySelector('head title');
        if (titleelt != null) {
            var title = titleelt.textContent;
            if (title.startsWith("RBKweb - View topic - "))
                titleelt.textContent = title.substr(22);
            else if (title.startsWith("RBKweb - View Forum - "))
                titleelt.textContent = title.substr(22);
            else if (title.startsWith("RBKweb - Forum - "))
                titleelt.textContent = title.substr(17);
            else if (title.startsWith("RBKweb - forum - "))
                titleelt.textContent = title.substr(17);
            else if (title.startsWith("RBKweb - Index"))
                titleelt.textContent = "Index";
            else if (title.startsWith("RBKweb - Hovedsiden"))
                titleelt.textContent = "Hovedsiden";
            else if (title.startsWith("RBKweb - Search"))
                titleelt.textContent = "Search";
            else if (title.startsWith("RBKweb - Søk"))
                titleelt.textContent = "Søk";
            else if (title.startsWith("RBKweb - Private Messaging"))
                titleelt.textContent = "Private Messaging";
            else if (title.startsWith("RBKweb - Private meldinger"))
                titleelt.textContent = "Private meldinger";
            else if (title.startsWith("RBKweb - Send private message"))
                titleelt.textContent = "Send private message";
            else if (title.startsWith("RBKweb - Read message"))
                titleelt.textContent = "Read message";
            else if (title.indexOf("RBKweb - Kamper sesongen ") != -1)
                titleelt.textContent = title.substring(title.indexOf(" - ") + 3);
            else if (title.startsWith("RBKweb - Forumstatistikk"))
                titleelt.textContent = "Forumstatistikk";
            else if (title.startsWith("RBKweb - Endre din profil"))
                titleelt.textContent = "Endre din profil";
            else if (title.startsWith("RBKweb - Log in"))
                titleelt.textContent = "Log in";
            else
                console.log("title '" + title + "' did not match any rewrite pattern");
        }
        else {
            console.log("head.title == null");
        }
    }
};