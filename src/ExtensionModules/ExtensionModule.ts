import { ConfigOptions } from "../Configuration/ConfigOptions";
import { PageContext } from "../Context/PageContext";
import { RBKwebPageType } from "../Context/RBKwebPageType";

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
    getConfigOptions(): ConfigOptions;

    /**
     * Called when the ExtensionModule should execute its' functionality.
     */
    execute(context: PageContext): void;

    // TODO: Mekanisme for å ta imot config fra rammeverket
    // TODO: Metode for å gi fra seg config til rammeverket
}
