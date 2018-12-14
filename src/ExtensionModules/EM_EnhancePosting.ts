import { ExtensionModule } from "./ExtensionModule";
import { SettingType } from "../Configuration/SettingType";
import { RBKwebPageType } from "../Context/RBKwebPageType";
import { ConfigBuilder } from "../Configuration/ConfigBuilder";
import { ConfigurationOptionVisibility } from "../Configuration/ConfigurationOptionVisibility";
import { ModuleConfiguration } from "../Configuration/ModuleConfiguration";
import { PageContext } from "../Context/PageContext";
import * as autosize from "autosize";

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
        RBKwebPageType.RBKweb_FORUM_REPLYTOTOPIC
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
            .Build();

    init = (config: ModuleConfiguration) => {
        this.cfg = config;
    }

    preprocess = () => {
    }

    execute = (context: PageContext) => {
        this.setPostButtonState();
        this.autoSize();
        this.setFocus(context.PageType == RBKwebPageType.RBKweb_FORUM_POSTNEWTOPIC);
        this.setupHotkeys();
    };

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
            this.postButton.scrollIntoView({ behavior: "instant", block: "nearest", inline: "nearest" });
        });
        this.textArea.addEventListener('keyup', () => {
            this.setPostButtonState();
        });
        this.textArea.addEventListener('change', () => {    // Har denne her fordi hva om noen høyreklikker og paster noe? Ingen tastetrykk.
            this.setPostButtonState();
        });
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
};
