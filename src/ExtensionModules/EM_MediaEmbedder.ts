import { ExtensionModule } from "./ExtensionModule";
import { RBKwebPageType } from "../Context/RBKwebPageType";
import { ConfigBuilder } from "../Configuration/ConfigBuilder";
import { ModuleConfiguration } from "../Configuration/ModuleConfiguration";
import { PostInfo } from "../Utility/PostInfo";
import { SettingType } from "../Configuration/SettingType";
import { PageContext } from "../Context/PageContext";
import { ModuleBase } from "./ModuleBase";

/**
 * EM_MediaEmbedder - Extension module for RBKweb.
 * Embeds Youtube, Twitter, Instagram, Streamable directly into posts.
 */

export class MediaEmbedder extends ModuleBase {
    readonly name: string = "MediaEmbedder";

    pageTypesToRunOn: Array<RBKwebPageType> = [
        RBKwebPageType.RBKweb_FORUM_POSTLIST,
    ];

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
                    .WithSettingName("ReplaceStreamableLinks")
                    .WithLabel("Fjern original streamable-link når videospiller legges inn")
                    .WithSettingType(SettingType.bool)
                    .WithDefaultValue(false)
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
            .WithConfigOption(opt =>
                opt
                    .WithSettingName("EmbedMP4")
                    .WithLabel("Gjør om mp4-linker til videoavspillere")
                    .WithSettingType(SettingType.bool)
                    .WithDefaultValue(true)
            )
            .WithConfigOption(opt =>
                opt
                    .WithSettingName("EmbedWebm")
                    .WithLabel("Gjør om webm-linker til videoavspillere")
                    .WithSettingType(SettingType.bool)
                    .WithDefaultValue(true)
            )
            /*
            .WithConfigOption(opt =>
                opt
                    .WithSettingName("EmbedM3U8")
                    .WithLabel("Gjør om m3u8-linker til videoavspillere")
                    .WithSettingType(SettingType.bool)
                    .WithDefaultValue(true)
            )
            */
            .Build();

    posts: Array<PostInfo>;

    // configs
    embedYoutube: boolean;
    embedTwitter: boolean;
    embedStreamable: boolean;
    replaceStreamableLinks: boolean;
    embedInstagram: boolean;
    instagramCaption: boolean;
    instagramOnlyPicture: boolean;
    embedMp4: boolean;
    embedWebm: boolean;
    //embedM3U8: boolean;

    init = (config: ModuleConfiguration) => {
        super.init(config);

        this.embedYoutube = this._cfg.GetSetting("EmbedYoutube") as boolean;
        this.embedTwitter = this._cfg.GetSetting("EmbedTwitter") as boolean;
        this.embedStreamable = this._cfg.GetSetting("EmbedStreamable") as boolean;
        this.replaceStreamableLinks = this._cfg.GetSetting("ReplaceStreamableLinks") as boolean;
        this.embedInstagram = this._cfg.GetSetting("EmbedInstagram") as boolean;
        this.instagramCaption = this._cfg.GetSetting("InstagramCaption") as boolean;
        this.instagramOnlyPicture = this._cfg.GetSetting("InstagramOnlyPicture") as boolean;
        this.embedMp4 = this._cfg.GetSetting("EmbedMP4") as boolean;
        this.embedWebm = this._cfg.GetSetting("EmbedWebm") as boolean;
        //this.embedM3U8 = this.cfg.GetSetting("EmbedM3U8") as boolean;

        return null;
    }

    preprocess = (context: PageContext) => {
        this.posts = context.RUSKPage.items as Array<PostInfo>;
    }

    tweets: Array<string>;

