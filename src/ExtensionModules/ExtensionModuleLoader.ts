import { ExtensionModule } from "./ExtensionModule";
import { Usertips } from "./EM_Usertips";
import { TabTitles } from "./EM_TabTitles";
import { SeasonViews } from "./EM_SeasonViews";
import { SignatureFilter } from "./EM_SignatureFilter";
import { ColorizeThreads } from "./EM_ColorizeThreads";
import { ImageCache } from "./EM_ImageCache";
import { InboxAlert } from "./EM_InboxAlert";
import { HighlightColor } from "./EM_HighlightColor";
import { UsernameTracker } from "./EM_UsernameTracker";
import { Empowerment } from "./EM_Empowerment";
import { ColorizeForums } from "./EM_ColorizeForums";
import { ColorizePosts } from "./EM_ColorizePosts";

/**
 * ExtensionModuleLoader
 * Loads all ExtensionModule classes from a path
 */

// TODO: Last inn fra generert JSON-fil med liste over moduler (når den eksisterer)
// TODO: Mat inn config fra sync storage til den enkelte modulen
export default function loadModules(path: string): Array<ExtensionModule> {
    return [
        new Usertips(),
        new SeasonViews(),
        new TabTitles(),
        new SignatureFilter(),
        new ColorizeThreads(),
        new ColorizeForums(),
        new ColorizePosts(),
        new ImageCache(),
        new InboxAlert(),
        new HighlightColor(),
        new UsernameTracker(),
        new Empowerment(),
    ];
}
