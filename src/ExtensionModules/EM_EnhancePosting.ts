import { ExtensionModule } from "./ExtensionModule";
import { SettingType } from "../Configuration/SettingType";
import { RBKwebPageType } from "../Context/RBKwebPageType";
import { ConfigBuilder } from "../Configuration/ConfigBuilder";
import { ConfigurationOptionVisibility } from "../Configuration/ConfigurationOptionVisibility";
import { ModuleConfiguration } from "../Configuration/ModuleConfiguration";
import { PageContext } from "../Context/PageContext";
import * as autosize from "autosize";
import { Log } from "../Utility/Log";

/**
 * EM_EnhancePosting - Extension module for RBKweb.
 * Attempts to make posting on RBKweb a more pleasant experience through some enhancements:
 *  - Autoresize of textarea happens automatically as user enters long posts
 *  - Correctly focuses subject input or textarea according to posting mode
 *  - Ctrl-Enter shortcut for submitting post
 *  - Disables submit button when textarea is empty to avoid accidental submit
 *  - Scroller når tekstboksen blir kjempestor for å holde OK-knappen synlig nederst
 */

export class EnhancePosting implements ExtensionModule {
    readonly name: string = "EnhancePosting";
    cfg: ModuleConfiguration;

    pageTypesToRunOn: Array<RBKwebPageType> = [
        RBKwebPageType.RBKweb_FORUM_EDITPOST,
        RBKwebPageType.RBKweb_FORUM_POSTNEWTOPIC,
        RBKwebPageType.RBKweb_FORUM_REPLYTOTOPIC,
        RBKwebPageType.RBKweb_FORUM_POSTLIST
    ];

    runBefore: Array<string> = ['late-extmod'];
    runAfter: Array<string> = ['early-extmod'];

    private _txtArea: HTMLTextAreaElement = null;
    private get textArea(): HTMLTextAreaElement {
        if (this._txtArea == null) {
            this._txtArea = document.querySelector('textarea[name="message"]') as HTMLTextAreaElement;
        }
        return this._txtArea;
    }

    private _subject: HTMLInputElement = null;
    private get subjectInput(): HTMLInputElement {
        if (this._subject == null) {
            this._subject = document.querySelector('input[name="subject"]') as HTMLInputElement;
        }
        return this._subject;
    }

    private _btn: HTMLInputElement = null;
    private get postButton(): HTMLInputElement {
        if (this._btn == null) {
            this._btn = document.querySelector('input[name="post"]') as HTMLInputElement;
        }
        return this._btn;
    }

    THREAD_VISITS: string = "threadvisits";

    configSpec = () =>
        ConfigBuilder
            .Define()
            .EnabledByDefault()
            .WithExtensionModuleName(this.name)
            .WithDisplayName("Forbedringer ved posting")
            .WithDescription("Denne modulen gjør små forbedringer når du skal legge inn eller redigere et innlegg på forumet.")
            .WithConfigOption(opt =>
                opt
                    .WithSettingName("resize")
                    .WithSettingType(SettingType.bool)
                    .WithLabel("Justere størrelse på tekstboks etter innhold")
                    .WithDefaultValue(true)
                    .WithVisibility(ConfigurationOptionVisibility.Always)
            )
            .WithConfigOption(opt =>
                opt
                    .WithSettingName("autofocus")
                    .WithSettingType(SettingType.bool)
                    .WithLabel("Sette fokus på emne/innholdsfelt automatisk")
                    .WithDefaultValue(true)
                    .WithVisibility(ConfigurationOptionVisibility.Always)
            )
            .WithConfigOption(opt =>
                opt
                    .WithSettingName("posthotkey")
                    .WithSettingType(SettingType.bool)
                    .WithLabel("Bruk hurtigtast Ctrl-Enter for å legge inn innlegg")
                    .WithDefaultValue(true)
                    .WithVisibility(ConfigurationOptionVisibility.Always)
            )
            .WithConfigOption(opt =>
                opt
                    .WithSettingName(this.THREAD_VISITS)
                    .WithSettingType(SettingType.text)
                    .WithLabel("Map over de N siste trådene man har besøkt")
                    .WithDefaultValue("{}")
                    .WithVisibility(ConfigurationOptionVisibility.Never)
            )
            .Build();

    topicIds: Array<number>;
    topicTitles: Array<string>;

