import { RBKwebPageType } from "../Context/RBKwebPageType";
import { ConfigBuilder } from "../Configuration/ConfigBuilder";
import { ModuleConfiguration } from "../Configuration/ModuleConfiguration";
import { SettingType } from "../Configuration/SettingType";
import { ConfigurationOptionVisibility } from "../Configuration/ConfigurationOptionVisibility";
import { PageContext } from "../Context/PageContext";
import { ModuleBase } from "./ModuleBase";
import { RUSKUI } from "../UI/RUSKUI";

/**
 * EM_InboxAlert - Extension module for RBKweb.
 */

export class InboxAlert extends ModuleBase {
    readonly name: string = "InboxAlert";

    pageTypesToRunOn: Array<RBKwebPageType> = [
        RBKwebPageType.RBKweb_FORUM_START,
        RBKwebPageType.RBKweb_FORUM_FORUMLIST,
        RBKwebPageType.RBKweb_FORUM_TOPICLIST,
        RBKwebPageType.RBKweb_FORUM_POSTLIST,
        RBKwebPageType.RBKweb_FORUM_POSTNEWTOPIC,
        RBKwebPageType.RBKweb_FORUM_REPLYTOTOPIC,
        RBKwebPageType.RBKweb_FORUM_EDITPOST,
        RBKwebPageType.RBKweb_FORUM_USERPROFILE,
        RBKwebPageType.RBKweb_FORUM_SEARCH_BYAUTHOR,
    ];

    configSpec = () =>
        ConfigBuilder
            .Define()
            .EnabledByDefault()
            .WithExtensionModuleName(this.name)
            .WithDisplayName('Inbox Alert')
            .WithDescription("Denne modulen legger inn et ekstra (mer synlig) varsel dersom du har private meldinger.")
            .WithConfigOption(opt =>
                opt
                    .WithSettingName("PMAlertColor")
                    .WithLabel("Farve for PM alert melding")
                    .WithSettingType(SettingType.color)
                    .WithDefaultValue('#ff6666')
                    .WithVisibility(ConfigurationOptionVisibility.Always)
            )
            .Build();

    init = (cfg: ModuleConfiguration) => {
        super.init(cfg);

        let ui = new RUSKUI();
        ui.FetchCSS('pmAlert.css', new Map<string, string>([
            ['--PMAlertColor', this._cfg.GetSetting('PMAlertColor') as string]
        ]))
        return ui;
    }

    preprocess = (context: PageContext) => {
    }

    execute = (context: PageContext) => {
        var icon = document.body.querySelector('img[src$="icon_mini_message.gif"]') as HTMLImageElement;
        if (icon) {
            var alt = icon.alt;
            if (!(alt == "You have no new messages" ||
                alt == "Du har ingen nye meldinger" ||
                alt == "Du hast keine neuen Nachrichten." ||
                alt == "Log in to check your private messages")) {
                var table = icon.closest("table") as HTMLTableElement;
                var parent = table.parentElement;
                table.insertAdjacentHTML("afterend",
                    '<div class="RUSKPrivateMessageAlert" width="100%" align="center">' +
                    '<br><a href="privmsg.php?folder=inbox">DU HAR ULESTE PRIVATE MELDINGER</a><br><br>' +
                    '</div>');
            }
        }
    }
};
