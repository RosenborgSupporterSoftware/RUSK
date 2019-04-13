import { ModuleBase } from "./ModuleBase";
import { RBKwebPageType } from "../Context/RBKwebPageType";
import { PageContext } from "../Context/PageContext";
import { ConfigBuilder } from "../Configuration/ConfigBuilder";
import { ModuleConfiguration } from "../Configuration/ModuleConfiguration";
import { RUSKUI } from "../UI/RUSKUI";

export class ConfigUI extends ModuleBase {

    public get name(): string {
        return "ConfigUI";
    };

    pageTypesToRunOn = [RBKwebPageType.RBKweb_ALL];

    configSpec = () =>
        ConfigBuilder
            .Define()
            .WithExtensionModuleName(this.name)
            .EnabledByDefault()
            .WithDisplayName(this.name)
            .WithDescription('Modul som setter inn konfigurasjonsgrensesnitt for RUSK i RBKweb')
            .InvisibleToConfig()
            .Build();

    init(cfg: ModuleConfiguration): RUSKUI {
        super.init(cfg);

        let ui = new RUSKUI();
        ui.FetchCSS('configOverlay.css');
        ui.AddMenuItem('INNSTILLINGER', 0, this.displayConfigOverlay, this);
        return ui;
    }

    execute(context: PageContext): void {
        chrome.runtime.onMessage.addListener(function (msg, sender, reply) {
            if (msg.closeConfigOverlay) {
                let overlay = document.getElementById('RUSKConfigOverlay') as HTMLDivElement;
                if (overlay != null) {
                    document.body.removeChild(overlay);
                    reply("ok from EM_ConfigUI");
                }
            }
        });
    }

    displayConfigOverlay(ctx: PageContext): void {
        let overlay = document.getElementById('RUSKConfigOverlay') as HTMLDivElement;
        if (overlay == null) {
            overlay = document.createElement('div');
            overlay.id = 'RUSKConfigOverlay';

            let frame = document.createElement('iframe');
            frame.id = 'RUSKConfigIFrame';
            frame.src = chrome.extension.getURL('index.html');

            overlay.appendChild(frame);

            document.body.appendChild(overlay);
        }
        overlay.style.display = "block";
    }
}
