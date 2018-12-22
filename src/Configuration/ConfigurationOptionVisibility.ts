/**
 * ConfigurationOptionVisibility is used to determine when (if at all) a config option is visible
 * to the user.
 */
export enum ConfigurationOptionVisibility {
    /** The configoption is always visible in the settings UI */
    Always = "COV_ALWAYS",

    /** The configoption is visible only to beta testers */
    Beta = "COV_BETA",

    /** The configoption is visible only to alpha testers */
    Alpha = "COV_ALPHA",

    /** The configoption is always hidden */
    Never = "COV_NEVER"
}
