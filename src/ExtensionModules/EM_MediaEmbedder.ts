import { ExtensionModule } from "./ExtensionModule";
import { RBKwebPageType } from "../Context/RBKwebPageType";
import { ConfigBuilder } from "../Configuration/ConfigBuilder";
import { ModuleConfiguration } from "../Configuration/ModuleConfiguration";
import { PostInfo } from "../Utility/PostInfo";
import { SettingType } from "../Configuration/SettingType";

/**
 * EM_MediaEmbedder - Extension module for RBKweb.
 * Embeds Youtube, Twitter, Instagram, Streamable directly into posts.
 */

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
                    .WithSettingName("ReplaceYoutubeLinks")
                    .WithLabel("Fjern youtube-link når youtube-player legges inn")
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
                    .WithSettingName("ReplaceTwitterLinks")
                    .WithLabel("Fjern original twitter-link når tweet legges inn")
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
                    .WithSettingName("ReplaceInstagramLinks")
                    .WithLabel("Fjern original instagram-link når Instagram-poster legges inn")
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
    replaceYoutubeLinks: boolean;
    embedTwitter: boolean;
    replaceTwitterLinks: boolean;
    embedStreamable: boolean;
    replaceStreamableLinks: boolean;
    embedInstagram: boolean;
    replaceInstagramLinks: boolean;
    instagramCaption: boolean;
    instagramOnlyPicture: boolean;

    init = (config: ModuleConfiguration) => {
        this.cfg = config;
        this.embedYoutube = this.getConfigBool("EmbedYoutube");
        this.replaceYoutubeLinks = this.getConfigBool("ReplaceYoutubeLinks");
        this.embedTwitter = this.getConfigBool("EmbedTwitter");
        this.replaceTwitterLinks = this.getConfigBool("ReplaceTwitterLinks");
        this.embedStreamable = this.getConfigBool("EmbedStreamable");
        this.replaceStreamableLinks = this.getConfigBool("ReplaceStreamableLinks");
        this.embedInstagram = this.getConfigBool("EmbedInstagram");
        this.replaceInstagramLinks = this.getConfigBool("ReplaceInstagramLinks");
        this.instagramCaption = this.getConfigBool("InstagramCaption");
        this.instagramOnlyPicture = this.getConfigBool("InstagramOnlyPicture");
    }

    preprocess = () => {
        this.posts = PostInfo.GetPostsFromDocument(document);
    }

    execute = () => {
        document.body.insertAdjacentHTML('afterbegin', '<div id="RUSKActivations"></div>');
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
                                if (this.replaceYoutubeLinks)
                                    anchor.classList.add("RUSKHiddenItem");
                            }
                        }
                        else if (this.embedTwitter && href.match(/https?:\/\/twitter\.com\/[^\/]*\/status\/([0-9]*).*/i)) {
                            var match = href.match(/https?:\/\/twitter\.com\/([^\/]*)\/status\/([0-9]*).*/i);
                            if (match) {
                                //var account = match[1];
                                var code = match[2];
                                var oembedcodeurl = "https://publish.twitter.com/oembed?" +
                                    "url=https://twitter.com/twitter/status/" + code +
                                    "&maxwidth=460&omit_script=true&dnt=true";
                                fetch(oembedcodeurl, { mode: 'cors' })
                                    .then(function(response: Response) {
                                        return response.json();
                                    }.bind(this))
                                    .then(function(data: Object) {
                                        anchor.insertAdjacentHTML('afterend', '<br>' + data['html'] + '<br>');
                                        if (this.replaceTwitterLinks)
                                            anchor.classList.add("RUSKHiddenItem");
                                        this.activateTweets();
                                    }.bind(this))
                                    .catch(function(err) {
                                        console.error('Fetch error: ' + err.message + " - " + err.stack);
                                    }.bind(this));
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
                                             if (this.replaceInstagramLinks)
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
    }

    private activateTweets(): void {
        var activations = document.getElementById('RUSKActivations') as HTMLDivElement;
        if (activations.getAttribute("data-twitter")) return;
        activations.setAttribute("data-twitter", "true");
        (function(d, script) {
            script = d.createElement('script');
            script.type = 'text/javascript';
            script.async = true;
            script.src = 'https://platform.twitter.com/widgets.js';
            script.onload = function() {
                // remote script has loaded
                if (typeof window['twttr'] !== "undefined") {
                    console.log("calling widgets.load()")
                    window['twttr'].widgets.load();
                }
            };
            d.getElementsByTagName('head')[0].appendChild(script);
        }(document));
    }

    private activateInstagrams(): void {
        var activations = document.getElementById('RUSKActivations') as HTMLDivElement;
        if (activations.getAttribute("data-instagram")) return;
        activations.setAttribute("data-instagram", "true");
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
}