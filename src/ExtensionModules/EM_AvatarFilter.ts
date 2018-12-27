import { ExtensionModule } from "./ExtensionModule";
import { RBKwebPageType } from "../Context/RBKwebPageType";
import { ConfigBuilder } from "../Configuration/ConfigBuilder";
import { ModuleConfiguration } from "../Configuration/ModuleConfiguration";
import { PostInfo } from "../Utility/PostInfo";
import { SettingType } from "../Configuration/SettingType";
import { ConfigurationOptionVisibility } from "../Configuration/ConfigurationOptionVisibility";
import { Log } from "../Utility/Log";
import { PageContext } from "../Context/PageContext";

/**
 * EM_AvatarFilter - Extension module for RBKweb.
 */

export class AvatarFilter implements ExtensionModule {
    readonly name: string = "Avatarfilter";
    cfg: ModuleConfiguration;

    pageTypesToRunOn: Array<RBKwebPageType> = [
        RBKwebPageType.RBKweb_FORUM_POSTLIST
    ];

    runBefore: Array<string> = ['late-extmod'];
    runAfter: Array<string> = ['early-extmod'];

    configSpec = () =>
        ConfigBuilder
            .Define()
            .EnabledByDefault()
            .WithExtensionModuleName(this.name)
            .WithDisplayName(this.name)
            .WithDescription("En modul som lar deg fjerne avatarer fra brukerinnlegg.")
            .WithConfigOption(opt =>
                opt
                    .WithSettingName("HideAvatars")
                    .WithSettingType(SettingType.bool)
                    .WithLabel("Skjul avatarene på alle poster")
                    .WithVisibility(ConfigurationOptionVisibility.Always)
                    .WithDefaultValue(false)
            )
            .WithConfigOption(opt =>
                opt
                    .WithSettingName("HideAvatarUsers")
                    .WithSettingType(SettingType.text)
                    .WithLabel("Skjuler avatarene fra visse postere")
                    .WithVisibility(ConfigurationOptionVisibility.Never)
                    .WithDefaultValue("[]")
            )
            .Build();

    hideAvatars: boolean;
    hideUserAvatars: Array<number>;

    init = (config: ModuleConfiguration) => {
        this.cfg = config;
        this.hideAvatars = this.getConfigBool("HideAvatars");
        this.hideUserAvatars = JSON.parse(this.getConfigString("HideAvatarUsers"));
    }

    posts: Array<PostInfo>;

    preprocess = (context: PageContext) => {
        this.posts = context.RUSKPage.items as Array<PostInfo>;
        var pbutton = document.body.querySelector('span.mainmenu a.mainmenu[href^="profile.php?mode=editprofile"]') as HTMLAnchorElement;
        if (pbutton.textContent == "Profil")
            this.i18n = this.i18n_no;
    }

    i18n_no = {
        "Hide avatar": "Skjul profilbilde",
        "Show avatar": "Vis profilbilde",
    }

    i18n = {}

    tr = (text: string): string => {
        return this.i18n[text] || text;
    }

    HIDE_AVATAR: string = "Hide avatar";
    SHOW_AVATAR: string = "Show avatar";

    execute = (ctx: PageContext) => {
        this.posts.forEach(function(post: PostInfo, key, parent) {
            var avatar = post.rowElement.querySelector('span.postdetails img') as HTMLImageElement;
            var hideAvatar = this.hideUserAvatars.indexOf(post.posterid) != -1;
            if (avatar && (hideAvatar || this.hideAvatars)) {
                avatar.style.display = "none";
            }
            if (!this.hideAvatars && avatar) { // no need for context menu options when hiding all, or no avatar
                var cmenu = post.getContextMenu();
                cmenu.addAction(this.tr(this.HIDE_AVATAR), !hideAvatar, function() {
                    this.posts.forEach(function(thepost: PostInfo, idx, posts) {
                        try {
                            if (thepost.posterid != post.posterid) return;
                            this.hideUserAvatars.push(post.posterid);
                            this.saveHideUserAvatars();
                            this.posts.forEach(function(thepost: PostInfo, key, parent) {
                                if (thepost.posterid != post.posterid) return;
                                var avatar = thepost.rowElement.querySelector('span.postdetails img') as HTMLImageElement;
                                if (avatar) avatar.style.display = "none";
                                var menu = thepost.getContextMenu();
                                menu.getAction(this.tr(this.HIDE_AVATAR)).hide(); // FIXME: make checkboxed menu option instead
                                menu.getAction(this.tr(this.SHOW_AVATAR)).show();
                            }.bind(this));
                        } catch (e) {
                            Log.Error('avatar hide error: ' + e.message);
                        }
                    }.bind(this));
                }.bind(this));
                cmenu.addAction(this.tr(this.SHOW_AVATAR), hideAvatar, function() {
                    this.posts.forEach(function(thepost: PostInfo, idx, posts) {
                        try {
                            if (thepost.posterid != post.posterid) return;
                            var idx = this.hideUserAvatars.indexOf(post.posterid);
                            this.hideUserAvatars[idx] = this.hideUserAvatars[this.hideUserAvatars.length-1];
                            this.hideUserAvatars.pop();
                            this.saveHideUserAvatars();
                            this.posts.forEach(function(thepost: PostInfo, key, parent) {
                                if (thepost.posterid != post.posterid) return;
                                var avatar = thepost.rowElement.querySelector('span.postdetails img') as HTMLImageElement;
                                if (avatar) avatar.style.display = "";
                                var menu = thepost.getContextMenu();
                                menu.getAction(this.tr(this.HIDE_AVATAR)).show();
                                menu.getAction(this.tr(this.SHOW_AVATAR)).hide();
                            }.bind(this));
                        } catch (e) {
                            Log.Error('avatar show error: ' + e.message);
                        }
                    }.bind(this));
                }.bind(this));
            }
        }.bind(this));
    }

    private getConfigBool(setting: string): boolean {
        try {
            for (let i = 0; i < this.cfg.settings.length; i++) {
                if (this.cfg.settings[i].setting == setting) {
                    return this.cfg.settings[i].value as boolean;
                }
            }
            console.log("did not find setting '" + setting);
        } catch (e) {
            console.error("getConfigItem exception: " + e.message);
        }
        return false;
    }

    private getConfigString(setting: string): string {
        try {
            for (let i = 0; i < this.cfg.settings.length; i++) {
                if (this.cfg.settings[i].setting == setting) {
                    return this.cfg.settings[i].value as string;
                }
            }
            console.log("did not find setting '" + setting);
        } catch (e) {
            console.error("getConfigItem exception: " + e.message);
        }
        return null;
    }

    private saveHideUserAvatars(): void {
        var arraystr = JSON.stringify(this.hideUserAvatars);
        //console.log("storing avatar-hidden users: '" + arraystr + "'");
        this.cfg.ChangeSetting("HideAvatarUsers", arraystr);
    }
}