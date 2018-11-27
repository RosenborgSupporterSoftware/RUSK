import { ExtensionModule } from "./ExtensionModule";
import { ConfigOptions } from "../Configuration/ConfigOptions";
import { SettingType } from "../Configuration/SettingType";
import { RBKwebPageType } from "../Context/RBKwebPageType";

/**
 * EM_HighlightColor - Extension module for RBKweb.
 */

export class HighlightColor implements ExtensionModule {
    readonly name : string = "HighlightColor";

    pageTypesToRunOn: Array<RBKwebPageType> = [
        RBKwebPageType.RBKweb_ALL
    ];

    runBefore: Array<string> = ['late-extmod'];
    runAfter: Array<string> = ['early-extmod'];

    getConfigOptions = (): ConfigOptions => {
        return {
            displayName: "HighlightColor",
            options: [
                {
                    setting: "color",
                    type: SettingType.color,
                    label: "Farge for highlighting"
                }
            ]
        };
    };

    execute = () => {
        var highlights = document.body.querySelectorAll('b[style="color:#FFFFFF"]');
        if (highlights) {
            for (var c = 0; c < highlights.length; ++c) {
                var highlight = highlights.item(c) as HTMLElement;
                var style = highlight.style;
                style.color = "#ff6666";
            }
        }
    };
};



