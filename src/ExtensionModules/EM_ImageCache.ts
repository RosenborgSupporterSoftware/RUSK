import { ExtensionModule } from "./ExtensionModule";
import { RBKwebPageType } from "../Context/RBKwebPageType";
import { ConfigBuilder } from "../Configuration/ConfigBuilder";
import { ModuleConfiguration } from "../Configuration/ModuleConfiguration";

/**
 * EM_ImageCache - Extension module for RBKweb.
 */

export class ImageCache implements ExtensionModule {
    readonly name: string = "ImageCache";
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
            .WithDisplayName(this.name)
            .WithDescription("Denne modulen bruker lokalt cachede ikoner for RBKweb.")
            .Build();

    init = (config: ModuleConfiguration) => {
        this.cfg = config;
    }

    preprocess = () => {
    }

    execute = () => {
        var cached = [
            'folder_big.gif',
            'folder_locked_big.gif',
            'folder_new_big.gif',
            'icon_latest_reply.gif',
            'icon_newest_reply.gif',
            'icon_mini_faq.gif',
            'icon_mini_groups.gif',
            'icon_mini_login.gif',
            'icon_mini_members.gif',
            'icon_mini_message.gif',
            'icon_mini_profile.gif',
            'icon_mini_search.gif',
            'icon_mini_statistics.png',
            'whosonline.gif',
            'folder.gif',
            'folder_announce.gif',
            'folder_hot.gif',
            'folder_sticky.gif',
            'msg_inbox.gif',
            'msg_outbox.gif',
            'msg_savebox.gif',
            'msg_sentbox.gif',
            'voting_bar.gif',
            'mening.gif',
            'pil.gif',
            'print.gif',
            'norwegian/icon_yim.gif',
            'norwegian/icon_icq_add.gif',
            'norwegian/icon_aim.gif',
            'norwegian/icon_email.gif',
            'norwegian/icon_msnm.gif',
            'norwegian/icon_www.gif',
            'norwegian/icon_pm.gif',
            'norwegian/icon_profile.gif',
            'norwegian/icon_quote.gif',
            'norwegian/msg_newpost.gif',
            'norwegian/post.gif',
            'norwegian/reply.gif',
            'english/icon_yim.gif',
            'english/icon_icq_add.gif',
            'english/icon_aim.gif',
            'english/icon_email.gif',
            'english/icon_msnm.gif',
            'english/icon_www.gif',
            'english/icon_pm.gif',
            'english/icon_profile.gif',
            'english/icon_quote.gif',
            'english/msg_newpost.gif',
            'english/post.gif',
            'english/reply.gif',
            'smiles/icon_arrow.gif',
            'smiles/icon_beer.gif',
            'smiles/icon_biggrin.gif',
            'smiles/icon_confused.gif',
            'smiles/icon_cool.gif',
            'smiles/icon_cry.gif',
            'smiles/icon_eek.gif',
            'smiles/icon_engel.gif',
            'smiles/icon_evil.gif',
            'smiles/icon_exclaim.gif',
            'smiles/icon_idea.gif',
            'smiles/icon_lol.gif',
            'smiles/icon_love.gif',
            'smiles/icon_mad.gif',
            'smiles/icon_mrgreen.gif',
            'smiles/icon_neutral.gif',
            'smiles/icon_question.gif',
            'smiles/icon_razz.gif',
            'smiles/icon_redface.gif',
            'smiles/icon_rolleyes.gif',
            'smiles/icon_sad.gif',
            'smiles/icon_smile.gif',
            'smiles/icon_surprised.gif',
            'smiles/icon_tommel.gif',
            'smiles/icon_tommel_ned.gif',
            'smiles/icon_twisted.gif',
            'smiles/icon_wink.gif',
            'smiles/rbk.gif',
            'smiles/rbk3.gif',
        ];

        var imgs = document.body.querySelectorAll("img");
        if (imgs) {
            for (var c = 0; c < imgs.length; ++c) {
                var img = imgs.item(c) as HTMLImageElement;
                var file = img.src;
                if (file) {
                    var match = file.match(/.*\/([^/]*)\/([^/]*)$/);
                    if (match) {
                        var language = match[1];
                        var filename = match[2];
                        if (language.startsWith("lang_"))
                            filename = language.substring(5) + "/" + filename;
                        else if (language == "smiles")
                            filename = "smiles/" + filename;
                        if (cached.findIndex(function (val, idex, arr) { return filename == val; }) != -1) {
                            img.src = chrome.runtime.getURL("img/" + filename);
                        }
                    }
                }
            }
        }
    };
};



