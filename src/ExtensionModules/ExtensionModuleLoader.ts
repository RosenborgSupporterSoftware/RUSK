import { ExtensionModule } from "./ExtensionModule";
import { Brukertips } from "./EM_Brukertips";
import { TabTitles } from "./EM_TabTitles";
import { SeasonViews } from "./EM_SeasonViews";

/**
 * ExtensionModuleLoader
 * Loads all ExtensionModule classes from a path
 */

// TODO: Last inn fra generert JSON-fil med liste over moduler (når den eksisterer)
// TODO: Mat inn config fra sync storage til den enkelte modulen
export default function loadModules(path: string): Array<ExtensionModule> {
    return [
        new Brukertips(),
        new SeasonViews(),
        new TabTitles()
    ];
}
