import { ExtensionModule } from "./ExtensionModule";
import { RBKwebPageType } from "../Context/RBKwebPageType";
import { ConfigBuilder } from "../Configuration/ConfigBuilder";
import { ModuleConfiguration } from "../Configuration/ModuleConfiguration";
import { PostInfo } from "../Utility/PostInfo";
import { SettingType } from "../Configuration/SettingType";

/**
 * EM_InboxAlert - Extension module for RBKweb.
 */

 // http://www.rbkweb.no/forum/viewtopic.php?t=2456&start=2525

export class MediaEmbedder implements ExtensionModule {
    readonly name: string = "MediaEmbedder";
    cfg: ModuleConfiguration;

    pageTypesToRunOn: Array<RBKwebPageType> = [
        RBKwebPageType.RBKweb_FORUM_POSTLIST,
    ];

    runBefore: Array<string> = ['late-extmod'];
    runAfter: Array<string> = ['early-extmod'];

    configSpec = () =>
        ConfigBuilder
            .Define()
            .EnabledByDefault()
            .WithExtensionModuleName(this.name)
            .WithDisplayName('Media Embedder')
            .WithDescription("Denne modulen embedder media-linker direkte i poster.")
            .WithConfigOption(opt =>
                opt
                    .WithSettingName("EmbedYoutube")
                    .WithLabel("Gjør om youtube-linker til youtube-playere")
                    .WithSettingType(SettingType.bool)
                    .WithDefaultValue(true)
                    .AsSharedSetting()
            )
            .Build();

    posts: Array<PostInfo>;
    embedYoutube: boolean;

    init = (config: ModuleConfiguration) => {
        this.cfg = config;
        this.embedYoutube = true;
    }

    preprocess = () => {
        this.posts = PostInfo.GetPostsFromDocument(document);
    }

    execute = () => {
        this.posts.forEach(function(post: PostInfo, idx, posts) {
            post.rowElement.querySelectorAll('a').forEach(function(anchor: HTMLAnchorElement, key, parent) {
                if (anchor.parentElement.tagName.match(/SPAN/i) && anchor.parentElement.classList.contains("postbody")) {
                    var href: string = anchor.href;
                    if (this.embedYoutube && (href.match(/youtube\.com/i) || href.match(/youtu\.be/i))) {
                        //console.log("found: " + href);
                        var match = href.match(/https?:\/\/(m\.|www\.)?youtube\.com\/watch\/([a-zA-Z0-9]*)/);
                        if (!match) match = href.match(/https?:\/\/(m\.|www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9]*)/);
                        if (!match) match = href.match(/https?:\/\/(youtu)\.be\/([^\/?#]*)/);
                        if (match) {
                            var code = match[2];
                            //console.log("youtube code: " + code);
                            anchor.insertAdjacentHTML('afterend', '<br>' +
                                '<object width="460" height="270" data="https://www.youtube.com/embed/' + code +
                                         '" frameborder="0" allow="encrypted-media"></object>');
                            anchor.classList.add("RUSKHiddenItem"); // option for hiding link?
                        }
                    }
                }
            }.bind(this));
        }.bind(this));
    };
};