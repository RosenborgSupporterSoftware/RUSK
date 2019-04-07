import { ExtensionModule } from "./ExtensionModule";
import { Usertips } from "./EM_Usertips";
import { TabTitles } from "./EM_TabTitles";
import { SeasonViews } from "./EM_SeasonViews";
import { SignatureFilter } from "./EM_SignatureFilter";
import { ImageCache } from "./EM_ImageCache";
import { InboxAlert } from "./EM_InboxAlert";
import { TopicFilter } from "./EM_TopicFilter";
import { HighlightColor } from "./EM_HighlightColor";
import { UsernameTracker } from "./EM_UsernameTracker";
import { Empowerment } from "./EM_Empowerment";
import { UserFilter } from "./EM_UserFilter";
import { EnhancePosting } from "./EM_EnhancePosting";
import { ThreadTitleLinks } from "./EM_ThreadTitleLinks";
import { MediaEmbedder } from "./EM_MediaEmbedder";
import { PollEditor } from "./EM_PollEditor";
import { Log } from "../Utility/Log";
import { AvatarFilter } from "./EM_AvatarFilter";
import { AlternateSearchEngine } from "./EM_AlternateSearchEngine";
import { Bookmarks } from "./EM_Bookmarks";
import { ModPostTools } from "./EM_ModPostTools";
import { SpawnWindow } from "./EM_SpawnWindow";
import { RelativeForumWidth } from "./EM_RelativeForumWidth"
import { QuickReply } from "./EM_QuickReply";
import { Colorize } from "./EM_Colorize";
import { KeyboardNavigation } from "./EM_KeyboardNavigation";
import { ConfigUI } from "./EM_ConfigUI";
import { UnreadTracker } from "./EM_UnreadTracker";

/**
 * ExtensionModuleLoader
 * Loads all ExtensionModule classes from a path
 */

// TODO: Last inn fra generert JSON-fil med liste over moduler (når den eksisterer)
export default function loadModules(path: string): Array<ExtensionModule> {
    let allModules = [
        new ConfigUI(),
        new Empowerment(),
        new UnreadTracker(),
        new KeyboardNavigation(),
        new RelativeForumWidth(),
        new Usertips(),
        new SeasonViews(),
        new TabTitles(),
        new TopicFilter(),
        new SignatureFilter(),
        new MediaEmbedder(),
        new ImageCache(),
        new InboxAlert(),
        new HighlightColor(),
        new UsernameTracker(),
        new PollEditor(),
        new UserFilter(),
        new EnhancePosting(),
        new AvatarFilter(),
        new ThreadTitleLinks(),
        new Colorize(),
        new AlternateSearchEngine(),
        new Bookmarks(),
        new QuickReply(),
        new SpawnWindow(),
        new ModPostTools(),
    ];

    verifyModules(allModules);

    return allModules;
}

/**
 * Simple function that does some preflight checks on modules and reports errors to the dev console.
 * This could probably done in a more modular, sane way.
 * @param modules - The modules to verify
 */
function verifyModules(modules: Array<ExtensionModule>) {

    modules.forEach(mod => {
        if (isNullOrEmpty(mod.name)) Log.Error('Module with empty name detected - can\'t tell you which one though.');
        if (mod.name.indexOf(' ') != -1) Log.Error(mod.name + ': Modules should not have spaces in their names (were you thinking of the displayName?)!');
        let cfg = mod.configSpec();
        if (mod.name != cfg.moduleName) Log.Error(mod.name + ': Module names needs to match in config spec and module');
        if (cfg.moduleVisible && isNullOrEmpty(cfg.displayName)) Log.Error(mod.name + ': A visible module needs a display name');
        if (cfg.moduleVisible && isNullOrEmpty(cfg.moduleDescription)) Log.Error(mod.name + ': A visible module needs a description');
    });
}

function isNullOrEmpty(str: string): boolean { return !str }