    execute = (context: PageContext) => {
        this.tweets = new Array<string>();
        this.posts.forEach(function(post: PostInfo, idx, posts) {
            var sigpos = post.postBodyElement.innerHTML.indexOf('________');
            var hasSignature = sigpos != -1;
            post.postBodyElement.querySelectorAll('a').forEach(function(anchor: HTMLAnchorElement, key, parent) {
                try {
                    if (anchor.parentElement.tagName.match(/SPAN/i) &&
                        anchor.parentElement.classList.contains("postbody")) {
                        var href: string = anchor.href;
                        var text: string = anchor.textContent;
                        var signaturelink = false;
                        if (hasSignature) {
                            var linkpos = post.postBodyElement.innerHTML.indexOf(anchor.outerHTML);
                            if (sigpos < linkpos)
                                signaturelink = true;
                        }
                        if (signaturelink) {
                            // console.log("skipping link " + href + " in signature");
                        }
                        else if (href.substring(0, 8) != text.substring(0, 8)) {
                            // console.log("skipping decorated link " + href);
                        }
                        else if (this.embedYoutube && (href.match(/youtube\.com/i) || href.match(/youtu\.be/i))) {
                            // FIXME: use oembed instead?
                            // console.log("found: " + href);
                            var match = href.match(/https?:\/\/(m\.|www\.)?youtube\.com\/watch\/([^\/\&\?#]*)/);
                            if (!match) match = href.match(/https?:\/\/(m\.|www\.)?youtube\.com\/watch\?v=([^\.\?\&#]*)/);
                            if (!match) match = href.match(/https?:\/\/(youtu)\.be\/([^\/\&\?#]*)/);
                            if (match) {
                                var time = href.match(/\&(t=[0-9ms]*)/);
                                var code = match[2];
                                if (time) code = code + "&" + time;
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
                                this.tweets.push("tweet_" + code);
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
                                var oembedcodeurl = 'https://api.streamable.com/oembed?url=https://streamable.com/' + code;
                                fetch(oembedcodeurl).then(function(data) {
                                    return data.json();
                                }.bind(this)).then(function(data) {
                                    var html: string = data['html'];
                                    var widthmatch = html.match('width="([0-9]*)"');
                                    var width = 0;
                                    if (widthmatch) {
                                         width = parseInt(widthmatch[1]);
                                        var heightmatch = html.match('height="([0-9]*)"');
                                        html = html.replace(widthmatch[0], ' width="460"');
                                        if (heightmatch) {
                                            var height = parseInt(heightmatch[1]);
                                            if (height > 0) {
                                                height = Math.trunc(height * 460 / width);
                                                html = html.replace(heightmatch[0], ' height="' + height + '"');
                                            }
                                        }
                                    }
                                    anchor.insertAdjacentHTML('afterend', '<br>' + html + '<br>');
                                    if (this.replaceStreamableLinks)
                                        anchor.classList.add("RUSKHiddenItem");
                                }.bind(this)).catch(function(err) {
                                    console.error("fetch error: " + err.message + " - " + err.stack);
                                }.bind(this));
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
                        else if (this.embedMp4 && href.match(/.*\.mp4$/)) {
                            anchor.insertAdjacentHTML('afterend', '<br>' +
                                '<video controls width="460">' +
                                '<source src="' + anchor.href + '" type="video/mp4">' +
                                'Sorry, your browser does not support embedding with <tt>&lt;video&gt;</tt>.' +
                                '</video>');
                        }
                        else if (this.embedWebm && href.match(/.*\.webm$/)) {
                            anchor.insertAdjacentHTML('afterend', '<br>' +
                                '<video controls width="460">' +
                                '<source src="' + anchor.href + '" type="video/webm">' +
                                'Sorry, your browser does not support embedding with <tt>&lt;video&gt;</tt>.' +
                                '</video>');
                        }
                        /*
                        else if (this.embedM3U8 && href.match(/.*\.m3u8\b/)) {
                            this.activateM3U8();
                            //anchor.insertAdjacentHTML('afterend', '<br>' +
                            //    '<video controls width="460">' +
                            //    '<source src="' + anchor.href + '" type="application/x-mpegURL">' +
                            //    'Sorry, your browser does not support embedding .m3u8 with the video tag.' +
                            //    '</video>');
                        }
                        */
                    }
                } catch (e) {
                    console.error("execute exception: " + e.message);
                }
            }.bind(this));
        }.bind(this));

        this.tweets.forEach(function(id: string, idx, tweets) {
            var iframe = document.getElementById(id);
            var origheight = iframe.style.height;
            var poller = function() {
                var tweetframe = document.getElementById(id) as HTMLIFrameElement;
                if (tweetframe.style.height == origheight && tweetframe.contentWindow) {
                    tweetframe.contentWindow.postMessage({ element: tweetframe.id, query: "height" },
                                                           "https://twitframe.com");
                }
            }.bind(this);
            iframe.setAttribute("data-interval", "" + setInterval(poller, 250));
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
}
