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

 // TODO: make sure links we embed are not in the signature part of the post

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
            )
            .WithConfigOption(opt =>
                opt
                    .WithSettingName("EmbedTwitter")
                    .WithLabel("Gjør om tweet-linker til tweets")
                    .WithSettingType(SettingType.bool)
                    .WithDefaultValue(true)
            )
            .WithConfigOption(opt =>
                opt
                    .WithSettingName("EmbedStreamable")
                    .WithLabel("Finner streamable-linker og legger til videoavspiller")
                    .WithSettingType(SettingType.bool)
                    .WithDefaultValue(true)
            )
            .WithConfigOption(opt =>
                opt
                    .WithSettingName("EmbedInstagram")
                    .WithLabel("Gjør om Instagram-linker til Instagram-poster")
                    .WithSettingType(SettingType.bool)
                    .WithDefaultValue(true)
            )
            .WithConfigOption(opt =>
                opt
                    .WithSettingName("InstagramCaption")
                    .WithLabel("Ha med caption på Instagram-poster")
                    .WithSettingType(SettingType.bool)
                    .WithDefaultValue(true)
            )
            .WithConfigOption(opt =>
                opt
                    .WithSettingName("InstagramOnlyPicture")
                    .WithLabel("Vis kun bilde fra Instagram-poster")
                    .WithSettingType(SettingType.bool)
                    .WithDefaultValue(false)
            )
            .Build();

    posts: Array<PostInfo>;

    // configs
    embedYoutube: boolean;
    embedTwitter: boolean;
    embedStreamable: boolean;
    embedInstagram: boolean;
    instagramCaption: boolean;
    instagramOnlyPicture: boolean;

    init = (config: ModuleConfiguration) => {
        this.cfg = config;
        this.embedYoutube = this.getConfigBool("EmbedYoutube");
        this.embedTwitter = this.getConfigBool("EmbedTwitter");
        this.embedStreamable = this.getConfigBool("EmbedStreamable");
        this.embedInstagram = this.getConfigBool("EmbedInstagram");
        this.instagramCaption = this.getConfigBool("InstagramCaption");
        this.instagramOnlyPicture = this.getConfigBool("InstagramOnlyPicture");
    }

    preprocess = () => {
        this.posts = PostInfo.GetPostsFromDocument(document);
    }

    execute = () => {
        this.posts.forEach(function(post: PostInfo, idx, posts) {
            post.rowElement.querySelectorAll('a').forEach(function(anchor: HTMLAnchorElement, key, parent) {
                try {
                    if (anchor.parentElement.tagName.match(/SPAN/i) &&
                        anchor.parentElement.classList.contains("postbody")) {
                        var href: string = anchor.href;
                        var text: string = anchor.textContent;
                        // console.log("link: " + href);
                        var signaturelink = false;
                        var signaturedelimiter = false;
                        anchor.closest('td').querySelectorAll("*").forEach(function(node: Node, key, parent) {
                            if (node.textContent.match(/________/))
                                signaturedelimiter = true;
                            else if (node.isEqualNode(anchor)) {
                                if (signaturedelimiter) // already seen the delimiter
                                    signaturelink = true;
                            }
                        }.bind(this));
                        if (signaturelink) {
                            // console.log("skipping link " + href + " in signature");
                        }
                        else if (href.substring(0, 8) != text.substring(0, 8)) {
                            // console.log("skipping decorated link " + href);
                        }
                        else if (this.embedYoutube && (href.match(/youtube\.com/i) || href.match(/youtu\.be/i))) {
                            // FIXME: support t=NNN for time-start
                            // console.log("found: " + href);
                            var match = href.match(/https?:\/\/(m\.|www\.)?youtube\.com\/watch\/([^\/\?#]*)/);
                            if (!match) match = href.match(/https?:\/\/(m\.|www\.)?youtube\.com\/watch\?v=([^\.\?#]*)/);
                            if (!match) match = href.match(/https?:\/\/(youtu)\.be\/([^\/\?#]*)/);
                            if (match) {
                                var code = match[2];
                                //console.log("youtube code: " + code);
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
                        else if (this.embedStreamable && href.match(/https?:\/\/streamable\.com\/.*$/i)) {
                            // console.log("found: " + href);
                            var match = href.match(/https?:\/\/streamable\.com\/([^\/]*)/i);
                            if (match) {
                                var code = match[1];
                                /* - kept around in case in case we want to change how we embed this media type
                                var oembedcodeurl = 'https://api.streamable.com/oembed?url=https://streamable.com/' + code;
                                fetch(oembedcodeurl).then(function(data) {
                                    console.log("FETCHED DATA: " + JSON.stringify(data));
                                }.bind(this)); */
                                anchor.insertAdjacentHTML('afterend', '<br>' +
                                    '<embed src="https://streamable.com/o/' + code + '" frameborder="0" allowfullscreen="1" width="460" height="280"></embed>');
                                //anchor.classList.add("RUSKHiddenItem"); // since fullscreen isn't enabled, keep link
                            }
                        }
                        else if (this.embedInstagram &&
                                 (href.match(/https?:\/\/(www\.)?instagram\.com\/.*$/i) || 
                                  href.match(/https?:\/\/instagr\.am\/p.*/))) {
                            //console.log("found instagram: " + href);
                            var match = href.match(/https?:\/\/(www\.)?instagram\.com\/p\/([^\/\?#]*).*$/i);
                            if (!match) match = href.match(/https?:\/\/(instagr\.am)\/p\/([^\/\?#]*).*$/i);
                            if (match) {
                                var code = match[2];
                                if (this.instagramOnlyPicture) {
                                    anchor.insertAdjacentHTML('afterend', '<br><img src="https://www.instagram.com/p/' + code + '/media/?size=l" width="460"/><br>');
                                } else {
                                    var oembedcodeurl = 'https://api.instagram.com/oembed/?' +
                                        'url=https://www.instagram.com/p/' + code + '&maxwidth=460&omitscript=true';
                                    if (!this.instagramCaption)
                                        oembedcodeurl = oembedcodeurl + '&hidecaption=true';
                                    fetch(oembedcodeurl, { mode: 'cors', redirect: 'follow' })
                                        .then(function(response: Response) { return response.json(); }.bind(this))
                                        .then(function(data) {
                                             anchor.insertAdjacentHTML('afterend', '<br>' + data.html + '<br>');
                                             anchor.classList.add("RUSKHiddenItem");
                                             this.activateInstagrams();
                                         }.bind(this));
                                }
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
    }

    private activateInstagrams(): void {
        (function(d, script) {
            script = d.createElement('script');
            script.type = 'text/javascript';
            script.async = true;
            script.src = 'https://platform.instagram.com/en_US/embeds.js';
            script.onload = function() {
                // remote script has loaded
                if (typeof window['instgrm'] !== "undefined") {
                    window['instgrm'].Embeds.process();
                }
            };
            d.getElementsByTagName('head')[0].appendChild(script);
        }(document));
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
    }

};