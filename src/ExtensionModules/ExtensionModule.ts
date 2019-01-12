import { ConfigOptions } from "../Configuration/ConfigOptions";
import { PageContext } from "../Context/PageContext";
import { RBKwebPageType } from "../Context/RBKwebPageType";
import { ModuleConfiguration } from "../Configuration/ModuleConfiguration";
import { RUSKUI } from "../UI/RUSKUI";

/**
 * Represents a module that adds some kind of functionality to RBKweb.
 * Modules must implement this interface in order to be run by the extension.
 */

export interface ExtensionModule {

    /**
     * Gets the name of the ExtensionModule
     * Used in runBefore / runAfter
     */
    readonly name: string;

    /**
     * Gets an array of RBKwebPageType enum instances.
     * These instances informs the extension which RBKweb pages the ExtensionModule needs to run on.
     * Plain and simple - if the current page type is in this array, the ExtensionModule will be executed.
     */
    readonly pageTypesToRunOn: Array<RBKwebPageType>;

    /**
     * Indicate the names of other ExtensionModule objects we would prefer to run before.
     * It is entirely possible to create a mess of this, so take care to think things through.
     */
    readonly runBefore: Array<string>;

    /**
     * Indicate the names of other ExtensionModule objects we would prefer to run after.
     * It is entirely possible to create a mess of this, so take care to think things through.
     */
    readonly runAfter: Array<string>;

    /**
     * Gets a collection of options objects that represent the settings available for this module.
     */
    configSpec(): ModuleConfiguration;

    /**
     * Called when the ExtensionModule should execute its' functionality.
     */
    execute(context: PageContext): void;

    /**
     * Called when RUSK wants an ExtensionModule to initialize itself with a new configuration
     * @param config - The ModuleConfiguration for this ExtensionModule
     * @returns A RUSKUI object containing UI modifications, or null if none are desired
     */
    init(config: ModuleConfiguration): RUSKUI;

    /**
     * Called when RUSK wants the module to preprocess the current page
     */
    preprocess(context: PageContext): void;

    /**
     * Called when RUSK needs to invoke a command on the ExtensionModule. Initially used for hotkeys, can be used for anything.
     * @param command - The name of the command to invoke
     */
    invoke(command: string): boolean;
}