    init = (config: ModuleConfiguration) => {
        this.cfg = config;
        var visitstr = this.cfg.GetSetting(this.THREAD_VISITS) as string;
        if (visitstr) {
            var obj = JSON.parse(visitstr);
            if (obj.ids) this.topicIds = obj.ids as Array<number>;
            else this.topicIds = new Array<number>();
            if (obj.titles) this.topicTitles = obj.titles as Array<string>;
            else this.topicTitles = new Array<string>();
        }

        return null;
    }

    preprocess = (context: PageContext) => {
        if (context.PageType == RBKwebPageType.RBKweb_FORUM_POSTLIST) {
            try {
                var threadanchor = document.body.querySelector('a.maintitle') as HTMLAnchorElement;
                var topicidmatch = threadanchor.href.match(/\bt=([0-9]+)\b/);
                if (threadanchor && topicidmatch) {
                    var topicTitle = threadanchor.textContent;
                    var topicId = +topicidmatch[1];
                    // Log.Debug('picked up thread id=' + topicId + ', title="' + topicTitle + '"');
                    if (this.topicIds.indexOf(topicId) == -1) {
                        if (this.topicIds.length > 10) this.topicIds.unshift();
                        this.topicIds.push(topicId);
                        if (this.topicTitles.length > 10) this.topicTitles.unshift();
                        this.topicTitles.push(topicTitle);
                        this.storeThreadVisits();
                    }
                }
            } catch (e) {
                Log.Error("exception: " + e.message + " - " + e.stack);
            }
        }
    }

    execute = (context: PageContext) => {
        if (context.PageType != RBKwebPageType.RBKweb_FORUM_POSTLIST) {
            this.setPostButtonState();
            this.autoSize();
            this.setFocus(context.PageType == RBKwebPageType.RBKweb_FORUM_POSTNEWTOPIC);
            this.setupHotkeys();
            this.setupTitle();
        }
    };

    invoke = function (cmd: string): boolean {
        return false;
    }

    private setupHotkeys(): void {
        document.addEventListener("keyup", (ev) => {
            if (ev.code == "Enter" && ev.ctrlKey) {
                this.submitPost();
            }
        });
    }

    private autoSize() {
        autosize(this.textArea);

        this.textArea.addEventListener('autosize:resized', () => {
            var options: ScrollIntoViewOptions = {  block: "nearest", inline: "nearest", behavior: "auto" };
            this.postButton.scrollIntoView(options); //{ behavior: "instant", block: "nearest", inline: "nearest" });
        });
        this.textArea.addEventListener('keyup', () => {
            this.setPostButtonState();
        });
        this.textArea.addEventListener('change', () => {    // Har denne her fordi hva om noen høyreklikker og paster noe? Ingen tastetrykk.
            this.setPostButtonState();
        });
    }

    private setupTitle(): void {
        try {
            var iframe = document.body.querySelector('iframe') as HTMLIFrameElement;
            if (iframe) {
                var threadidmatch = iframe.src.match(/\bt=([0-9]+)\b/);
                if (threadidmatch) {
                    var threadId = +threadidmatch[1];
                    var titleidx = this.topicIds.indexOf(threadId);
                    if (titleidx != -1) {
                        var title = this.topicTitles[titleidx];
                        var anchorelt = document.body.querySelector('span.nav a[href="index.php"]') as HTMLAnchorElement;
                        var spanelt = anchorelt.closest('span');
                        spanelt.insertAdjacentHTML('beforeend', ' -> ' +
                            '<a href="viewtopic.php?t=' + threadId + '" class="nav">' + title + '</a>');
                    }
                }
            }
        } catch (e) {
            Log.Error("exception: " + e.message + " - " + e.stack);
        }
    }

    private setPostButtonState() {
        this.postButton.disabled = (this.textArea.value.length == 0);
    }

    private setFocus(isNewTopic: boolean): void {
        if (isNewTopic) {
            this.subjectInput.focus();
        } else {
            this.textArea.focus();
        }
    }

    private submitPost() {
        this.postButton.click();
    }

    private storeThreadVisits(): void {
        var visitstr = JSON.stringify({ ids: this.topicIds, titles: this.topicTitles });
        this.cfg.ChangeSetting(this.THREAD_VISITS, visitstr);
    }

    private getConfigItem(setting: string): string {
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
    }

}
