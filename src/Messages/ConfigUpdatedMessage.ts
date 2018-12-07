import { RUSKConfig } from "../Configuration/RUSKConfig";

/**
 * A class sendt to tell our background script that the configuration has been updated
 */

export class ConfigUpdatedMessage {

    private readonly _config: string;

    /** Gets the updated RUSKConfig object */
    public get Config(): string {
        return this._config;
    }

    /** Creates a new instance of the ConfigUpdatedMessage class */
    constructor(config: string) {
        this._config = config;
    }
}
