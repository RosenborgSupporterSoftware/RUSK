import { RUSKUI } from "./RUSKUI";

/**
 * CssBuilder - A class that builds a complete stylesheet from RUSKUI objects
 */

export class CssBuilder {

    public BuildCSS(uimods:Array<RUSKUI>, callback: (css: string) => void): void {

        let promises = new Array<Promise<string>>();

        let header = ":root {\r\n";

        uimods.forEach(mod => {
            let fn = mod.CSSFilename;
            if (fn == null || fn.length == 0)
                return;

            let url = chrome.runtime.getURL("/data/" + mod.CSSFilename);
            let promise = fetch(url)
                .then(res => res.text());
            promises.push(promise);

            mod.CSSProperties.forEach((val, key) => {
                header += "  " + key + ": " + val + ";\r\n";
            })
        });

        header += "}\r\n\r\n";

        let css = header;
        Promise.all(promises).then(values => {
            values.forEach(value => {
                css += value;
            })
            callback(css);
        });
    }
}
