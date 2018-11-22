import { ExtensionModule } from "./extensionmodule";
import { ConfigOptions } from "../Configuration/configoptions";
import { SettingType } from "../Configuration/settingtype";

/**
 * EM_Brukertips - Extension module for displaying "tooltips" on RBKweb.
 * Actually just a simple first module for testing purposes.
 * Should evolve to an actual tooltips module eventually.
 */

export class Brukertips implements ExtensionModule {

    name: "Brukertips";

    urlsToRunOn: [];

    runBefore: ['lame-o-matic'];
    runAfter: [];

    getConfigOptions = () : ConfigOptions => {
        return {
            displayName: "Vis brukertips",
            options: [
                {
                    setting: "displayTooltips",
                    type: SettingType.bool,
                    label: "Vis brukertips under sitater på RBKweb"
                }
            ]
        }
    };

    execute: () => {
        // TODO: Sett inn brukertips i DOM
    }
}
