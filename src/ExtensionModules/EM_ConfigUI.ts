import { ModuleBase } from "./ModuleBase";
import { RBKwebPageType } from "../Context/RBKwebPageType";
import { PageContext } from "../Context/PageContext";
import { ConfigBuilder } from "../Configuration/ConfigBuilder";
import { Log } from "../Utility/Log";

export class ConfigUI extends ModuleBase {

    private _configOverlay: HTMLDivElement = null;

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

    preprocess(ctx: PageContext): void {
        fetch(chrome.runtime.getURL("data/configOverlay.css"))
            .then(function (result) {
                return result.text();
            })
            .then(function (text) {
                chrome.runtime.sendMessage({ css: text });
            })
            .catch(function (err) {
                Log.Error('ConfigUI CSS error: ' + err.message + " - " + err.stack);
            });
    }

    execute(context: PageContext): void {
        var empower = this;

        chrome.runtime.onMessage.addListener(function (msg, sender, reply) {
            if (msg.closeConfigOverlay) {
                if (empower._configOverlay != null) {
                    document.body.removeChild(empower._configOverlay);
                    empower._configOverlay = null;
                    reply("ok from Empowerment");
                }
            }
        });

        let table = document.querySelector('body > table:nth-child(3) > tbody > tr:nth-child(2) > td:nth-child(2) > table') as HTMLTableElement;
        let allRows = Array.from(table.querySelectorAll('tr'));
        let headerRow = (allRows[0].cloneNode(true)) as HTMLTableRowElement;
        let linkRow = (allRows[1].cloneNode(true)) as HTMLTableRowElement;
        let link = linkRow.querySelector('a') as HTMLAnchorElement;
        let kontaktRow = table.querySelector('a[href="http://www.rbkweb.no/kontakt.php"]').closest('tr') as HTMLTableRowElement;

        headerRow.querySelector('strong').textContent = "RUSK";

        link.textContent = "INNSTILLINGER";
        link.href = "/#";
        link.addEventListener('click', ev => {
            ev.preventDefault();
            if (this._configOverlay == null) {
                this._configOverlay = this.insertConfigOverlay();
            }
            this._configOverlay.style.display = "block";
        });

        kontaktRow.parentNode.insertBefore(headerRow, kontaktRow.nextSibling);
        headerRow.parentNode.insertBefore(linkRow, headerRow.nextSibling);
    }

    private insertConfigOverlay(): HTMLDivElement {
        let overlay = document.createElement('div');
        overlay.id = 'RUSKConfigOverlay';

        let frame = document.createElement('iframe');
        frame.id = 'RUSKConfigIFrame';
        frame.src = chrome.extension.getURL('index.html');

        overlay.appendChild(frame);

        document.body.appendChild(overlay);

        return overlay;
    }
}
