/**
 * ConfigurationOptionVisibility is used to determine when (if at all) a config option is visible
 * to the user.
 */
export enum ConfigurationOptionVisibility {
    /** The configoption is always visible in the settings UI */
    Always,

    /** The configoption is visible only to beta testers */
    Beta,

    /** The configoption is visible only to alpha testers */
    Alpha,

    /** The configoption is always hidden */
    Never
}
