import { ExtensionModule } from "./ExtensionModule";
import { PageContext } from "../Context/PageContext";
import { ModuleConfiguration } from "../Configuration/ModuleConfiguration";
import { RUSKUI } from "../UI/RUSKUI";
import { RBKwebPageType } from "../Context/RBKwebPageType";

export abstract class ModuleBase implements ExtensionModule {

    protected _cfg: ModuleConfiguration;

    abstract name: string;
    abstract pageTypesToRunOn: RBKwebPageType[];


    runBefore: string[];
    runAfter: string[];

    abstract configSpec(): ModuleConfiguration;

    preprocess(context: PageContext): void {
        // No-op unless overridden
    }

    abstract execute(context: PageContext): void;

    init(config: ModuleConfiguration): RUSKUI {
        this._cfg = config;

        return null; // Override if you want to do more init work or return a RUSKUI object
    }

    invoke(command: string): boolean {
        // No-op unless overridden
        return false;
    }
}