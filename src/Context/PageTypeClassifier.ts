import { ExtensionModule } from "../ExtensionModules/ExtensionModule";
import { RBKwebPageType } from "./RBKwebPageType";

/**
 * PageTypeClassifier is the single source of truth for what should run where
 */

export class PageTypeClassifier {

    /**
     * Check if an Extensionmodule should run on a RBKwebPageType
     * @param module - The ExtensionModule object to test
     * @param pageType - The RBKwebPageType we're currently on
     */
    public static ShouldRunOnPage(module: ExtensionModule, pageType: RBKwebPageType): boolean {

        debugger;

        if(module.pageTypesToRunOn.indexOf(RBKwebPageType.RBKweb_ALL) >= 0) {
            // Vi er happy på alle sider
            return true;
        }

        if(module.pageTypesToRunOn.indexOf(RBKwebPageType.RBKweb_FORUM_ALL) >= 0) {
            // Alle forumsider!
            if(pageType > RBKwebPageType.RBKweb_FORUM_START && pageType < RBKwebPageType.RBKweb_FORUM_END) {
                return true;
            }
        }

        if(module.pageTypesToRunOn.indexOf(pageType) >= 0) {
            return true;
        }
        
        return false;
    }
}