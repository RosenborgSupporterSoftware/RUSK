import { ModuleConfiguration } from "../Configuration/ModuleConfiguration";
import { IRUSKPageItem } from "../PageHandler/IRUSKPageItem";
import { RBKwebPageType } from "../Context/RBKwebPageType";
import { ConfigBuilder } from "../Configuration/ConfigBuilder";
import { PageContext } from "../Context/PageContext";
import { SettingType } from "../Configuration/SettingType";
import { Log } from "../Utility/Log";
import { ModuleBase } from "./ModuleBase";

const SCROLLDIRECTION_KEY = "RUSK-ThreadPage-ScrollDirection";

/**
 * EM_Colorize - colorizing forums, threads and posts according to status.
 *
 */
export class Colorize extends ModuleBase {

    readonly name = "Colorize";
    private _currentlySelectedItem: IRUSKPageItem = null;
    private _allItems: Array<IRUSKPageItem> = null;

    private _unreadColorEven: string;
    private _unreadColorOdd: string;
    private _readColorEven: string;
    private _readColorOdd: string;
    private _selectedUnread: string;
    private _selectedRead: string;

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

        this._unreadColorEven = this._cfg.GetSetting("UnreadColorEven") as string;
        this._unreadColorOdd = this._cfg.GetSetting("UnreadColorOdd") as string;
        this._readColorEven = this._cfg.GetSetting("ReadColorEven") as string;
        this._readColorOdd = this._cfg.GetSetting("ReadColorOdd") as string;
        this._selectedRead = this._cfg.GetSetting("SelectedItemColor") as string;
        this._selectedUnread = this._cfg.GetSetting("SelectedUnreadItemColor") as string;

        return null;
    }

    preprocess = (ctx: PageContext) => {
        fetch(chrome.runtime.getURL("/data/colorize.css"))
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

    private hydrateTemplate(template: string): string {
        let replacements = new Map<string, string>();
        replacements.set('$RUSKUnreadItemEven$', this._unreadColorEven);
        replacements.set('$RUSKUnreadItemOdd$', this._unreadColorOdd);
        replacements.set('$RUSKReadItemEven$', this._readColorEven);
        replacements.set('$RUSKReadItemOdd$', this._readColorOdd);
        replacements.set('$RUSKSelectedUnread$', this._selectedUnread);
        replacements.set('$RUSKSelectedRead$', this._selectedRead);

        replacements.forEach((val, key) => {
            template = template.replace(key, val);
        });

        return template;
    }

}