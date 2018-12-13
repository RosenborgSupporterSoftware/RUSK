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
            .WithConfigOption(opt =>
                opt
                    .WithSettingName("EmbedTwitter")
                    .WithLabel("Gjør om tweet-linker til tweets")
                    .WithSettingType(SettingType.bool)
                    .WithDefaultValue(true)
                    .AsSharedSetting()
            )
            .Build();

    posts: Array<PostInfo>;

    // configs
    embedYoutube: boolean;
    embedTwitter: boolean;

    init = (config: ModuleConfiguration) => {
        this.cfg = config;
        this.embedYoutube = true;
        this.embedTwitter = true;
    }

    preprocess = () => {
        this.posts = PostInfo.GetPostsFromDocument(document);
    }

    execute = () => {
        this.posts.forEach(function(post: PostInfo, idx, posts) {
            post.rowElement.querySelectorAll('a').forEach(function(anchor: HTMLAnchorElement, key, parent) {
                try {
                    if (anchor.parentElement.tagName.match(/SPAN/i) && anchor.parentElement.classList.contains("postbody")) {
                        var href: string = anchor.href;
                        // console.log("link: " + href);
                        if (this.embedYoutube && (href.match(/youtube\.com/i) || href.match(/youtu\.be/i))) {
                            // console.log("found: " + href);
                            var match = href.match(/https?:\/\/(m\.|www\.)?youtube\.com\/watch\/([^\/?#]*)/);
                            if (!match) match = href.match(/https?:\/\/(m\.|www\.)?youtube\.com\/watch\?v=([^\.?#]*)/);
                            if (!match) match = href.match(/https?:\/\/(youtu)\.be\/([^\/?#]*)/);
                            if (match) {
                                var code = match[2];
                                // console.log("youtube code: " + code);
                                anchor.insertAdjacentHTML('afterend', '<br>' +
                                    '<object width="460" height="270" data="https://www.youtube.com/embed/' + code +
                                             '" frameborder="0" allow="encrypted-media"></object>');
                                anchor.classList.add("RUSKHiddenItem"); // option for hiding link?
                            }
                        }
                        else if (this.embedTwitter && href.match(/https?:\/\/twitter\.com\/[^\/]*\/status\/([0-9]*).*/i)) {
                            // console.log("found: " + href);
                            var match = href.match(/https?:\/\/twitter\.com\/([^\/]*)\/status\/([0-9]*).*/i);
                            if (match) {
                                var account = match[1];
                                var code = match[2];
                                anchor.insertAdjacentHTML('afterend', '<br>' +
                                    '<iframe id="tweet_' + code + '" border=0 frameborder=0 height=250 width=460 src="https://twitframe.com/show?url=' + encodeURI("https://twitter.com/" + account + "/status/" + code) + '"></iframe>');
                                anchor.classList.add("RUSKHiddenItem"); // option for hiding link?
                            }
                        }
                    }
                } catch (e) {
                    console.error("execute exception: " + e.message);
                }
            }.bind(this));
        }.bind(this));

        var tweets = document.body.querySelectorAll('iframe[id^="tweet_"]');
        tweets.forEach(function(tweetframe: HTMLIFrameElement, key, parent) {
            tweetframe.addEventListener('load', function() {
                tweetframe.contentWindow.postMessage({ element: tweetframe.id, query: "height" },
                                                     "https://twitframe.com");
                var origheight = tweetframe.style.height;
                var interval = setInterval(function() {
                    if (tweetframe.style.height == origheight) {
                        tweetframe.contentWindow.postMessage({ element: tweetframe.id, query: "height" },
                                                               "https://twitframe.com");
                    }
                }, 500);
                tweetframe.setAttribute("data-interval", "" + interval);
            });
        });

        window.addEventListener("message", function(event) {
            if (event.origin != "https://twitframe.com") return;
            if (event.data && event.data.height && event.data.element.match(/^tweet_/)) {
                var height = parseInt(event.data.height);
                if (height == 139) return;
                var iframe = document.getElementById(event.data.element) as HTMLIFrameElement;
                var interval = iframe.getAttribute("data-interval");
                if (interval) { clearInterval(parseInt(interval)); }
                iframe.style.height = height + "px";
            }
        });
    };
};