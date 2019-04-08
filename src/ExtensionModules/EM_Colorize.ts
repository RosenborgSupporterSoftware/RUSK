import { ModuleConfiguration } from "../Configuration/ModuleConfiguration";
import { IRUSKPageItem } from "../PageHandler/IRUSKPageItem";
import { RBKwebPageType } from "../Context/RBKwebPageType";
import { ConfigBuilder } from "../Configuration/ConfigBuilder";
import { PageContext } from "../Context/PageContext";
import { SettingType } from "../Configuration/SettingType";
import { Log } from "../Utility/Log";
import { ModuleBase } from "./ModuleBase";
import { RUSKUI } from "../UI/RUSKUI";

const SCROLLDIRECTION_KEY = "RUSK-ThreadPage-ScrollDirection";

/**
 * EM_Colorize - colorizing forums, threads and posts according to status.
 *
 */
export class Colorize extends ModuleBase {

    readonly name = "Colorize";
    private _currentlySelectedItem: IRUSKPageItem = null;
    private _allItems: Array<IRUSKPageItem> = null;

    pageTypesToRunOn: Array<RBKwebPageType> = [
        RBKwebPageType.RBKweb_FORUM_FORUMLIST,
        RBKwebPageType.RBKweb_FORUM_TOPICLIST,
        RBKwebPageType.RBKweb_FORUM_POSTLIST
    ];

    configSpec = () =>
        ConfigBuilder
            .Define()
            .EnabledByDefault()
            .WithExtensionModuleName(this.name)
            .WithDisplayName("Fargelegging av forumet")
            .WithDescription("Denne modulen fargelegger forum, tråder og innlegg på RBKweb i henhold til status. ")
            .WithConfigOption(opt =>
                opt
                    .WithSettingName("UnreadColorEven")
                    .WithLabel("Farge for uleste (liketallslinjer)")
                    .WithSettingType(SettingType.color)
                    .WithDefaultValue('#90EE90')
                    .AsSharedSetting()
            )
            .WithConfigOption(opt =>
                opt
                    .WithSettingName("UnreadColorOdd")
                    .WithLabel("Farge for uleste (oddetallslinjer)")
                    .WithSettingType(SettingType.color)
                    .WithDefaultValue('#A0FEA0')
                    .AsSharedSetting()
            )
            .WithConfigOption(opt =>
                opt
                    .WithSettingName("ReadColorEven")
                    .WithLabel("Farge for leste (liketallslinjer)")
                    .WithSettingType(SettingType.color)
                    .WithDefaultValue('#FFFFFF')
                    .AsSharedSetting()
            )
            .WithConfigOption(opt =>
                opt
                    .WithSettingName("ReadColorOdd")
                    .WithLabel("Farge for leste (oddetallslinjer)")
                    .WithSettingType(SettingType.color)
                    .WithDefaultValue('#EFEFEF')
                    .AsSharedSetting()
            )
            .WithConfigOption(opt =>
                opt
                    .WithSettingName("SelectedItemColor")
                    .WithLabel("Farge for valgt og lest")
                    .WithSettingType(SettingType.color)
                    .WithDefaultValue('#DDE7C7')
                    .AsSharedSetting()
            )
            .WithConfigOption(opt =>
                opt
                    .WithSettingName("SelectedUnreadItemColor")
                    .WithLabel("Farge for valgt og ulest")
                    .WithSettingType(SettingType.color)
                    .WithDefaultValue('#EDEEC9')
                    .AsSharedSetting()
            )
            .Build();

    init = (cfg: ModuleConfiguration) => {
        super.init(cfg);

        let ui = new RUSKUI();
        ui.FetchCSS('colorize.css', new Map([
            ['--unreadColorEven', this._cfg.GetSetting("UnreadColorEven") as string],
            ['--unreadColorOdd', this._cfg.GetSetting("UnreadColorOdd") as string],
            ['--readColorEven', this._cfg.GetSetting("ReadColorEven") as string],
            ['--readColorOdd', this._cfg.GetSetting("ReadColorOdd") as string],
            ['--selectedRead', this._cfg.GetSetting("SelectedItemColor") as string],
            ['--selectedUnread', this._cfg.GetSetting("SelectedUnreadItemColor") as string]
        ]));
        return ui;
    }

    execute = (ctx: PageContext) => {
        ctx.RUSKPage.items.forEach((item, index) => {
            this.tagItem(item, index);
        });

        ctx.RUSKPage.DetermineInitiallySelectedItem();
    }

    private tagItem(thread: IRUSKPageItem, index: number): void {
        let row = thread.rowElement;

        row.classList.add('RUSKItem');
        if (thread.isUnread) {
            row.classList.add('RUSKUnreadItem');
        } else {
            row.classList.add('RUSKReadItem');
        }
        if (index % 2 == 0) {
            row.classList.add('RUSKEvenRowItem');
        } else {
            row.classList.add('RUSKOddRowItem');
        }
    }
}